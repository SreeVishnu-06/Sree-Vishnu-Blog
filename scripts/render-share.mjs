import { chromium } from "playwright";
import { serveSite } from "./serve.mjs";
import { once } from "node:events";
const server = serveSite(".", 0);
await once(server, "listening");
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.goto(
    `http://127.0.0.1:${server.address().port}/assets/social.svg`,
  );
  await page.screenshot({ path: "assets/social.png" });
  console.log("Rendered local 1200×630 sharing image.");
} finally {
  await browser.close();
  server.close();
}
