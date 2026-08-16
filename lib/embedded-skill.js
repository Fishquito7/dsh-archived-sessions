import { readFileSync } from "node:fs";
function frontmatterField(frontmatter, key) {
    const line = frontmatter.split(/\r?\n/).find((candidate) => candidate.trimStart().startsWith(`${key}:`));
    if (line === undefined)
        return "";
    return line.slice(line.indexOf(":") + 1).trim().replace(/^["']|["']$/g, "");
}
export function loadEmbeddedSkill() {
    const raw = readFileSync(new URL("../skills/dsh-archived-sessions/SKILL.md", import.meta.url), "utf8")
        .replace(/^\uFEFF/, "")
        .replace(/\r\n?/g, "\n");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (match === null)
        throw new Error("embedded skill SKILL.md is missing YAML frontmatter");
    const name = frontmatterField(match[1], "name");
    const description = frontmatterField(match[1], "description");
    if (name === "" || description === "")
        throw new Error("embedded skill SKILL.md is missing name or description");
    return {
        name,
        description,
        content: match[2].trim()
    };
}
