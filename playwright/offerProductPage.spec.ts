import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs } from "./helpers/auth.helper";

test.describe("Given add product page", () => {
  test.describe("when valid data is provided", () => {
    test("then product and review is added", async ({ page }) => {
      const productName = Math.random().toString(36).slice(2, 10);
      await loginAs(UserType.USER, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/offer-product", {
        waitUntil: "networkidle",
      });

      await page.getByRole("textbox", { name: "name" }).fill(productName);
      await page
        .getByRole("textbox", { name: "manufacturer" })
        .fill("Test manufacturer");
      await page.locator("[name=category]").selectOption("THERMAL_MUG");
      await page.getByLabel("Countries").click();
      await page.locator('[role=option] >> text="UK"').click();
      await page.locator("#description").fill("Test description");

      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        page.locator(".mantine-Dropzone-root").click(),
      ]);
      await fileChooser.setFiles("./playwright/fixtures/image.jpg");

      await page.locator("[name=reviewCategory]").selectOption("positive");
      await page.locator("[name=reviewLanguage]").selectOption("UK");
      await page.locator("#reviewDescription").fill("It's good!");
      await page.getByTestId("grade-rating").click();

      await page.getByText("Submit").click();
      await page.waitForSelector("#homepage-logo");
      expect(page.url()).toBe("http://localhost:3000/");
    });

    test.describe('and "Attach a review" checkbox is unchecked', () => {
      test("then only product is added", async ({ page }) => {
        const productName = Math.random().toString(36).slice(2, 10);
      await loginAs(UserType.USER, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/offer-product", {
        waitUntil: "networkidle",
      });

      await page.getByText("Attach").click();
      await page.getByRole("textbox", { name: "name" }).fill(productName);
      await page
        .getByRole("textbox", { name: "manufacturer" })
        .fill("Test manufacturer");
      await page.locator("[name=category]").selectOption("THERMAL_MUG");
      await page.getByLabel("Countries").click();
      await page.locator('[role=option] >> text="UK"').click();
      await page.locator("#description").fill("Test description");

      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        page.locator(".mantine-Dropzone-root").click(),
      ]);
      await fileChooser.setFiles("./playwright/fixtures/image.jpg");

      await page.getByText("Submit").click();
      await page.waitForSelector("#homepage-logo");
      expect(page.url()).toBe("http://localhost:3000/");
      });
    });
  });

  test.describe("when invalid data is provided", () => {
    test.describe("being invalid product name", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        const productName = Array.from({ length: 40 }, () => "a").join("");
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill(productName);
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.locator('[role=option] >> text="UK"').click();
        await page.locator("#description").fill("Test description");

        const [fileChooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          page.locator(".mantine-Dropzone-root").click(),
        ]);
        await fileChooser.setFiles("./playwright/fixtures/image.jpg");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill("It's good!");

        await page.getByText("Submit").click();
        await page.waitForSelector("[role=alert]");
        expect(
          await page
            .getByText("name must be at most 30 characters")
            .isVisible(),
        ).toBeTruthy();
      });
    });

    test.describe("being invalid manufacturer name", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        const manufacturerName = Array.from({ length: 40 }, () => "a").join("");
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill(manufacturerName);
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.locator('[role=option] >> text="UK"').click();
        await page.locator("#description").fill("Test description");

        const [fileChooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          page.locator(".mantine-Dropzone-root").click(),
        ]);
        await fileChooser.setFiles("./playwright/fixtures/image.jpg");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill("It's good!");

        await page.getByText("Submit").click();
        await page.waitForSelector("[role=alert]");
        expect(
          await page
            .getByText("manufacturer must be at most 30 characters")
            .isVisible(),
        ).toBeTruthy();
      });
    });

    test.describe("being empty country value", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.locator("#description").fill("Test description");

        const [fileChooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          page.locator(".mantine-Dropzone-root").click(),
        ]);
        await fileChooser.setFiles("./playwright/fixtures/image.jpg");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill("It's good!");

        await page.getByText("Submit").click();
        await page.waitForSelector("[role=alert]");
        expect(
          await page.getByText("countries is a required field").isVisible(),
        ).toBeTruthy();
      });
    });

    test.describe("being invalid description", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        const description = Array.from({ length: 400 }, () => "a").join("");
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.locator('[role=option] >> text="UK"').click();
        await page.locator("#description").fill(description);

        const [fileChooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          page.locator(".mantine-Dropzone-root").click(),
        ]);
        await fileChooser.setFiles("./playwright/fixtures/image.jpg");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill("It's good!");

        await page.getByText("Submit").click();
        await page.waitForSelector("[role=alert]");
        expect(
          await page
            .getByText("description must be at most 200 characters")
            .isVisible(),
        ).toBeTruthy();
      });
    });

    test.describe("being invalid image", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.locator('[role=option] >> text="UK"').click();
        await page.locator("#description").fill("Test description");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill("It's good!");

        await page.getByText("Submit").click();
        await page.waitForSelector("text=File is not a PNG or JPEG image");
        expect(
          await page.getByText("File is not a PNG or JPEG image").isVisible(),
        ).toBeTruthy();
      });
    });
    test.describe("being invalid review's description", () => {
      test("then product and review is not added and error is shown", async ({ page }) => {
        const description = Array.from({ length: 400 }, () => "a").join("");
        await loginAs(UserType.USER, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/offer-product", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.locator("[name=category]").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.locator('[role=option] >> text="UK"').click();
        await page.locator("#description").fill("Test description");

        const [fileChooser] = await Promise.all([
          page.waitForEvent("filechooser"),
          page.locator(".mantine-Dropzone-root").click(),
        ]);
        await fileChooser.setFiles("./playwright/fixtures/image.jpg");

        await page.locator("[name=reviewCategory]").selectOption("positive");
        await page.locator("[name=reviewLanguage]").selectOption("UK");
        await page.locator("#reviewDescription").fill(description);

        await page.getByText("Submit").click();
        await page.waitForSelector("[role=alert]");
        expect(
          await page
            .getByText("description must be at most 200 characters")
            .isVisible(),
        ).toBeTruthy();
      });
    });
  });
});
