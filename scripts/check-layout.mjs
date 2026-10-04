import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:4177");
await page
  .locator(".header")
  .getByRole("button", { name: "РУС", exact: true })
  .click();
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/joryq-ru-mobile.png" });
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  console.log(
    width,
    await page.evaluate(() => {
      const h = document.querySelector("h1");
      return {
        scroll: document.documentElement.scrollWidth,
        titleWidth: h.scrollWidth,
        container: h.clientWidth,
      };
    }),
  );
}
await browser.close();
