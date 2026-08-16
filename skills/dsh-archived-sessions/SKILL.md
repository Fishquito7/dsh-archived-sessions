---
name: dsh-archived-sessions
description: Use the dsh-archived CLI to list, restore, and delete archived DSH sessions, and to update the dsh-archived-sessions plugin. Use when the user asks to manage archived conversations, restore or permanently delete an archived session, or update this plugin.
---

# dsh-archived CLI

`dsh-archived` 管理 DSH 的已归档会话。归档只隐藏会话；恢复会把它放回原工作区，删除会永久移除会话日志目录。

## Commands

```text
dsh-archived list                         # 按归档时间倒序列出已归档会话
dsh-archived restore <session-id>         # 恢复一个归档会话（回到原工作区）
dsh-archived delete <session-id> [--yes]  # 删除归档会话及其日志目录（不可恢复）
dsh-archived update [--yes]               # 检查并更新插件，默认 --profile web
```

## Rules

- Restore and delete operate on exactly one session at a time; there is no batch or multi-select mode.
- `delete` is destructive and removes the local session log directory. Use `--yes` only when the user has explicitly confirmed deletion.
- The default update target is profile `web`. Use `--profile <name>` for another profile.
- `update` installs the release tgz via `dsh plugin --profile <name> add <release-url>`. It never installs the Git source directly, because pnpm 11 blocks git-hosted prepare scripts by default.
- When DSH web is running, write commands go through its API so the UI stays consistent. When DSH is not running, `list` and `restore`/`delete` fall back to offline file operations; `--offline` forces offline mode.
- If a command fails, read the error and ask the user before retrying destructive operations.

## Examples

```bash
dsh-archived list
dsh-archived restore session-e5b19916-c5a0-4d4b-a139-8bcf3ae416cc
dsh-archived delete session-e5b19916-c5a0-4d4b-a139-8bcf3ae416cc
dsh-archived update
```
