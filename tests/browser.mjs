import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { once } from "node:events";
import { serveSite } from "../scripts/serve.mjs";
import {
  concepts,
  capabilities,
  profile,
  scenarios,
} from "../assets/content.js";
const server = serveSite("dist", 0);
await once(server, "listening");
const origin = `http://127.0.0.1:${server.address().port}`,
  url = `${origin}/Sree-Vishnu-Blog/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
function pass(message) {
  results.push(message);
  console.log("PASS:", message);
}
const waitStatus = async (page, text) =>
  page.waitForFunction(
    (text) =>
      document.querySelector("#simulation-status").textContent.startsWith(text),
    text,
  );
async function audit(page, label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    result.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
    [],
    `axe ${label}`,
  );
}
try {
  const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    }),
    page = await context.newPage(),
    errors = [],
    failures = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(r.url());
  });
  page.on("requestfailed", (r) => failures.push(r.url()));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  assert.equal(
    await page.locator("h1").innerText(),
    "Sree Vishnu Raju\nDommaraju.",
  );
  assert.equal(await page.locator(".hero-role").innerText(), profile.title);
  await page.waitForFunction(
    () =>
      document.querySelector("#core-canvas").dataset.renderState === "animated",
  );
  const pixels = await page
    .locator("#core-canvas")
    .evaluate((c) => c.toDataURL());
  await page.waitForTimeout(250);
  assert.notEqual(
    await page.locator("#core-canvas").evaluate((c) => c.toDataURL()),
    pixels,
  );
  // Frame timing is a local lab observation, not a hardware-independent FPS claim.
  const timing = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const deltas = [];
        let previous;
        function frame(time) {
          if (previous) deltas.push(time - previous);
          previous = time;
          if (deltas.length < 45) requestAnimationFrame(frame);
          else resolve(deltas);
        }
        requestAnimationFrame(frame);
      }),
  );
  console.log(
    "FRAME TIMING",
    JSON.stringify({
      median: timing.toSorted((a, b) => a - b)[22],
      p95: timing.toSorted((a, b) => a - b)[42],
    }),
  );
  await page.mouse.move(900, 350);
  await page.waitForTimeout(220);
  const firstGlow = await page
    .locator("[data-cursor]")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(400, 580);
  await page.waitForTimeout(250);
  const secondGlow = await page
    .locator("[data-cursor]")
    .evaluate((el) => getComputedStyle(el).transform);
  assert.notEqual(firstGlow, secondGlow);
  assert.equal(
    await page
      .locator("[data-cursor]")
      .evaluate((el) => getComputedStyle(el).pointerEvents),
    "none",
  );
  const primary = page.locator(".hero .button.primary"),
    rect = await primary.boundingBox();
  await page.mouse.move(rect.x + rect.width - 10, rect.y + rect.height / 2);
  await page.waitForTimeout(350);
  assert.notEqual(
    await primary.evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await page.mouse.move(30, 30);
  await page.waitForTimeout(700);
  assert.equal(await primary.evaluate((el) => el.style.transform), "");
  await page.locator("#motion-toggle").click();
  const stopped = await page
    .locator("#core-canvas")
    .evaluate((c) => c.toDataURL());
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator("#core-canvas").evaluate((c) => c.toDataURL()),
    stopped,
  );
  await page.locator("#motion-toggle").click();
  await page.screenshot({ path: "tests/preview-v2-desktop.png" });
  await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
  await page.waitForTimeout(100);
  assert.ok(
    await page.evaluate(() =>
      document.getAnimations().some((a) => a.playState === "running"),
    ),
    "scroll reveals are active",
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  pass(
    "idle canvas motion, following cursor, magnetic displacement/return, and motion toggle",
  );

  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(100);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow ${width}`,
    );
    assert.ok(
      (await page.locator("h1").innerText())
        .replace(/\s+/g, " ")
        .includes(profile.name),
    );
    assert.ok(
      await page
        .locator("h1")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      `name clipped ${width}`,
    );
    await page.screenshot({
      path: `tests/preview-v2-${width}.png`,
      fullPage: true,
    });
  }
  pass(
    "all seven viewport widths, full visible identity, no horizontal overflow",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#main-nav a[href="#playground"]').click();
  await page.waitForTimeout(650);
  await page.locator('[data-node="4"]').click();
  assert.match(
    await page.locator("#node-explanation").innerText(),
    /Guardrails/,
  );
  assert.equal(
    await page.locator('[data-node="4"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#run").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("#run").evaluate((el) => el === document.activeElement),
    true,
  );
  await page.waitForTimeout(180);
  const position = await page.locator("#flow-signal").getAttribute("cx");
  await page.waitForTimeout(220);
  assert.notEqual(
    await page.locator("#flow-signal").getAttribute("cx"),
    position,
  );
  await page.locator("#pause").click();
  const paused = await page.locator("#simulation-status").innerText();
  await page.waitForTimeout(1250);
  assert.equal(await page.locator("#simulation-status").innerText(), paused);
  assert.match(paused, /Paused/);
  await page.locator("#run").click();
  await waitStatus(page, "Complete");
  assert.equal(await page.locator("#trace-list li").count(), 6);
  await page.locator("#reset").click();
  await waitStatus(page, "Ready");
  assert.equal(
    await page.locator("#simulation-progress").getAttribute("value"),
    "0",
  );
  for (const key of ["review", "inference"]) {
    await page.selectOption("#scenario", key);
    await page.locator("#run").click();
    await waitStatus(page, "Complete");
    assert.equal(
      await page.locator("#trace-list li").count(),
      scenarios[key].stages.length,
    );
  }
  await page.locator("#run").click();
  await page.locator('#main-nav a[href="#systems"]').click();
  await waitStatus(page, "Paused");
  pass(
    "selectable architecture nodes, moving signal, run/pause/resume/reset, all scenarios and offscreen pause",
  );

  await page.waitForTimeout(700);
  assert.equal(
    await page
      .locator("#systems")
      .evaluate((el) => el.classList.contains("is-pinned")),
    true,
  );
  await page.locator('[data-slide-to="0"]').click();
  await page.waitForTimeout(700);
  const beforeSlide = await page
    .locator(".showcase-track")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(250);
  assert.notEqual(
    await page
      .locator(".showcase-track")
      .evaluate((el) => getComputedStyle(el).transform),
    beforeSlide,
  );
  await page.locator('[data-slide-to="0"]').click();
  await page.waitForTimeout(700);
  const rail = await page.locator(".showcase-rail").boundingBox();
  await page.mouse.move(rail.x + rail.width - 130, rail.y + rail.height / 2);
  await page.mouse.down();
  await page.mouse.move(rail.x + 130, rail.y + rail.height / 2, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(750);
  assert.notEqual(await page.locator("#slide-status").innerText(), "01 / 06");
  await page.locator(".showcase-rail").focus();
  await page.keyboard.press("End");
  await page.waitForFunction(
    () => document.querySelector("#slide-status").textContent === "06 / 06",
  );
  await page.keyboard.press("Home");
  await page.waitForFunction(
    () => document.querySelector("#slide-status").textContent === "01 / 06",
  );
  await page.screenshot({ path: "tests/preview-v2-pinned.png" });
  pass(
    "native vertical scroll drives sticky horizontal showcase; drag, indicators, and keyboard controls change slides",
  );

  // Every concept has a reachable modal, a working demo, Escape dismissal and focus restoration.
  for (let i = 0; i < 6; i++) {
    await page.locator(`[data-slide-to="${i}"]`).click();
    await page.waitForFunction(
      (i) =>
        document.querySelector("#slide-status").textContent ===
        `${String(i + 1).padStart(2, "0")} / 06`,
      i,
    );
    const card = page.locator(`[data-slide="${i}"]`),
      button = card.locator("[data-open-concept]"),
      id = Number(await button.getAttribute("data-open-concept"));
    await button.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("dialog").open);
    assert.equal(
      await page.locator("#dialog-title").innerText(),
      concepts[id].name,
    );
    if (i === 0) {
      await audit(page, "open dialog");
      await page.keyboard.press("Shift+Tab");
      assert.equal(
        await page.evaluate(() =>
          document.querySelector("dialog").contains(document.activeElement),
        ),
        true,
      );
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#concept-demo").click();
    assert.equal(
      await page.locator("#concept-demo-status").innerText(),
      concepts[id].result,
    );
    if (id === 2) {
      await page.locator("#concept-demo").click();
      assert.match(
        await page.locator("#concept-demo-status").innerText(),
        /Public-source scenario/,
      );
      await page.locator("#concept-demo").click();
      assert.equal(
        await page.locator("#concept-demo-status").innerText(),
        concepts[id].result,
      );
    }
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").evaluate((d) => d.open), false);
    assert.equal(
      await button.evaluate((el) => el === document.activeElement),
      true,
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  pass(
    "all six concept details/demos, policy switching, native dialog focus trap, Escape and restored focus",
  );
  for (let i = 0; i < capabilities.length; i++) {
    const button = page.locator(`[data-capability="${i}"]`);
    await button.focus();
    await page.keyboard.press("Enter");
    assert.ok(
      (await page.locator("#capability-detail").innerText()).includes(
        capabilities[i][1],
      ),
    );
    await page.locator("#capability-detail summary").click();
    assert.ok(
      (await page.locator("#capability-detail").innerText()).includes(
        capabilities[i][3],
      ),
    );
  }
  await audit(page, "desktop");
  pass("all skill filters, expanded tools, desktop WCAG A/AA checks");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator('#main-nav a[href="#about"]').click();
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  assert.equal(
    await page
      .locator("[data-cursor]")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  assert.equal(
    await page
      .locator("#systems")
      .evaluate((el) => el.classList.contains("is-pinned")),
    false,
  );
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    await page.waitForTimeout(120);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `200% overflow ${width}`,
    );
    await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  }
  pass("reduced motion removes heavy effects/pinning; 200% text scaling");

  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await touch.newPage();
  await mobile.goto(url);
  await mobile.evaluate(() => document.fonts.ready);
  assert.equal(
    await mobile
      .locator("[data-cursor]")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  await mobile.locator(".menu-toggle").click();
  assert.equal(
    await mobile.locator(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await mobile.keyboard.press("Escape");
  assert.equal(
    await mobile.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  await mobile.locator(".menu-toggle").click();
  await mobile.locator('#main-nav a[href="#systems"]').click();
  await mobile.waitForTimeout(500);
  assert.equal(
    await mobile.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await mobile
      .locator("#systems")
      .evaluate((el) => el.classList.contains("is-pinned")),
    false,
  );
  await mobile.locator("#slide-next").tap();
  await mobile.waitForTimeout(600);
  assert.equal(await mobile.locator("#slide-status").innerText(), "02 / 06");
  // Real touch events exercise native horizontal swipe, rather than assigning scrollLeft.
  await mobile
    .locator(".showcase-rail")
    .evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
  await mobile.waitForTimeout(100);
  const mobileRail = await mobile.locator(".showcase-rail").boundingBox();
  const session = await touch.newCDPSession(mobile),
    y = Math.max(120, Math.min(650, mobileRail.y + mobileRail.height * 0.35));
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 320, y }],
  });
  for (let x = 280; x >= 60; x -= 40) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y }],
    });
    await mobile.waitForTimeout(30);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.waitForTimeout(750);
  assert.notEqual(await mobile.locator("#slide-status").innerText(), "02 / 06");
  await mobile.locator(".capability-list").scrollIntoViewIfNeeded();
  await audit(mobile, "touch/mobile");
  await mobile.screenshot({
    path: "tests/preview-v2-touch.png",
    fullPage: true,
  });
  await touch.close();
  pass(
    "touch context, no fake cursor, mobile menu, native swipe and arrows, mobile WCAG A/AA",
  );

  const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 850 },
    }),
    fallback = await nojs.newPage();
  await fallback.goto(url);
  assert.equal(await fallback.locator(".concept").count(), 6);
  assert.equal(await fallback.locator("h1").isVisible(), true);
  assert.equal(await fallback.locator(".core-fallback").isVisible(), true);
  assert.equal(await fallback.locator("#run").isVisible(), false);
  await fallback.locator(".architecture-details summary").first().click();
  assert.equal(
    await fallback.locator(".architecture-details[open]").count(),
    1,
  );
  assert.ok(
    await fallback.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await nojs.close();
  const noCanvas = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const noCanvasPage = await noCanvas.newPage();
  await noCanvasPage.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await noCanvasPage.goto(url);
  await noCanvasPage.waitForTimeout(500);
  assert.equal(
    await noCanvasPage
      .locator(".core-fallback")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await noCanvasPage.emulateMedia({ contrast: "more" });
  assert.equal(
    await noCanvasPage.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--silver")
        .trim(),
    ),
    "#d3dce4",
  );
  await noCanvas.close();
  pass("canvas-unavailable artwork fallback and higher-contrast preference");
  for (const path of [
    "/",
    "/Sree-Vishnu-Blog/",
    "/Sree-Vishnu-Blog/about/",
    "/Sree-Vishnu-Blog/projects/",
    "/Sree-Vishnu-Blog/blog/",
  ]) {
    await page.goto(origin + path);
    await page.waitForURL(
      (target) =>
        target.pathname === (path === "/" ? "/" : "/Sree-Vishnu-Blog/"),
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    assert.equal(await page.locator("h1").isVisible(), true);
  }
  for (const anchor of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.href)))
    assert.equal(anchor, profile.linkedin);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  pass(
    "no-JS fallback, root/project/legacy paths, exact LinkedIn URLs, no failed assets or runtime errors",
  );
  console.log(
    `Verified ${results.length} groups in the V2 observable interaction matrix.`,
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
