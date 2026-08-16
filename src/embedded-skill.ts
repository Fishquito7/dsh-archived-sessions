import { readFileSync } from "node:fs";

/**
 * 读取包内标准 SKILL.md，剥离 YAML frontmatter 后作为运行时内置 skill
 * 注册。文件同时保留标准形态：如果用户以后想复制到 ~/.dsh/skills 使用，
 * 文件系统提供方也能直接发现它。
 */
export interface EmbeddedSkill {
  name: string;
  description: string;
  content: string;
}

function frontmatterField(frontmatter: string, key: string): string {
  const line = frontmatter.split(/\r?\n/).find((candidate) => candidate.trimStart().startsWith(`${key}:`));
  if (line === undefined) return "";
  return line.slice(line.indexOf(":") + 1).trim().replace(/^["']|["']$/g, "");
}

export function loadEmbeddedSkill(): EmbeddedSkill {
  const raw = readFileSync(new URL("../skills/dsh-archived-sessions/SKILL.md", import.meta.url), "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (match === null) throw new Error("embedded skill SKILL.md is missing YAML frontmatter");
  const name = frontmatterField(match[1], "name");
  const description = frontmatterField(match[1], "description");
  if (name === "" || description === "") throw new Error("embedded skill SKILL.md is missing name or description");
  return {
    name,
    description,
    content: match[2].trim()
  };
}
