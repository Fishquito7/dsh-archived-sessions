window.__ModuleLoader__.load({
    id: "dsh-archived-sessions",
    factory: (require) => {
        const bundleModule = { exports: {} };
        Object.defineProperty(bundleModule.exports, Symbol.toStringTag, { value: "Module" });
        // 束契约：本文件由宿主以 /plugins/dsh-archived-sessions/client.js 提供，
        // 只能 require 外壳种子词。settings.section 无 navIcon 扩展点，归档图标
        // 复用侧栏三点菜单的 IconArchiveOutline20 同一份 SVG path，通过 CSS mask
        // 绘制并继承 nav 按钮的 currentColor（跟随主题变量，不写死颜色）。
        const react_jsx_runtime = require("react/jsx-runtime");
        const react = require("react");
        const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
        // ── 官方 IconArchiveOutline20 的 SVG path（与侧栏菜单完全一致）─────────
        const ARCHIVE_PATH_LID = "M15.8659 2.05975C17.2603 2.05995 18.3913 3.19096 18.3914 4.58527V5.4874C18.3914 6.02747 18.2192 6.52672 17.9303 6.93735C17.9336 6.96524 17.9388 6.99318 17.9388 7.02195V12.8884C17.9388 13.6345 17.9395 14.2379 17.8996 14.7254C17.8642 15.1593 17.7936 15.5499 17.6373 15.9141L17.5654 16.0685C17.278 16.6338 16.8405 17.1046 16.3038 17.434L16.0679 17.5661C15.66 17.7739 15.2196 17.8598 14.7237 17.9003C14.2362 17.9401 13.6327 17.9405 12.8867 17.9405H7.11122C6.36511 17.9405 5.76171 17.9401 5.27418 17.9003C4.84051 17.8649 4.44949 17.7952 4.08545 17.6391L3.93104 17.5661C3.36673 17.2785 2.89392 16.8414 2.56465 16.3044L2.43245 16.0685C2.22473 15.6608 2.13878 15.2211 2.09825 14.7254C2.05841 14.2379 2.05912 13.6345 2.05912 12.8884V7.02195C2.05912 6.99284 2.06422 6.96449 2.06758 6.93629C1.77931 6.52592 1.60858 6.02687 1.60858 5.4874V4.58527C1.60876 3.19084 2.73962 2.05975 4.1341 2.05975H15.8659ZM16.4984 7.92936C16.296 7.98169 16.0847 8.01288 15.8659 8.01291H4.1341C3.91478 8.01291 3.70246 7.98194 3.49955 7.92936V12.8884C3.49955 13.6582 3.50053 14.1927 3.53445 14.608C3.56769 15.0146 3.62923 15.244 3.71635 15.415L3.7925 15.5514C3.98339 15.8627 4.25749 16.1165 4.58464 16.2833L4.72529 16.3435C4.88095 16.3993 5.08638 16.4402 5.39158 16.4651C5.80685 16.4991 6.34138 16.5001 7.11122 16.5001H12.8867C13.6564 16.5001 14.1911 16.499 14.6063 16.4651C15.0128 16.432 15.2423 16.3703 15.4133 16.2833L15.5508 16.2061C15.8618 16.0152 16.116 15.7419 16.2827 15.415L16.3429 15.2732C16.3985 15.1177 16.4396 14.9128 16.4645 14.608C16.4985 14.1927 16.4984 13.6583 16.4984 12.8884V7.92936ZM4.1341 3.50019C3.53511 3.50019 3.0492 3.98631 3.04902 4.58527V5.4874C3.04902 6.08649 3.535 6.57248 4.1341 6.57248H15.8659C16.4648 6.57228 16.951 6.08638 16.951 5.4874V4.58527C16.9509 3.98644 16.4647 3.50038 15.8659 3.50019H4.1341Z";
        const ARCHIVE_PATH_SLOT = "M12.7962 12.5661V11.0832H7.20548V12.5661L12.7962 12.5661Z";
        const archiveMaskSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path fill='black' fill-rule='evenodd' clip-rule='evenodd' d='${ARCHIVE_PATH_LID}'/><path fill='black' d='${ARCHIVE_PATH_SLOT}'/></svg>`;
        const archiveMaskUrl = `url("data:image/svg+xml,${encodeURIComponent(archiveMaskSvg)}")`;
        // ── 样式 ─────────────────────────────────────────────────────────────────
        const cssPage = ".AS_section{position:relative;width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.AS_status{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;margin:0}.AS_failure{color:var(--dsw-alias-state-error-primary);align-items:center;gap:10px;display:flex}.AS_failure p{margin:0}.AS_failure button,.AS_retry{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:4px 10px}.AS_heading{align-items:baseline;gap:7px;padding:0 2px;display:flex}.AS_heading h2{font-size:16px;font-weight:600;line-height:24px;margin:0}.AS_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.AS_intro{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0;padding:0 2px}.AS_notice{border-radius:8px;align-items:center;gap:10px;padding:8px 12px;display:flex;border:1px solid transparent}.AS_notice[data-kind=error]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)}.AS_notice[data-kind=error] .AS_noticeText{color:var(--dsw-alias-state-error-primary)}.AS_notice[data-kind=info]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent)}.AS_notice[data-kind=info] .AS_noticeText{color:var(--dsw-alias-state-business-primary)}.AS_noticeText{font-size:12px;line-height:18px;flex:1;min-width:0}.AS_list{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.AS_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;align-items:center;gap:12px;min-width:0;padding:10px 12px;display:flex}.AS_main{flex-direction:column;gap:3px;min-width:0;flex:1;display:flex}.AS_title{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:13px;font-weight:500;line-height:20px}.AS_meta{align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;display:flex;flex-wrap:wrap}.AS_workspace{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:280px}.AS_id{font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);color:var(--dsw-alias-label-dimmed);overflow-wrap:anywhere;font-size:11px;line-height:16px}.AS_liveBadge{border:1px solid var(--dsw-alias-state-warn-label);color:var(--dsw-alias-state-warn-label);border-radius:999px;flex:none;padding:1px 7px;font-size:11px;line-height:16px}.AS_actions{flex:none;align-items:center;gap:8px;display:flex}.AS_button{box-sizing:border-box;height:28px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;align-items:center;justify-content:center;gap:4px;padding:0 12px;font-size:12px;line-height:18px;display:inline-flex}.AS_button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}.AS_button:disabled{cursor:default;opacity:.5}.AS_delete[data-confirm=true]{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 50%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent)}.AS_empty{color:var(--dsw-alias-label-tertiary);border:1px dashed var(--dsw-alias-border-l3);text-align:center;border-radius:10px;padding:20px 12px;font-size:13px;line-height:20px}.AS_updateBanner{border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent);color:var(--dsw-alias-state-business-primary);border-radius:8px;padding:6px 12px;font-size:12px;line-height:18px}";
        const cssNav = `button[data-archived-nav]>svg{display:none!important}button[data-archived-nav]::before{content:\"\";width:16px;height:16px;flex:none;background-color:currentColor;-webkit-mask-image:${archiveMaskUrl};-webkit-mask-size:16px 16px;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;mask-image:${archiveMaskUrl};mask-size:16px 16px;mask-repeat:no-repeat;mask-position:center}`;
        const css = cssPage + cssNav;
        if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=dsh-archived-sessions]") === null) {
            const tag = document.createElement("style");
            tag.dataset.plugin = "dsh-archived-sessions";
            tag.dataset.pluginCss = "dsh-archived-sessions";
            tag.textContent = css;
            document.head.appendChild(tag);
        }
        const classes = {
            section: "AS_section",
            status: "AS_status",
            failure: "AS_failure",
            retry: "AS_retry",
            heading: "AS_heading",
            intro: "AS_intro",
            notice: "AS_notice",
            noticeText: "AS_noticeText",
            list: "AS_list",
            row: "AS_row",
            main: "AS_main",
            title: "AS_title",
            meta: "AS_meta",
            workspace: "AS_workspace",
            id: "AS_id",
            liveBadge: "AS_liveBadge",
            actions: "AS_actions",
            button: "AS_button",
            delete: "AS_delete",
            empty: "AS_empty",
            updateBanner: "AS_updateBanner"
        };
        // ── 文案字典 ─────────────────────────────────────────────────────────────
        const NS = "settings.archivedSessions";
        const zh = {
            nav: "已归档",
            loading: "正在读取已归档会话…",
            error: "暂时无法读取已归档会话。",
            retry: "重试",
            empty: "暂无已归档会话。",
            intro: "按归档时间倒序显示。",
            workspaceFallback: "未分组",
            unknownDate: "时间未知",
            updatedLabel: "上次活动",
            running: "运行中",
            summaryMissing: "该会话摘要暂不可用，仅显示 ID。",
            restore: "恢复",
            delete: "删除",
            confirmDelete: "确认删除？",
            busy: "处理中…",
            restoreDone: "已恢复对话。",
            deleteDone: "已删除该会话及其日志目录。",
            updateAvailable: "有新版本可更新：v",
            updateCurrent: "（当前 v",
            opFailed: "操作失败"
        };
        const en = {
            nav: "Archived",
            loading: "Reading archived sessions…",
            error: "Archived sessions are temporarily unavailable.",
            retry: "Retry",
            empty: "No archived sessions.",
            intro: "Sorted by archive time.",
            workspaceFallback: "Ungrouped",
            unknownDate: "Unknown date",
            updatedLabel: "Last active",
            running: "Running",
            summaryMissing: "Summary unavailable; showing the session id.",
            restore: "Restore",
            delete: "Delete",
            confirmDelete: "Confirm delete?",
            busy: "Working…",
            restoreDone: "Session restored.",
            deleteDone: "Session and its log directory deleted.",
            updateAvailable: "Update available: v",
            updateCurrent: " (current v",
            opFailed: "Operation failed"
        };
        // ── 远程贡献 ─────────────────────────────────────────────────────────────
        const identity = (value) => value;
        const codec = (symbol) => ({ mode: "strict", typeSymbol: symbol, schema: { parse: identity } });
        const CONTRIBUTION = {
            package: "dsh-archived-sessions",
            descriptors: [
                {
                    id: "dsh-archived-sessions#archivedSessions/list",
                    service: "archivedSessions",
                    namespace: "archivedSessions",
                    method: "list",
                    invocation: { kind: "direct" },
                    parameters: [],
                    result: codec("dsh-archived-sessions#ArchivedSessionListResult")
                },
                {
                    id: "dsh-archived-sessions#archivedSessions/checkUpdate",
                    service: "archivedSessions",
                    namespace: "archivedSessions",
                    method: "checkUpdate",
                    invocation: { kind: "direct" },
                    parameters: [],
                    result: codec("dsh-archived-sessions#UpdateCheckResult")
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
                            codec: codec("dsh-archived-sessions#SessionId")
                        }
                    ],
                    result: codec("dsh-archived-sessions#ArchivedSetResult")
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
                            codec: codec("dsh-archived-sessions#SessionId")
                        }
                    ],
                    result: codec("dsh-archived-sessions#DeleteArchivedSessionResult")
                }
            ]
        };
        function basenameOf(path) {
            const trimmed = String(path).replace(/[\\/]+$/, "");
            const at = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
            return at >= 0 ? trimmed.slice(at + 1) : trimmed;
        }
        function errorText(error) {
            if (error instanceof Error)
                return error.message;
            return String(error ?? "");
        }
        // ── 设置页面组件 ─────────────────────────────────────────────────────────
        function ArchivedSessionsSection(props) {
            const { t, getSnapshot, getState, subscribe, refreshSessions, refreshWorkspaces, restore, remove, checkUpdateRemote } = props;
            const rows = react.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
            const state = react.useSyncExternalStore(subscribe, getState, getState);
            const [updateInfo, setUpdateInfo] = react.useState(null);
            const [busyId, setBusyId] = react.useState(null);
            const [confirmId, setConfirmId] = react.useState(null);
            const [notice, setNotice] = react.useState(null);
            const busyRef = react.useRef(false);
            // 每次进入本设置页静默检查一次版本；失败或已是最新都不显示。
            react.useEffect(() => {
                let active = true;
                void Promise.resolve()
                    .then(() => checkUpdateRemote())
                    .then((info) => {
                    if (active && info?.updateAvailable === true)
                        setUpdateInfo(info);
                }, () => { });
                return () => {
                    active = false;
                };
            }, []);
            const run = async (id, action, doneText) => {
                if (busyRef.current)
                    return;
                busyRef.current = true;
                setBusyId(id);
                setNotice(null);
                try {
                    await action();
                    setNotice({ kind: "info", text: doneText });
                }
                catch (error) {
                    setNotice({ kind: "error", text: `${t("opFailed")}: ${errorText(error)}` });
                }
                finally {
                    busyRef.current = false;
                    setBusyId(null);
                }
            };
            const onRestore = (id) => {
                void run(id, () => restore(id), t("restoreDone"));
            };
            const onDelete = (id) => {
                if (confirmId !== id) {
                    setConfirmId(id);
                    return;
                }
                setConfirmId(null);
                void run(id, () => remove(id), t("deleteDone"));
            };
            return (0, react_jsx_runtime.jsxs)("section", {
                className: classes.section,
                children: [
                    (0, react_jsx_runtime.jsxs)("div", {
                        className: classes.heading,
                        children: [
                            (0, react_jsx_runtime.jsx)("h2", { children: t("nav") }),
                            (0, react_jsx_runtime.jsx)("span", { children: String(rows.length) })
                        ]
                    }),
                    (0, react_jsx_runtime.jsx)("p", { className: classes.intro, children: t("intro") }),
                    updateInfo === null
                        ? null
                        : (0, react_jsx_runtime.jsx)("div", {
                            className: classes.updateBanner,
                            children: `${t("updateAvailable")}${updateInfo.latest}${t("updateCurrent")}${updateInfo.current})`
                        }),
                    notice === null
                        ? null
                        : (0, react_jsx_runtime.jsx)("div", {
                            className: classes.notice,
                            "data-kind": notice.kind,
                            children: (0, react_jsx_runtime.jsx)("span", {
                                className: classes.noticeText,
                                children: notice.text
                            })
                        }),
                    state?.status === "loading"
                        ? (0, react_jsx_runtime.jsx)("p", { className: classes.status, children: t("loading") })
                        : state?.status === "error"
                            ? (0, react_jsx_runtime.jsx)("div", {
                                className: classes.failure,
                                children: [
                                    (0, react_jsx_runtime.jsx)("p", { children: t("error") }),
                                    (0, react_jsx_runtime.jsx)("button", {
                                        type: "button",
                                        onClick: () => {
                                            void (typeof refreshWorkspaces === "function" ? refreshWorkspaces() : Promise.resolve()).then(() => {
                                                if (typeof refreshSessions === "function")
                                                    void refreshSessions();
                                            });
                                        },
                                        children: t("retry")
                                    })
                                ]
                            })
                            : rows.length === 0
                                ? (0, react_jsx_runtime.jsx)("div", { className: classes.empty, children: t("empty") })
                                : (0, react_jsx_runtime.jsx)("ul", {
                                    className: classes.list,
                                    children: rows.map((row) => {
                                        const busy = busyId === row.id;
                                        const otherBusy = busyId !== null && busyId !== row.id;
                                        const confirm = confirmId === row.id;
                                        const timeLabel = row.updatedAt === undefined
                                            ? t("unknownDate")
                                            : new Date(row.updatedAt).toLocaleString();
                                        return (0, react_jsx_runtime.jsx)("li", {
                                            key: row.id,
                                            children: (0, react_jsx_runtime.jsxs)("div", {
                                                className: classes.row,
                                                children: [
                                                    (0, react_jsx_runtime.jsxs)("div", {
                                                        className: classes.main,
                                                        children: [
                                                            (0, react_jsx_runtime.jsx)("div", {
                                                                className: classes.title,
                                                                title: row.title,
                                                                children: row.title
                                                            }),
                                                            (0, react_jsx_runtime.jsxs)("div", {
                                                                className: classes.meta,
                                                                children: [
                                                                    (0, react_jsx_runtime.jsx)("span", {
                                                                        className: classes.workspace,
                                                                        children: row.workspace ?? t("workspaceFallback")
                                                                    }),
                                                                    (0, react_jsx_runtime.jsx)("span", { children: `${t("updatedLabel")} ${timeLabel}` }),
                                                                    row.running
                                                                        ? (0, react_jsx_runtime.jsx)("span", {
                                                                            className: classes.liveBadge,
                                                                            children: t("running")
                                                                        })
                                                                        : null,
                                                                    row.blank
                                                                        ? (0, react_jsx_runtime.jsx)("span", {
                                                                            className: classes.id,
                                                                            title: t("summaryMissing"),
                                                                            children: row.id
                                                                        })
                                                                        : null
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    (0, react_jsx_runtime.jsxs)("div", {
                                                        className: classes.actions,
                                                        children: [
                                                            (0, react_jsx_runtime.jsx)("button", {
                                                                type: "button",
                                                                className: classes.button,
                                                                disabled: busy || otherBusy,
                                                                onClick: () => onRestore(row.id),
                                                                children: busy ? t("busy") : t("restore")
                                                            }),
                                                            (0, react_jsx_runtime.jsx)("button", {
                                                                type: "button",
                                                                className: `${classes.button} ${classes.delete}`,
                                                                "data-confirm": confirm ? "true" : "false",
                                                                disabled: busy || otherBusy,
                                                                onClick: () => onDelete(row.id),
                                                                children: busy ? t("busy") : confirm ? t("confirmDelete") : t("delete")
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        });
                                    })
                                }),
                ]
            });
        }
        // ── 设置页导航图标补丁 ───────────────────────────────────────────────────
        // 外壳 navIcon 对未知 section 固定渲染齿轮；这里给“已归档”导航项打标记，
        // CSS 隐藏齿轮并用官方归档 icon 的 path 绘制 mask（颜色继承 currentColor）。
        const NAV_LABELS = [zh.nav, en.nav];
        let navPatchScheduled = false;
        const patchArchivedNavIcon = () => {
            navPatchScheduled = false;
            if (typeof document === "undefined")
                return;
            for (const dialog of document.querySelectorAll('[role="dialog"]')) {
                for (const button of dialog.querySelectorAll("button")) {
                    if (button.dataset.archivedNav === "1")
                        continue;
                    let hit = false;
                    for (const span of button.querySelectorAll("span")) {
                        const text = (span.textContent ?? "").trim();
                        if (span.childElementCount === 0 && NAV_LABELS.includes(text)) {
                            hit = true;
                            break;
                        }
                    }
                    if (hit)
                        button.dataset.archivedNav = "1";
                }
            }
        };
        const scheduleNavPatch = () => {
            if (navPatchScheduled || typeof document === "undefined")
                return;
            navPatchScheduled = true;
            queueMicrotask(patchArchivedNavIcon);
        };
        // ── cordis 插件体 ────────────────────────────────────────────────────────
        const inject = ["slots", "locale", "remote", "sessions", "workspaces"];
        function apply(ctx) {
            ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-archived-sessions: dictionaries");
            if (typeof document !== "undefined") {
                const navObserver = new MutationObserver(scheduleNavPatch);
                navObserver.observe(document.body, { childList: true, subtree: true });
                scheduleNavPatch();
                ctx.effect(() => () => navObserver.disconnect(), "ui-archived-sessions: nav icon patch");
            }
            const t = ctx.locale.bind(NS);
            const mount = ctx.remote.$mount(CONTRIBUTION);
            const callRemote = async (method, ...args) => {
                await mount;
                const remote = ctx.get("remote.archivedSessions");
                const result = await remote[method](...args);
                if (!result.ok) {
                    throw new Error(result.error?.message ?? `archivedSessions.${method} failed`);
                }
                return result.value;
            };
            const sectionFace = () => {
                const sessions = ctx.get("sessions");
                const workspaces = ctx.get("workspaces");
                const listeners = new Set();
                let rowsCache = [];
                let stateCache = { status: "loading" };
                const build = () => {
                    const sessionState = sessions.list.getSnapshot();
                    const workspaceState = workspaces.list.getSnapshot();
                    const workspaceBySession = new Map();
                    for (const workspace of workspaceState.items ?? []) {
                        for (const sessionId of workspace.sessionIds ?? []) {
                            workspaceBySession.set(String(sessionId), workspace.title);
                        }
                    }
                    const archivedIds = Array.isArray(workspaceState.archivedSessionIds)
                        ? [...workspaceState.archivedSessionIds].reverse()
                        : [];
                    rowsCache = archivedIds.map((id) => {
                        const summary = sessionState.byId?.[id];
                        const title = typeof summary?.displayTitle === "string" && summary.displayTitle !== ""
                            ? summary.displayTitle
                            : typeof summary?.title === "string" && summary.title !== ""
                                ? summary.title
                                : id;
                        return {
                            id,
                            title,
                            workspace: workspaceBySession.get(id),
                            cwd: summary?.cwd,
                            updatedAt: Number.isFinite(summary?.updatedAt) ? summary.updatedAt : undefined,
                            running: summary?.running === true,
                            blank: summary?.blank === true
                        };
                    });
                    const workspaceFailed = workspaceState?.state === "error";
                    const sessionFailed = sessionState?.state === "error";
                    if (workspaceFailed || sessionFailed)
                        stateCache = { status: "error" };
                    else if (workspaceState?.state === "loading" || sessionState?.state === "loading")
                        stateCache = { status: "loading" };
                    else
                        stateCache = { status: "ready" };
                };
                const notify = () => {
                    build();
                    for (const listener of [...listeners])
                        listener();
                };
                build();
                const unsubSessions = sessions.list.subscribe(notify);
                const unsubWorkspaces = workspaces.list.subscribe(notify);
                const face = {
                    getSnapshot: () => rowsCache,
                    getState: () => stateCache,
                    subscribe: (listener) => {
                        listeners.add(listener);
                        return () => listeners.delete(listener);
                    },
                    refreshSessions: () => {
                        if (typeof sessions.refresh === "function")
                            return sessions.refresh();
                        return Promise.resolve();
                    },
                    refreshWorkspaces: () => {
                        if (typeof workspaces.refresh === "function")
                            return workspaces.refresh();
                        return Promise.resolve();
                    },
                    restore: (sessionId) => callRemote("restore", sessionId),
                    checkUpdateRemote: () => callRemote("checkUpdate"),
                    remove: async (sessionId) => {
                        await callRemote("delete", sessionId);
                        if (typeof sessions.refresh === "function") {
                            try {
                                await sessions.refresh();
                            }
                            catch {
                                // 归档集合已经变化；session.list 刷新失败不阻断操作结果。
                            }
                        }
                    }
                };
                return face;
            };
            // 注册“已归档”设置栏（order 17：位于“技能”16 与“agent 预设”20 之间）。
            ctx.slots.inject("settings.section", () => ctx.slots.register({
                name: "settings.section",
                id: "archived-sessions",
                order: 17,
                label: () => t("nav"),
                locale: NS,
                inject: sectionFace
            }, ArchivedSessionsSection));
        }
        bundleModule.exports.NS = NS;
        bundleModule.exports.apply = apply;
        bundleModule.exports.inject = inject;
        return bundleModule.exports;
    }
});
