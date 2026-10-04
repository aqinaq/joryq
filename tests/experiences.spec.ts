import { test, expect } from "@playwright/test";

for (const lang of ["kk", "ru"] as const) {
  for (const mobile of [false, true]) {
    test(`${lang} ${mobile ? "mobile" : "desktop"} experiences and keepsakes`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      );
      await page.goto("/");
      if (lang === "ru") await page.locator(".language button").last().click();
      await page.locator(".experience-destinations button").last().click();
      await expect(page.locator(".scene-location")).toHaveText(
        lang === "kk" ? "Маңғыстау кеңістігі" : "Просторы Мангистау",
      );
      const scene = page.locator(".immersive-scene");
      await scene.locator(".scene-control").first().click();
      await expect(scene).toHaveClass(/is-night/);
      await scene.locator(".story-point").last().click();
      await expect(page.locator(".scene-story")).toContainText(
        lang === "kk" ? "Аспан астындағы түн" : "Ночь под небом",
      );
      await page.locator(".scene-story button").click();
      await expect(page.locator(".scene-story")).toBeEmpty();
      const sound = scene.locator(".scene-control").last();
      await sound.click();
      await expect(sound).toHaveAttribute("aria-pressed", "true");
      await sound.click();
      await expect(sound).toHaveAttribute("aria-pressed", "false");
      await page.locator(".journey-stop").last().scrollIntoViewIfNeeded();
      await expect(page.locator(".journey-trace")).toHaveAttribute(
        "stroke-dashoffset",
        "0",
      );
      await expect(page.locator(".journey-atlas strong")).toHaveText(
        lang === "kk" ? "Бозжыра" : "Бозжыра",
      );
      await page.locator(".passport-save").click();
      await expect(page.locator(".passport-stamp.collected")).toHaveCount(1);
      await page.reload();
      await expect(page.locator(".passport-stamp.collected")).toHaveCount(1);
      await page
        .locator("#postcard-message")
        .fill(lang === "kk" ? "Көкжиекке қарай!" : "Навстречу горизонту!");
      const downloadPromise = page.waitForEvent("download");
      await page.locator(".postcard-actions button").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(`JORYQ-mangystau-${lang}.png`);
      await download.saveAs(
        `/private/tmp/joryq-postcard-${lang}-${mobile ? "mobile" : "desktop"}.png`,
      );
      expect(await download.failure()).toBeNull();
      await page.locator(".passport-stamp.collected").click();
      await expect(page).toHaveURL(/\/tours\/mangystau$/);
      await expect(page.locator(".route-stage")).toHaveAttribute(
        "data-route",
        "/tours/mangystau",
      );
      await expect(page.locator(".passport-save")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.locator(".passport-save").click();
      await expect(page.locator(".passport-stamp.collected")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      await page.locator(".immersion").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `/private/tmp/joryq-experience-${lang}-${mobile ? "mobile" : "desktop"}.png`,
      });
    });
  }
}

test("reduced motion and blocked storage keep experiences usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.goto("/tours/charyn");
  await expect(page.locator(".scene-photo")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".journey-trace")).toHaveAttribute(
    "stroke-dashoffset",
    "0",
  );
  await page.locator(".passport-save").click();
  await expect(page.locator(".passport-stamp.collected")).toHaveCount(1);
  await expect(page.locator(".travel-passport [role=status]")).toContainText(
    "Браузер",
  );
  await page.locator(".story-point").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".scene-story")).toContainText("Тастың хаты");
});

test("place stories switch with destinations and expose their sources", async ({
  page,
}) => {
  await page.goto("/");
  const tabs = page.locator(".experience-destinations button");
  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    await expect(page.locator(".scene-story")).toBeEmpty();
    await page.locator(".story-point").first().click();
    await expect(page.locator(".place-lore a")).toHaveAttribute(
      "href",
      /^https:\/\//,
    );
    await expect(page.locator(".place-lore p")).not.toBeEmpty();
    if (i === 4)
      await expect(page.locator(".place-lore .eyebrow")).toHaveText(
        "ХАЛЫҚ АҢЫЗЫ",
      );
  }
  await page.locator(".scene-controls button").first().click();
  await expect(page.locator(".immersive-scene")).toHaveClass(/is-night/);
  await page.locator(".immersion").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "/private/tmp/joryq-night-story.png",
    animations: "disabled",
  });
  await page.locator(".keepsakes").scrollIntoViewIfNeeded();
  await expect(page.locator(".postcard-preview strong")).toBeVisible();
  await page
    .locator(".postcard-preview img")
    .evaluate((img: HTMLImageElement) => img.decode());
  await page.screenshot({
    path: "/private/tmp/joryq-keepsakes.png",
    animations: "disabled",
  });
});
