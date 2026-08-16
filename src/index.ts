import { dirname } from "node:path";
import { rm } from "node:fs/promises";
import { z } from "zod";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { compareVersions, currentVersion, fetchLatestReleaseInfo } from "./version.js";

/**
 * dsh-archived-sessions —— 宿主半区。
 *
 * DSH 0.1.0-rc.6 的 workspace registry 只提供 `archiveSession`，没有
 * unarchive/delete。本插件：
 *   1. 给 workspaceRegistry 实例安装一个与官方 archiveSession 对称的
 *      unarchiveSession 能力补丁（复用其 enqueueOperation/setState 写链，
 *      因此写操作仍然串行化，并会触发 domain/changed 让浏览器收到
 *      host/archived-sessions-changed）；
 *   2. 通过 Typert 暴露 list/checkUpdate/restore/delete 远程方法给设置页与 CLI；
 *   3. delete 同时移除本地 session 日志目录（用户确认的范围）和
 *      workspace.sessionIds 席位，然后才移出归档集合。
 */
export const name = "archived-sessions";
export const inject = ["typert", "workspaceRegistry", "sessionPersistence", "sessions"];

// ── Typert wire schemas（zod v4）───────────────────────────────────────────

const sessionIdSchema = z.string().min(1);

const archivedSessionSchema = z.object({
  id: z.string(),
  createdAt: z.number().nullable(),
  cwd: z.string().optional(),
  workspaceId: z.string().optional(),
  workspaceTitle: z.string().optional(),
  live: z.boolean(),
  artifactPath: z.string().nullable().optional()
});

const listResultSchema = z.object({ sessions: z.array(archivedSessionSchema) });

const archivedSetResultSchema = z.object({
  archivedSessionIds: z.array(z.string())
});

const deleteResultSchema = z.object({
  deleted: z.literal(true),
  archivedSessionIds: z.array(z.string())
});

const updateCheckResultSchema = z.object({
  current: z.string(),
  latest: z.string(),
  updateAvailable: z.boolean()
});

/** 注册到 API 网关的类型化 wire 描述符。 */
const MANIFEST = {
  package: "dsh-archived-sessions",
  face: "host",
  schemas: [],
  invocations: [
    {
      id: "dsh-archived-sessions#archivedSessions/list",
      service: "archivedSessions",
      namespace: "archivedSessions",
      method: "list",
      invocation: { kind: "direct" },
      parameters: [],
      result: {
        mode: "strict",
        typeSymbol: "dsh-archived-sessions#ArchivedSessionListResult",
        schema: listResultSchema
      }
    },
    {
      id: "dsh-archived-sessions#archivedSessions/checkUpdate",
      service: "archivedSessions",
      namespace: "archivedSessions",
      method: "checkUpdate",
      invocation: { kind: "direct" },
      parameters: [],
      result: {
        mode: "strict",
        typeSymbol: "dsh-archived-sessions#UpdateCheckResult",
        schema: updateCheckResultSchema
      }
    },
    {
      id: "dsh-archived-sessions#archivedSessions/restore",
      service: "archivedSessions",
      namespace: "archivedSessions",
      method: "restore",
      invocation: { kind: "direct" },
      parameters: [
        {
          name: "sessionId",
          wire: "sessionId",
          source: "json",
          codec: {
            mode: "strict",
            typeSymbol: "dsh-archived-sessions#SessionId",
            schema: sessionIdSchema
          }
        }
      ],
      result: {
        mode: "strict",
        typeSymbol: "dsh-archived-sessions#ArchivedSetResult",
        schema: archivedSetResultSchema
      }
    },
    {
      id: "dsh-archived-sessions#archivedSessions/delete",
      service: "archivedSessions",
      namespace: "archivedSessions",
      method: "delete",
      invocation: { kind: "direct" },
      parameters: [
        {
          name: "sessionId",
          wire: "sessionId",
          source: "json",
          codec: {
            mode: "strict",
            typeSymbol: "dsh-archived-sessions#SessionId",
            schema: sessionIdSchema
          }
        }
      ],
      result: {
        mode: "strict",
        typeSymbol: "dsh-archived-sessions#DeleteArchivedSessionResult",
        schema: deleteResultSchema
      }
    }
  ]
};

// ── workspaceRegistry 能力补丁 ─────────────────────────────────────────────

const PATCH_MARKER = Symbol.for("dsh-archived-sessions.workspace-patch");

function assertPatchable(registry: any) {
  if (typeof registry?.enqueueOperation !== "function") {
    throw new Error("workspaceRegistry.enqueueOperation is unavailable; this plugin requires DSH 0.1.0-rc.x workspace internals");
  }
  if (typeof registry?.requireState !== "function") {
    throw new Error("workspaceRegistry.requireState is unavailable; this plugin requires DSH 0.1.0-rc.x workspace internals");
  }
  if (typeof registry?.setState !== "function") {
    throw new Error("workspaceRegistry.setState is unavailable; this plugin requires DSH 0.1.0-rc.x workspace internals");
  }
}

/**
 * Install `unarchiveSession` on one registry instance. The implementation is
 * symmetric to the official archiveSession: serialized through the registry's
 * own operation tail and committed through setState, so the storage-domain
 * change notification reaches the web gateway (host/archived-sessions-changed).
 */
function installUnarchivePatch(ctx: any, registry: any): () => void {
  if (typeof registry?.unarchiveSession === "function") {
    ctx.logger.info("workspaceRegistry already exposes unarchiveSession; using the existing implementation");
    return () => {};
  }
  assertPatchable(registry);

  const implementation = async function unarchiveSession(this: any, sessionId: any) {
    return await this.enqueueOperation(async () => {
      const state = this.requireState();
      const archivedSessionIds = Array.isArray(state?.archivedSessionIds) ? state.archivedSessionIds : [];
      if (!archivedSessionIds.includes(sessionId)) return archivedSessionIds;
      const next = {
        ...state,
        archivedSessionIds: archivedSessionIds.filter((id: any) => id !== sessionId)
      };
      await this.setState(next);
      return next.archivedSessionIds;
    });
  };
  Object.defineProperty(implementation, PATCH_MARKER, { value: true });
  Object.defineProperty(registry, "unarchiveSession", {
    configurable: true,
    writable: true,
    value: implementation
  });
  ctx.logger.info("installed workspaceRegistry.unarchiveSession capability patch");

  return () => {
    if ((registry as any).unarchiveSession === implementation) {
      delete (registry as any).unarchiveSession;
    }
  };
}

// ── 远程服务实现 ───────────────────────────────────────────────────────────

class ArchivedSessionsGateway extends TypertRemoteService {
  constructor(ctx: any) {
    super(ctx, "archivedSessions");
  }

  get C(): any {
    return this.ctx as any;
  }

  get registry(): any {
    return this.C.workspaceRegistry;
  }

  get persistence(): any {
    return this.C.sessionPersistence;
  }

  get sessions(): any {
    return this.C.sessions;
  }

  private assertArchived(sessionId: any) {
    const archivedSessionIds = this.registry.archivedSessionIds as readonly string[];
    if (!archivedSessionIds.includes(sessionId)) {
      throw new Error(`会话不在已归档列表中：${sessionId}`);
    }
  }

  private async unarchive(sessionId: any): Promise<readonly string[]> {
    const fn = (this.registry as any).unarchiveSession;
    if (typeof fn !== "function") {
      throw new Error("workspaceRegistry.unarchiveSession 不可用");
    }
    const archivedSessionIds = await fn.call(this.registry, sessionId);
    return Array.isArray(archivedSessionIds) ? archivedSessionIds : [];
  }

  /**
   * List archived sessions in archive order, newest archive first.
   * Only metadata is read here; the settings page uses the client-side session
   * list for titles, while the CLI uses this endpoint.
   */
  async list() {
    const archivedIds = [...(this.registry.archivedSessionIds as readonly string[])];
    const headers = await this.persistence.list();
    const headerById = new Map<string, any>();
    for (const header of headers) headerById.set(String(header.id), header);

    const workspaceById = new Map<string, any>();
    const workspaceBySession = new Map<string, any>();
    for (const workspace of this.registry.list()) {
      workspaceById.set(String(workspace.id), workspace);
      for (const sessionId of workspace.sessionIds) {
        workspaceBySession.set(String(sessionId), workspace);
      }
    }

    const liveIds = new Set((this.sessions.list() as any[]).map((session) => String(session.id)));

    const sessions = archivedIds.reverse().map((id) => {
      const header = headerById.get(id);
      const workspace = workspaceBySession.get(id);
      const artifactPath = header === undefined ? null : (this.persistence.locate?.(header)?.path ?? null);
      return {
        id,
        createdAt: header === undefined || !Number.isFinite(header.createdAt) ? null : header.createdAt,
        ...(header?.cwd === undefined ? {} : { cwd: header.cwd }),
        ...(workspace === undefined ? {} : { workspaceId: String(workspace.id), workspaceTitle: workspace.title }),
        live: liveIds.has(id),
        artifactPath
      };
    });

    return { sessions };
  }

  /** 静默版本对比：拿不到最新版本时抛错，由客户端决定不显示。 */
  async checkUpdate() {
    const current = currentVersion();
    const release = await fetchLatestReleaseInfo();
    if (release === undefined) throw new Error("无法获取最新版本信息");
    return {
      current,
      latest: release.version,
      updateAvailable: compareVersions(release.version, current) > 0
    };
  }

  /** 恢复归档：只移出归档集合，workspace 席位保留，因此回到原工作区原位置。 */
  async restore(sessionId: any) {
    this.assertArchived(sessionId);
    const archivedSessionIds = await this.unarchive(sessionId);
    return { archivedSessionIds: [...archivedSessionIds] };
  }

  /** 删除归档：先删会话日志目录，再清 workspace 席位，最后移出归档集合。 */
  async delete(sessionId: any) {
    this.assertArchived(sessionId);

    // 活跃会话不能删：否则内存中的 Session 可能继续写回已删除目录。
    if (this.sessions.get(sessionId) !== undefined) {
      throw new Error("该会话当前仍处于活动状态，不能删除；请先结束会话后重试");
    }

    // 1. 删除持久化日志。JSONL 后端一个会话一个目录；这里删除 locate 到的
    //    transcript 的父目录（即该会话自有目录）。
    const headers = await this.persistence.list();
    const header = headers.find((candidate: any) => String(candidate.id) === sessionId);
    if (header !== undefined) {
      const location = this.persistence.locate?.(header);
      if (location?.path) {
        const sessionDir = dirname(location.path);
        this.ctx.logger.info("deleting archived session log directory: %s", sessionDir);
        await rm(sessionDir, { recursive: true, force: true });
      }
    }

    // 2. 从所有 workspace 的 sessionIds 席位中移除（方案 B）。
    for (const workspace of this.registry.list()) {
      if ((workspace.sessionIds as readonly string[]).includes(sessionId)) {
        await workspace.detachSession(sessionId);
      }
    }

    // 3. 最后移出归档集合。文件删除或席位清理失败都会保留归档集合，可重试。
    const archivedSessionIds = await this.unarchive(sessionId);
    return { deleted: true, archivedSessionIds: [...archivedSessionIds] };
  }
}

export function apply(ctx: any) {
  const unpatch = installUnarchivePatch(ctx, ctx.workspaceRegistry);
  ctx.effect(() => () => unpatch(), "archived-sessions: workspace unarchive patch");

  new ArchivedSessionsGateway(ctx);
  ctx.effect(() => ctx.typert.register(MANIFEST), "archived-sessions: typert manifest");
}
