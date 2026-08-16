#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile, readdir, rm, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { writeFileAtomic, withFileLock } from "@deepseek-ai/dsh-atomic-write";
import { dshHomePath, resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { compareVersions, currentVersion, fetchLatestReleaseInfo } from "./version.js";
/**
 * dsh-archived —— 已归档会话管理 CLI。
 *
 * 写操作优先走运行中的 DSH web 网关（Typert endpoint），保证与宿主内存状态
 * 和浏览器 UI 实时一致。DSH 未运行时退化为离线模式：直接修改
 * ~/.dsh/storages/workspace.json 并删除日志目录。若 DSH 在运行但插件端点
 * 不可用（未安装/未重启），拒绝离线写入，避免网关之后用旧状态覆盖磁盘。
 */
const PACKAGE_JSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const VERSION = PACKAGE_JSON.version ?? "0.0.0";
const DEFAULT_PORT = 3080;
const NAMESPACE = "archivedSessions";
class CliError extends Error {
}
function fail(message) {
    throw new CliError(message);
}
function help() {
    console.log(`dsh-archived ${VERSION}

用法：
  dsh-archived list                        列出已归档会话（按归档时间倒序）
  dsh-archived restore <session-id>        恢复一个归档会话
  dsh-archived delete <session-id> [--yes] 删除一个归档会话及其日志目录
  dsh-archived update [--yes]              检查并更新插件（默认 --profile web）

选项：
  --port <n>       DSH web 端口（默认读取 ~/.dsh/web.stdout.log，回退 3080）
  --profile <name> update 目标配置（默认 web）
  --offline        强制离线操作（DSH 未运行时直接修改本地文件）
  --json        list 输出 JSON
  --yes         delete 跳过确认
  -h, --help    显示本帮助
  -v, --version 显示版本

说明：
  - 归档和恢复只支持一次一个会话，不支持批量。
  - 恢复只移出归档集合，会话回到原工作区原位置。
  - 删除会移除会话日志目录、工作区席位和归档记录，不可恢复。`);
    process.exit(0);
}
function parseArgs(argv) {
    let offline = false;
    let json = false;
    let yes = false;
    let port = 0;
    let profile = "web";
    const positionals = [];
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--offline")
            offline = true;
        else if (arg === "--json")
            json = true;
        else if (arg === "--yes" || arg === "-y")
            yes = true;
        else if (arg === "--port") {
            port = Number(argv[++i]);
            if (!Number.isInteger(port) || port <= 0 || port > 65535)
                fail(`无效端口：${argv[i]}`);
        }
        else if (arg.startsWith("--port=")) {
            port = Number(arg.slice("--port=".length));
            if (!Number.isInteger(port) || port <= 0 || port > 65535)
                fail(`无效端口：${arg}`);
        }
        else if (arg === "--profile") {
            profile = argv[++i];
            if (profile === undefined || profile === "")
                fail("--profile 需要一个配置名参数");
        }
        else if (arg.startsWith("--profile=")) {
            profile = arg.slice("--profile=".length);
            if (profile === "")
                fail("--profile 需要一个配置名参数");
        }
        else if (arg === "-h" || arg === "--help")
            help();
        else if (arg === "-v" || arg === "--version") {
            console.log(VERSION);
            process.exit(0);
        }
        else if (arg.startsWith("-"))
            fail(`未知选项：${arg}`);
        else
            positionals.push(arg);
    }
    const command = positionals[0];
    const sessionId = positionals[1];
    return { command, sessionId, options: { port, offline, json, yes, profile } };
}
async function discoverPort(explicit) {
    if (explicit > 0)
        return explicit;
    try {
        const log = await readFile(join(resolveDshHome(), "web.stdout.log"), "utf8");
        const match = log.match(/https?:\/\/(?:127\.0\.0\.1|localhost):(\d+)/);
        if (match !== null)
            return Number(match[1]);
    }
    catch {
        // 无日志文件则回退默认端口。
    }
    return DEFAULT_PORT;
}
/** 与 DSH 0.1.0-rc.6 的 JSONL 布局保持一致的路径段编码。 */
function encodeSegment(raw) {
    if (raw.length === 0)
        throw new Error("cannot encode an empty path segment");
    if (raw === ".")
        return "~002E";
    if (raw === "..")
        return "~002E~002E";
    let out = "";
    for (let i = 0; i < raw.length; i++) {
        const code = raw.charCodeAt(i);
        const ch = String.fromCharCode(code);
        if (ch !== "~" && /^[A-Za-z0-9._-]$/.test(ch))
            out += ch;
        else
            out += "~" + code.toString(16).toUpperCase().padStart(4, "0");
    }
    return out;
}
/** 离线扫描 sessions root 下两级目录，找到某会话自有的日志目录。 */
async function findSessionDir(id) {
    const root = dshHomePath("sessions");
    let projects;
    try {
        projects = await readdir(root, { withFileTypes: true });
    }
    catch (error) {
        if (error?.code === "ENOENT")
            return undefined;
        throw error;
    }
    const encoded = encodeSegment(id);
    for (const project of projects) {
        if (!project.isDirectory())
            continue;
        let entries;
        try {
            entries = await readdir(join(root, project.name), { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name === encoded)
                return join(root, project.name, entry.name);
        }
    }
    return undefined;
}
async function loadWorkspaceDoc() {
    const file = dshHomePath("storages", "workspace.json");
    try {
        return JSON.parse(await readFile(file, "utf8"));
    }
    catch (error) {
        if (error?.code === "ENOENT")
            fail("未找到 workspace 存储文件；DSH 可能尚未初始化。");
        throw error;
    }
}
/**
 * 读-改-写 workspace 存储。重新读盘后再应用 mutator，避免与其它进程的写
 * 竞争；写入失败时抛出异常，调用方不继续后续破坏性步骤。
 */
async function mutateWorkspaceDoc(mutator) {
    const file = dshHomePath("storages", "workspace.json");
    await withFileLock(file, async () => {
        const current = JSON.parse(await readFile(file, "utf8"));
        mutator(current);
        await writeFileAtomic(file, JSON.stringify(current, null, 2) + "\n", { mode: 0o600 });
    });
}
function archivedIdsOf(doc) {
    const ids = doc.global?.archivedSessionIds;
    return Array.isArray(ids) ? ids.map(String) : [];
}
function workspaceForSession(doc, sessionId) {
    for (const record of Object.values(doc.tables?.workspaces ?? {})) {
        if ((record.sessionIds ?? []).some((id) => String(id) === sessionId))
            return record;
    }
    return undefined;
}
async function onlineCall(port, method, sessionId) {
    const endpoint = `${NAMESPACE}/${method}`;
    const rpcId = randomUUID();
    const payload = sessionId === undefined ? { args: {} } : { args: { sessionId } };
    const envelope = { type: "client-request", rpcId, method: endpoint, payload };
    const response = await fetch(`http://127.0.0.1:${port}/api/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`DSH web 正在运行，但 ${endpoint} 端点不可用。请确认插件已安装并重启 DSH。`);
        }
        throw new Error(`DSH web 返回 HTTP ${response.status}`);
    }
    const body = await response.json();
    if (body?.type !== "server-response")
        throw new Error("DSH web 返回了无法识别的响应信封");
    if (!body.result?.ok)
        throw new Error(body.result?.error?.message ?? `调用 ${endpoint} 失败`);
    return body.result.value;
}
async function tryOnline(port, method, sessionId) {
    try {
        return { ok: true, value: await onlineCall(port, method, sessionId) };
    }
    catch (error) {
        const code = error?.cause?.code ?? error?.code;
        if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ECONNRESET" || error?.name === "AbortError" || error?.name === "TimeoutError") {
            return { ok: false, reason: "down", message: error.message };
        }
        // 收到 HTTP 应答（包括 404）说明 DSH 在运行；此时不允许离线写覆盖。
        if (error?.message?.includes("端点不可用") || error?.message?.includes("HTTP ")) {
            return { ok: false, reason: "running", message: error.message };
        }
        return { ok: false, reason: "error", message: error.message };
    }
}
function printRows(rows, json, offline) {
    if (json) {
        console.log(JSON.stringify({ mode: offline ? "offline" : "online", sessions: rows }, null, 2));
        return;
    }
    if (rows.length === 0) {
        console.log("暂无已归档会话。");
        return;
    }
    for (const [index, row] of rows.entries()) {
        const date = row.fileModifiedAt ?? row.createdAt;
        const dateText = date === null || date === undefined ? "未知" : new Date(date).toLocaleString();
        const workspace = row.workspaceTitle ?? row.cwd ?? "(未分组)";
        const file = row.artifactPath ?? "(未找到日志文件)";
        console.log(`[${index + 1}] ${row.id}`);
        console.log(`    工作区: ${workspace}`);
        console.log(`    时间:   ${dateText}`);
        console.log(`    日志:   ${file}`);
        if (row.live)
            console.log(`    状态:   运行中`);
    }
}
async function askYesNo(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return await new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(/^(y|yes|是)$/i.test(answer.trim()));
        });
    });
}
async function offlineRows() {
    const doc = await loadWorkspaceDoc();
    const rows = [];
    for (const id of archivedIdsOf(doc).reverse()) {
        const workspace = workspaceForSession(doc, id);
        const sessionDir = await findSessionDir(id);
        let fileModifiedAt = null;
        if (sessionDir !== undefined) {
            try {
                fileModifiedAt = (await stat(sessionDir)).mtimeMs;
            }
            catch {
                // 忽略 stat 失败。
            }
        }
        rows.push({
            id,
            workspaceTitle: workspace?.title,
            cwd: workspace?.path,
            createdAt: null,
            live: false,
            artifactPath: sessionDir,
            fileModifiedAt
        });
    }
    return rows;
}
function runPluginAdd(profile, downloadUrl) {
    return new Promise((resolve) => {
        const child = spawn("dsh", ["plugin", "--profile", profile, "add", downloadUrl], {
            stdio: "inherit",
            shell: process.platform === "win32"
        });
        child.on("error", () => resolve(127));
        child.on("close", (code) => resolve(code ?? 1));
    });
}
async function commandUpdate(options) {
    const current = currentVersion();
    const release = await fetchLatestReleaseInfo();
    if (release === undefined) {
        console.error("无法获取最新版本（网络不可达、仓库不存在或尚无 Release）。");
        process.exitCode = 1;
        return;
    }
    if (compareVersions(release.version, current) <= 0) {
        console.log(`当前已是最新版本 v${current}`);
        return;
    }
    console.log(`当前版本 v${current}，最新版本 v${release.version}`);
    console.log(`目标 profile：${options.profile}（如需其他 profile 请使用 --profile <name>）`);
    if (!options.yes) {
        const confirmed = await askYesNo(`是否更新到 v${release.version}？将运行 dsh plugin --profile ${options.profile} add ${release.downloadUrl} (y/N): `);
        if (!confirmed) {
            console.log("已取消");
            return;
        }
    }
    const exit = await runPluginAdd(options.profile, release.downloadUrl);
    if (exit === 0)
        console.log(`更新完成：v${release.version}（宿主端有改动时需重启网关生效）`);
    process.exitCode = exit;
}
async function commandList(options, port) {
    if (options.offline) {
        printRows(await offlineRows(), options.json, true);
        return;
    }
    const online = await tryOnline(port, "list");
    if (online.ok) {
        const sessions = Array.isArray(online.value?.sessions) ? online.value.sessions : [];
        printRows(sessions.map((row) => ({
            id: String(row.id),
            workspaceTitle: row.workspaceTitle,
            cwd: row.cwd,
            createdAt: Number.isFinite(row.createdAt) ? row.createdAt : null,
            live: row.live === true,
            artifactPath: row.artifactPath
        })), options.json, false);
        return;
    }
    if (online.reason === "running") {
        console.warn(online.message + "；以下为只读离线列表。");
    }
    else if (online.reason === "error") {
        fail(online.message);
    }
    else {
        console.warn("DSH web 未运行；以下为只读离线列表。");
    }
    // 离线列表：顺序来自 workspace.json 的归档追加顺序，倒序 = 最近归档在前。
    printRows(await offlineRows(), options.json, true);
}
async function commandRestore(sessionId, options, port) {
    if (sessionId === undefined || sessionId.trim() === "")
        fail("restore 需要一个会话 id");
    if (!options.offline) {
        const online = await tryOnline(port, "restore", sessionId);
        if (online.ok) {
            console.log(`已恢复归档会话：${sessionId}`);
            return;
        }
        if (online.reason !== "down")
            fail(online.message);
    }
    // 离线恢复：只从 archivedSessionIds 移除，工作区席位保留。
    await mutateWorkspaceDoc((doc) => {
        const archived = archivedIdsOf(doc);
        if (!archived.includes(sessionId))
            throw new Error(`会话不在已归档列表中：${sessionId}`);
        doc.global = doc.global ?? {};
        doc.global.archivedSessionIds = archived.filter((id) => id !== sessionId);
    });
    console.log(`已离线恢复归档会话：${sessionId}`);
    console.log("提示：重启 DSH 后侧边栏将显示该会话（保留原工作区位置）。");
}
async function commandDelete(sessionId, options, port) {
    if (sessionId === undefined || sessionId.trim() === "")
        fail("delete 需要一个会话 id");
    const onlineForInfo = options.offline ? { ok: false, reason: "down", message: "" } : await tryOnline(port, "list");
    let workspaceLabel;
    if (onlineForInfo.ok) {
        const row = (onlineForInfo.value?.sessions ?? []).find((item) => String(item.id) === sessionId);
        workspaceLabel = row?.workspaceTitle ?? row?.cwd;
    }
    else if (onlineForInfo.reason === "down") {
        const doc = await loadWorkspaceDoc();
        const workspace = workspaceForSession(doc, sessionId);
        workspaceLabel = workspace?.title ?? workspace?.path;
    }
    else if (onlineForInfo.reason === "error") {
        fail(onlineForInfo.message);
    }
    else {
        fail(onlineForInfo.message);
    }
    if (!options.yes) {
        if (!process.stdin.isTTY)
            fail("非交互终端删除需要显式传入 --yes");
        const confirmed = await askYesNo(`确认永久删除归档会话 ${sessionId}${workspaceLabel === undefined ? "" : `（${workspaceLabel}）`} 及其日志目录？[y/N] `);
        if (!confirmed) {
            console.log("已取消。");
            return;
        }
    }
    if (!options.offline) {
        const online = await tryOnline(port, "delete", sessionId);
        if (online.ok) {
            console.log(`已删除归档会话及其日志目录：${sessionId}`);
            return;
        }
        if (online.reason !== "down")
            fail(online.message);
    }
    // 离线删除：先删日志目录，成功后再清理归档集合与工作区席位。
    const sessionDir = await findSessionDir(sessionId);
    if (sessionDir !== undefined) {
        console.log(`删除会话日志目录：${sessionDir}`);
        await rm(sessionDir, { recursive: true, force: true });
    }
    else {
        console.warn("未找到会话日志目录（可能此前已删除），继续清理归档记录。");
    }
    await mutateWorkspaceDoc((doc) => {
        const archived = archivedIdsOf(doc);
        if (!archived.includes(sessionId))
            throw new Error(`会话不在已归档列表中：${sessionId}`);
        doc.global = doc.global ?? {};
        doc.global.archivedSessionIds = archived.filter((id) => id !== sessionId);
        for (const record of Object.values(doc.tables?.workspaces ?? {})) {
            record.sessionIds = (record.sessionIds ?? []).filter((id) => String(id) !== sessionId);
        }
    });
    console.log(`已离线删除归档会话：${sessionId}`);
    console.log("提示：重启 DSH 后所有列表将完全收敛。");
}
async function main() {
    const { command, sessionId, options } = parseArgs(process.argv.slice(2));
    if (command === undefined)
        help();
    const port = await discoverPort(options.port);
    if (command === "list")
        await commandList(options, port);
    else if (command === "restore")
        await commandRestore(sessionId, options, port);
    else if (command === "delete")
        await commandDelete(sessionId, options, port);
    else if (command === "update")
        await commandUpdate(options);
    else
        fail(`未知命令：${command}`);
}
void main().catch((error) => {
    console.error(`dsh-archived: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
});
