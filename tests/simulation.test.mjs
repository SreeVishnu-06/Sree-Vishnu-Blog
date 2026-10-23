import test from "node:test";
import assert from "node:assert/strict";
import { initialState, transition } from "../assets/simulation.js";
import { scenarios, concepts, profile } from "../assets/content.js";
import { readFile } from "node:fs/promises";
test("pause preserves position, resume completes, reset clears", () => {
  let s = initialState();
  s = transition(s, "run", 5);
  s = transition(s, "tick", 5);
  s = transition(s, "pause", 5);
  assert.equal(s.step, 1);
  assert.deepEqual(transition(s, "tick", 5), s);
  s = transition(s, "run", 5);
  for (let i = 0; i < 10; i++) s = transition(s, "tick", 5);
  assert.deepEqual(s, { step: 5, status: "complete" });
  assert.deepEqual(transition(s, "reset", 5), initialState());
  assert.deepEqual(transition(s, "run", 5), { step: 0, status: "running" });
});
test("every scenario has deterministic complete paths", () => {
  for (const scenario of Object.values(scenarios)) {
    let s = transition(initialState(), "run", scenario.stages.length);
    for (const stage of scenario.stages) {
      assert.equal(stage.length, 2);
      s = transition(s, "tick", scenario.stages.length);
    }
    assert.equal(s.status, "complete");
  }
});
test("six complete concepts and exact connection destination", () => {
  assert.equal(concepts.length, 6);
  for (const c of concepts) {
    assert.ok(c.stages.length >= 5);
    for (const key of [
      "problem",
      "decision",
      "reliability",
      "sample",
      "result",
    ])
      assert.ok(c[key]);
  }
  assert.equal(
    profile.linkedin,
    "https://www.linkedin.com/in/sreevishnurajud/",
  );
});
test("public page has no forbidden links and all sections exist", async () => {
  const html = await readFile("index.html", "utf8");
  assert.doesNotMatch(html, /github\.com|example\.com/i);
  assert.ok(html.includes(`href="mailto:${profile.email}"`));
  assert.ok(html.includes(`href="tel:${profile.phone}"`));
  for (const id of [
    "about",
    "expertise",
    "systems",
    "playground",
    "experience",
    "contact",
  ])
    assert.ok(html.includes(`id="${id}"`));
  for (const [, url] of html.matchAll(/<a[^>]+href="(https:[^"]+)"/g))
    assert.equal(url, profile.linkedin);
  assert.equal((html.match(/class="architecture-details"/g) || []).length, 6);
});

test("generated assets and anchor destinations resolve", async () => {
  const html = await readFile("dist/index.html", "utf8");
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.has(target), target);
  for (const [, asset] of html.matchAll(
    /(?:src|href)="((?:assets\/|style\.css)[^"]*)"/g,
  ))
    assert.ok((await readFile(`dist/${asset}`)).length > 0, asset);
  assert.doesNotMatch(html, /\{\{|\{%|github\.com|example\.com/);
});

test("clean builds cannot retain deleted assets", async () => {
  const { writeFile } = await import("node:fs/promises");
  const { execFileSync } = await import("node:child_process");
  await writeFile("dist/stale-asset-check.txt", "obsolete synthetic fixture");
  execFileSync(process.execPath, ["scripts/build.mjs"]);
  await assert.rejects(readFile("dist/stale-asset-check.txt"), {
    code: "ENOENT",
  });
});

test("public text is valid Unicode and sharing artwork has the declared size", async () => {
  const { readdir } = await import("node:fs/promises");
  for (const directory of ["assets", "dist/assets"]) {
    for (const filename of await readdir(directory)) {
      if (!/\.(js|svg)$/.test(filename)) continue;
      assert.doesNotMatch(
        await readFile(`${directory}/${filename}`, "utf8"),
        /\uFFFD/,
        filename,
      );
    }
  }
  assert.doesNotMatch(await readFile("dist/index.html", "utf8"), /\uFFFD/);
  const image = await readFile("dist/assets/social.png");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});
