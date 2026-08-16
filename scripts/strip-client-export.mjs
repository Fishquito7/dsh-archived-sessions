// TypeScript emits a trailing "export {};" for script-ish files with only
// local declarations. The DSH client bundle must stay a classic script.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../lib/client.js", import.meta.url));
const src = readFileSync(file, "utf8");
const stripped = src.replace(/\nexport \{\};\s*$/, "\n");
if (stripped === src) {
  console.error("strip-client-export: no trailing 'export {};' found — bundle shape changed unexpectedly");
  process.exit(1);
}
writeFileSync(file, stripped);
console.log("stripped trailing export from lib/client.js");
