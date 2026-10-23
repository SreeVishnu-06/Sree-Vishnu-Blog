import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { once } from "node:events";
import { serveSite } from "../scripts/serve.mjs";
import { concepts, capabilities, profile } from "../assets/content.js";

const server = serveSite("dist", 0);
await once(server, "listening");
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/Sree-Vishnu-Blog/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failures = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto(url);
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Check layout and contrast in both navigation modes, not just desktop.
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: `tests/preview-${width}.png`,
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
    if (width === 375 || width === 1440) {
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        audit.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
        [],
        `axe at ${width}`,
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.locator(".menu-toggle").isVisible(), false);
  for (let index = 0; index < capabilities.length; index++) {
    const button = page.locator(`[data-capability="${index}"]`);
    await button.focus();
    await page.keyboard.press("Enter");
    assert.equal(await button.getAttribute("aria-pressed"), "true");
    assert.ok(
      (await page.locator("#capability-detail").innerText()).includes(
        capabilities[index][1],
      ),
    );
    await page.locator("#capability-detail summary").click();
    assert.ok(
      (await page.locator("#capability-detail").innerText()).includes(
        capabilities[index][3],
      ),
    );
  }

  // Every concept must be useful with keyboard input and reduced motion.
  for (let index = 0; index < concepts.length; index++) {
    const detail = page.locator(".architecture-details").nth(index);
    await detail.locator("summary").focus();
    await page.keyboard.press("Enter");
    const button = detail.locator("[data-demo]");
    await button.click();
    assert.equal(await detail.locator(".demo-result").isVisible(), true);
    assert.equal(
      await detail.locator(".demo-result").innerText(),
      concepts[index].result,
    );
    if (index === 2) {
      await button.click();
      assert.match(
        await detail.locator(".demo-result").innerText(),
        /Public-source scenario/,
      );
      await button.click();
      assert.equal(
        await detail.locator(".demo-result").innerText(),
        concepts[index].result,
      );
    }
    await detail.locator("summary").click();
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const firstPanel = page.locator(".architecture-details").first();
  await firstPanel.locator("summary").click();
  await firstPanel.locator("[data-demo]").click();
  await page.waitForFunction(() =>
    document
      .querySelector(".demo-result")
      .textContent.startsWith("Planner selects"),
  );
  assert.equal(
    await firstPanel.locator(".stage-complete").count(),
    concepts[0].stages.length,
  );
  await firstPanel.locator("[data-demo]").click();
  await firstPanel.locator("summary").click();
  const frozen = await firstPanel.locator(".demo-result").textContent();
  await page.waitForTimeout(650);
  assert.equal(
    await firstPanel.locator(".demo-result").textContent(),
    frozen,
    "closing panel stops timer",
  );

  await page.locator("#playground").scrollIntoViewIfNeeded();
  await page.locator("#run").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .locator("#run")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.waitForFunction(
    () => document.querySelector("#simulation-progress").value >= 1,
  );
  await page.locator("#pause").click();
  const paused = await page.locator("#simulation-status").innerText();
  assert.match(paused, /Paused/);
  assert.equal(
    await page.locator("#simulation-nodes").getByText("Paused here").count(),
    1,
  );
  await page.waitForTimeout(1300);
  assert.equal(await page.locator("#simulation-status").innerText(), paused);
  await page.locator("#run").click();
  await page.waitForFunction(() =>
    document
      .querySelector("#simulation-status")
      .textContent.startsWith("Complete"),
  );
  await page.locator("#reset").click();
  assert.match(await page.locator("#simulation-status").innerText(), /Ready/);
  for (const value of ["review", "inference"]) {
    await page.selectOption("#scenario", value);
    await page.locator("#run").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#simulation-status")
        .textContent.startsWith("Complete"),
    );
    assert.equal(await page.locator("#trace-list li").count(), 5);
  }
  await page.locator("#run").click();
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document
      .querySelector("#simulation-status")
      .textContent.startsWith("Paused"),
  );
  await page.locator("#contact").scrollIntoViewIfNeeded();
  assert.equal(
    await page.locator("#main-nav a[aria-current]").getAttribute("href"),
    "#contact",
  );

  await page.setViewportSize({ width: 375, height: 850 });
  await page.locator(".menu-toggle").click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page
      .locator(".menu-toggle")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.locator(".menu-toggle").click();
  await page.locator('#main-nav a[href="#systems"]').click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  await page.locator(".graph-node.center").click();
  assert.equal(
    await page.locator(".graph-node.center").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".graph-node.center").getAttribute("aria-expanded"),
    "false",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `text scaling overflow at ${width}`,
    );
    await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  }
  for (const anchor of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.href)))
    assert.equal(anchor, profile.linkedin);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);

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
    assert.equal(await page.locator("h1").isVisible(), true);
  }
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 850 },
  });
  const fallback = await nojs.newPage();
  await fallback.goto(url);
  assert.equal(await fallback.locator(".concept").count(), 6);
  assert.equal(await fallback.locator("h1").isVisible(), true);
  assert.equal(await fallback.locator("noscript h3").count(), 5);
  assert.equal(await fallback.locator("#run").isVisible(), false);
  await fallback.locator(".architecture-details summary").first().click();
  assert.equal(
    await fallback.locator(".detail-body").first().isVisible(),
    true,
  );
  await nojs.close();
  console.log(
    "PASS: six responsive widths, mobile/desktop axe, six capabilities and concepts, policy switching, timer cleanup, all simulation scenarios, keyboard focus, menu, active nav, touch graph, 200% text scaling, no-JS, root/subpath/legacy paths, no failed assets or runtime errors.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
