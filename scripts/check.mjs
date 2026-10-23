import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
let count = 0;
for (const directory of ["assets", "scripts", "tests"]) {
  for (const file of await readdir(directory)) {
    if (!/\.(mjs|js)$/.test(file)) continue;
    execFileSync(process.execPath, ["--check", `${directory}/${file}`], {
      stdio: "inherit",
    });
    count++;
  }
}
console.log(`Syntax checked ${count} JavaScript modules.`);
