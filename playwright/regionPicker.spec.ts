import { expect, test } from "@playwright/test";

test.describe("Given Region Picker", () => {
  test.describe("when region has been chosen", () => {
    test("then saves the value in local storage", async ({ page }) => {
      await page.goto("http://localhost:3000/");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-uk").click();

      let localStorage = await page.context().storageState();

      expect(
        JSON.parse(
          localStorage.origins
            .find((origin) => origin.origin === "http://localhost:3000")
            ?.localStorage.find((item) => item.name === "revue-selected-region")
            ?.value ?? "",
        ),
      ).toEqual("uk");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-de").click();

      localStorage = await page.context().storageState();

      expect(
        JSON.parse(
          localStorage.origins
            .find((origin) => origin.origin === "http://localhost:3000")
            ?.localStorage.find((item) => item.name === "revue-selected-region")
            ?.value ?? "",
        ),
      ).toEqual("de");

      await page.getByTestId("region-picker").click();

      await page.getByTestId("region-picker-pl").click();

      localStorage = await page.context().storageState();

      expect(
        JSON.parse(
          localStorage.origins
            .find((origin) => origin.origin === "http://localhost:3000")
            ?.localStorage.find((item) => item.name === "revue-selected-region")
            ?.value ?? "",
        ),
      ).toEqual("pl");
    });
  });
});
