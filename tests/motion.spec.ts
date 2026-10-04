import { test, expect } from "@playwright/test";

test("route transitions reset scroll and reveal content", async ({ page }) => {
  await page.goto("/");
  await page.locator(".tour-card").first().scrollIntoViewIfNeeded();
  await expect(page.locator(".tour-card").first()).toHaveClass(/is-revealed/);
  await page.locator(".tour-card .tour-image").first().click();
  await expect(page.locator(".route-stage")).toHaveAttribute(
    "data-route",
    "/tours/kolsai",
  );
  await expect(page.locator(".detail-title")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page.locator(".route-stage")).toHaveAttribute("data-route", "/");
});

test("mobile tabs can scroll and gallery accepts horizontal swipes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const tabs = page.locator(".destination-tabs");
  await expect(tabs.locator("button").last()).toBeVisible();
  expect(
    await tabs.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  await tabs.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await expect
    .poll(() => tabs.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await page.goto("/tours/kolsai");
  await page.locator(".detail-cover").click();
  const gallery = page.locator(".gallery-swipe");
  const bounds = (await gallery.boundingBox())!;
  const x = bounds.x + bounds.width * 0.8;
  const y = bounds.y + bounds.height * 0.5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - bounds.width * 0.6, y + 5, { steps: 8 });
  await page.mouse.up();
  await expect(gallery.locator("img")).toHaveAttribute(
    "src",
    "/images/kaindy.webp",
  );
  await expect(page.locator(".gallery-controls")).toContainText("2 / 2");
});

test("reduced motion keeps content visible and navigation immediate", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".scroll-progress")).toBeHidden();
  await expect(page.locator(".tour-card").first()).toHaveCSS("opacity", "1");
  await page.locator(".route-button").click();
  await expect(page.locator(".route-stage")).toHaveAttribute(
    "data-route",
    "/tours/kolsai",
  );
  await expect(page.locator(".route-stage")).toHaveCSS(
    "animation-name",
    "none",
  );
});
