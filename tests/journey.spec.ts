import { test, expect } from "@playwright/test";
test("selected landscape colors follow the map and detail page", async ({ page }) => {
  await page.goto("/");
  await page.locator(".route-option").nth(1).click();
  await expect(page.locator("html")).toHaveAttribute("data-tour-theme", "charyn");
  await expect(page.locator(".hero-cta")).toHaveCSS("background-color", "rgb(240, 189, 131)");
  await expect(page.locator(".route-picker")).toHaveCSS("background-color", "rgb(250, 240, 229)");
  await expect(page.locator(".leaflet-overlay-pane path").last()).toHaveAttribute("stroke", "#a75530");
  await page.locator(".route-button").click();
  await expect(page.locator("html")).toHaveAttribute("data-tour-theme", "charyn");
  await page.goto("/tours/turgen");
  await expect(page.locator("html")).toHaveAttribute("data-tour-theme", "turgen");
  await expect(page.locator(".footer-cta")).toHaveCSS("background-color", "rgb(40, 84, 56)");
});
for (const lang of ["kk", "ru"] as const) {
  for (const mobile of [false, true]) {
    test(`${lang} ${mobile ? "mobile" : "desktop"} complete journey`, async ({
      page,
    }) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      if (lang === "ru")
        await page
          .locator(".header")
          .getByRole("button", { name: "РУС", exact: true })
          .click();
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      const search = page.locator(".quick-search");
      await search.locator("select").nth(1).selectOption("2");
      await search.getByRole("button").click();
      await expect(page.locator(".tour-card")).toHaveCount(3);
      await page
        .locator(".tour-card")
        .nth(0)
        .locator(".compare-toggle")
        .click();
      await page
        .locator(".tour-card")
        .nth(1)
        .locator(".compare-toggle")
        .click();
      await expect(page.locator(".compare-chips>span")).toHaveCount(2);
      await page.locator(".compare-bar>.button").click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.locator(".compare-row")).toHaveCount(7);
      await dialog.locator(".compare-head a").first().click();
      await expect(page).toHaveURL(/\/tours\/kolsai$/);
      await page
        .locator(".detail-body details")
        .nth(1)
        .locator("summary")
        .click();
      await expect(page.locator(".detail-body details").nth(1)).toHaveAttribute(
        "open",
        "",
      );
      await page.locator(".booking-panel input[type=date]").fill("2027-06-15");
      await page.locator(".booking-panel .number-input button").last().click();
      await expect(page.locator(".booking-panel .booking-total")).toContainText(
        "130",
      );
      await page.locator(".booking-panel>.button").click();
      await dialog.locator(".contact-fields input").first().fill("Айдана");
      await dialog.locator("input[type=tel]").fill("+7 701 234 56 78");
      await dialog.locator("button[type=submit]").click();
      await expect(dialog.locator(".success")).toContainText(
        lang === "kk"
          ? "Өтінім туристік компанияға жіберілген жоқ."
          : "Заявка не была отправлена туристической компании.",
      );
      await expect(dialog.locator(".request-summary")).toContainText(
        "2027-06-15",
      );
      await expect(dialog.locator(".request-summary")).toContainText("130");
      await dialog.locator(".success>.button").click();
      await page
        .locator(".header")
        .getByRole("button", {
          name: lang === "kk" ? "РУС" : "ҚАЗ",
          exact: true,
        })
        .click();
      await expect(page.locator(".booking-panel input[type=date]")).toHaveValue(
        "2027-06-15",
      );
      await expect(
        page.locator(".booking-panel input[type=number]"),
      ).toHaveValue("2");
      await expect(page.locator(".compare-chips>span")).toHaveCount(2);
      await page.goto("/");
      await expect(page.locator(".tour-card")).toHaveCount(3);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}
test("map, direct URLs, empty state, validation and keyboard gallery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({
    timeout: 30000,
  });
  const before = await page
    .locator(".leaflet-control-scale-line")
    .textContent();
  await page.getByRole("button", { name: "Жақындату", exact: true }).click();
  await page.waitForTimeout(500);
  expect(
    await page.locator(".leaflet-control-scale-line").textContent(),
  ).not.toBe(before);
  await page.locator(".route-option").nth(1).click();
  await expect(page.locator(".route-option").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.locator(".route-label").filter({ hasText: "Қамалдар аңғары" }),
  ).toBeVisible();
  await page.locator(".desktop-filters select").nth(1).selectOption("Астана");
  await page.locator(".desktop-filters select").nth(2).selectOption("1");
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.locator(".empty-state button").click();
  await expect(page.locator(".tour-card")).toHaveCount(6);
  for (const id of [
    "kolsai",
    "charyn",
    "altyn",
    "turgen",
    "burabay",
    "mangystau",
  ]) {
    await page.goto("/tours/" + id);
    await expect(page.locator(".detail-title h1")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator(".detail-cover img")
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBe(true);
  }
  await page.goto("/tours/kolsai");
  await page.locator(".detail-cover").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".gallery-image")).toHaveAttribute(
    "src",
    "/images/kaindy.webp",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator(".booking-panel>.button").click();
  await page.locator("dialog button[type=submit]").click();
  await expect(page.locator(".field-error")).toHaveCount(3);
});
