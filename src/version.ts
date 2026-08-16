/**
 * dsh-archived-sessions —— 版本检查工具（CLI 与宿主共用）。
 *
 * 当前版本取自本插件自己的 package.json；最新版本通过 GitHub 的
 * releases/latest HTML 端点解析（302 到 /releases/tag/v<版本>），避免
 * 未认证 api.github.com 的每小时 IP 限流。发行包约定使用
 * `dsh-archived-sessions-<version>.tgz` 文件名，更新命令直接下载该 asset。
 */
import { readFileSync } from "node:fs";

export interface ReleaseInfo {
  /** 去掉 v 前缀的语义版本号。 */
  version: string;
  /** GitHub tag（可能带 v 前缀）。 */
  tag: string;
  /** 约定的发行包下载地址。 */
  downloadUrl: string;
}

interface PackageInfo {
  name?: string;
  version?: string;
  repository?: string | { type?: string; url?: string };
}

export function packageInfo(): PackageInfo {
  try {
    return JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as PackageInfo;
  } catch {
    return {};
  }
}

/** 当前安装的插件版本；读取失败回退 0.0.0。 */
export function currentVersion(): string {
  const version = packageInfo().version;
  return typeof version === "string" && version !== "" ? version : "0.0.0";
}

function githubRepository(): { owner: string; repo: string } | undefined {
  const repository = packageInfo().repository;
  const url = typeof repository === "string" ? repository : repository?.url;
  if (typeof url !== "string") return undefined;
  const match = url.match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?\/?$/);
  if (match === null) return undefined;
  return { owner: match[1], repo: match[2] };
}

/**
 * 拉取最新 Release 信息；网络失败、仓库尚无 Release、解析失败都返回
 * `undefined`（调用方决定是否显示）。
 *
 * 手动 AbortController + 消费响应体：AbortSignal.timeout 的隐式定时器与
 * 未消费的 body 在 Windows 上退出时可能触发 libuv 断言。
 */
export async function fetchLatestReleaseInfo(): Promise<ReleaseInfo | undefined> {
  const repository = githubRepository();
  const packageName = packageInfo().name;
  if (repository === undefined || packageName === undefined) return undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://github.com/${repository.owner}/${repository.repo}/releases/latest`, {
      headers: { "User-Agent": packageName },
      redirect: "follow",
      signal: controller.signal
    });
    const finalUrl = response.url ?? "";
    await response.body?.cancel().catch(() => {});
    if (!response.ok) return undefined;
    const tag = finalUrl.split("/tag/").pop();
    if (tag === undefined || tag === "" || tag === finalUrl) return undefined;
    const version = tag.replace(/^v/, "");
    if (version === "") return undefined;
    return {
      version,
      tag,
      downloadUrl: `https://github.com/${repository.owner}/${repository.repo}/releases/download/${tag}/${packageName}-${version}.tgz`
    };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/** 简易 semver 比较：a > b 返回正数、a < b 返回负数、相等返回 0。 */
export function compareVersions(a: string, b: string): number {
  const pa = String(a).replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b).replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
