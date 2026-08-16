# dsh-archived-sessions

在 DSH Web 设置面板中查看、恢复和删除已归档会话，并附带同名 CLI。

DSH（DeepSeek Harness）的会话归档只会把会话从侧边栏分组视图隐藏：本地日志
文件和 `workspace.sessionIds` 席位都会保留。本插件补上两个缺口：

- **恢复归档**：只把会话移出归档集合，它回到原工作区、原位置。
- **删除归档**：删除 `~/.dsh/sessions/<project>/<session-id>/` 会话日志目录，
  同时从工作区席位和归档集合中移除（不可恢复）。

归档和恢复一次只允许操作一个会话，不支持多选/批量。

插件还会注册一个运行时内置 skill（`dsh-archived-sessions`），向模型说明
CLI 的用法；skill 正文与包内 `skills/dsh-archived-sessions/SKILL.md` 一致。因此用户还可以与模型沟通以管理归档，无需让模型额外探查归档工作机制。

## 界面

![已归档设置页](assets/screenshot.png)

## 安装

请安装 Release 附带的 tgz 发行包：

```bash
dsh plugin --profile web add https://github.com/Fishquito7/dsh-archived-sessions/releases/download/v0.1.1/dsh-archived-sessions-0.1.1.tgz
```

> 示例默认使用 `--profile web`；如果你使用其他 profile，请把命令中的 `web`
> 替换为你的 profile 名。
>
> 不推荐直接 `dsh plugin add github:...`：pnpm 11 的安全策略默认拒绝
> Git 来源依赖运行 prepare 构建脚本。Release tgz 已包含编译产物，可直接安装。

安装后关闭并重新启动 `dsh web`，然后刷新页面。设置 → **已归档**。
设置导航图标复用侧边栏三点菜单中
“归档对话”的图标，颜色跟随设置菜单主题变量。

## CLI

```bash
dsh-archived list                         # 按归档时间倒序列出已归档会话
dsh-archived restore <session-id>         # 恢复一个归档会话
dsh-archived delete <session-id> [--yes]  # 删除一个归档会话及其日志目录
dsh-archived update [--yes]               # 检查并更新插件（默认 --profile web）
```

通用选项：

```text
--port <n>       DSH web 端口（默认读取 ~/.dsh/web.stdout.log，回退 3080）
--profile <name> update 目标配置（默认 web）
--offline        强制离线操作（DSH 未运行时直接修改本地文件）
--json           list 输出 JSON
--yes            跳过确认
```

- 写操作优先调用运行中 DSH 的 Typert 端点，与网页 UI 实时一致。
- DSH 未运行时会自动退化到离线模式；DSH 在运行但插件未挂载时会拒绝离线
  写入，避免运行中网关之后用旧状态覆盖磁盘。
- `update` 会从 GitHub Releases 的 `latest` 页面解析最新版本，与本机版本
  比较；有更新时安装约定的
  `dsh-archived-sessions-<version>.tgz` 发行包。
- 设置页每次进入“已归档”时会静默检查一次版本，仅在有更新时显示小横幅；
  请求失败或已是最新版本都不显示。

## 构建发行包

```bash
pnpm install
pnpm build
pnpm pack
```

产物为 `dsh-archived-sessions-<version>.tgz`。发布时把它附加到 GitHub
Release，tag 建议使用 `v<version>`（例如 `v0.1.1`），资产名保持上述约定。

## 兼容性

面向 DSH `0.1.0-rc.6` 开发。恢复依赖对 `workspaceRegistry` 实例的能力补丁
（复用其 `enqueueOperation` / `setState` 写链），未来 DSH 提供官方
unarchive / delete API 后应切换为官方实现。

## License

[MIT](LICENSE)
