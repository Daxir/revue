import { expect, test } from "@playwright/test";

test.describe("Given FAQ page", () => {
  test.describe("when double standard section is clicked", () => {
    test("then double standard explainer is displayed", async ({ page }) => {
      const sectionTitle = "What exactly is double standard?";
      const sectionContent =
        "A double standard product is a product to which multiple standards of quality are applied depending on a region this product is offered in.";
      await page.goto("http://localhost:3000/faq", {
        waitUntil: "networkidle",
      });
      await page.getByText(sectionTitle).click();
      await page.waitForSelector(`text=${sectionContent}`);
      expect(await page.isVisible(`text=${sectionContent}`)).toBeTruthy();
    });
  });
});
