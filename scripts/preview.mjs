import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await page.goto("http://127.0.0.1:4177", { waitUntil: "networkidle" });
await page.locator(".story").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "/tmp/joryq-desktop.png", fullPage: true });
await page.screenshot({ path: "/tmp/joryq-hero.png" });
console.log(
  await page.evaluate(() => ({
    title: document.title,
    width: document.documentElement.scrollWidth,
    images: [...document.images]
      .filter((x) => !x.complete || !x.naturalWidth)
      .map((x) => x.src),
    tiles: [...document.querySelectorAll(".leaflet-tile-loaded")].length,
  })),
);
await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.locator(".story").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "/tmp/joryq-mobile.png", fullPage: true });
await page.screenshot({ path: "/tmp/joryq-mobile-hero.png" });
console.log(
  "mobile",
  await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
  })),
);
await browser.close();
