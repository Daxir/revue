import { expect, test } from "@playwright/test";
import { UserType } from "@prisma/client";
import { loginAs } from "./helpers/auth.helper";

test.describe("Given add product page", () => {
  test.describe("when valid data is provided", () => {
    test("then product is added", async ({ page }) => {
      const productName = Math.random().toString(36).slice(2, 10);
      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products/new", {
        waitUntil: "networkidle",
      });

      await page.getByRole("textbox", { name: "name" }).fill(productName);
      await page
        .getByRole("textbox", { name: "manufacturer" })
        .fill("Test manufacturer");
      await page.getByLabel("Category").selectOption("THERMAL_MUG");
      await page.getByLabel("Countries").click();
      await page.waitForSelector("text=UK");
      await page.getByText("UK").click();
      await page
        .getByRole("textbox", { name: "description" })
        .fill("Test description");

      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        page.locator(".mantine-Dropzone-root").click(),
      ]);
      await fileChooser.setFiles("./playwright/fixtures/image.jpg");

      await page.getByText("Submit").click();
      await page.waitForSelector("text=Add product");
      const row = page.locator("tr", { hasText: productName });
      expect(await row.isVisible()).toBeTruthy();
    });
  });

  test.describe("when invalid data is provided", () => {
    test.describe("being invalid product name", () => {
      test("then product is not added and error is shown", async ({ page }) => {
        const productName = Array.from({ length: 40 }, () => "a").join("");
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/admin/products/new", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill(productName);
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.getByLabel("Category").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.waitForSelector("text=UK");
        await page.getByText("UK").click();
        await page
          .getByRole("textbox", { name: "description" })
          .fill("Test description");
        await page.setInputFiles(
          "input[type=file]",
          "./playwright/fixtures/image.jpg",
        );

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
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/admin/products/new", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill(manufacturerName);
        await page.getByLabel("Category").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.waitForSelector("text=UK");
        await page.getByText("UK").click();
        await page
          .getByRole("textbox", { name: "description" })
          .fill("Test description");
        await page.setInputFiles(
          "input[type=file]",
          "./playwright/fixtures/image.jpg",
        );

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
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/admin/products/new", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.getByLabel("Category").selectOption("THERMAL_MUG");
        await page
          .getByRole("textbox", { name: "description" })
          .fill("Test description");
        await page.setInputFiles(
          "input[type=file]",
          "./playwright/fixtures/image.jpg",
        );

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
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/admin/products/new", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.getByLabel("Category").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.waitForSelector("text=UK");
        await page.getByText("UK").click();
        await page
          .getByRole("textbox", { name: "description" })
          .fill(description);
        await page.setInputFiles(
          "input[type=file]",
          "./playwright/fixtures/image.jpg",
        );

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
        await loginAs(UserType.ADMIN, page);
        await page.waitForSelector("#homepage-logo");

        await page.goto("http://localhost:3000/admin/products/new", {
          waitUntil: "networkidle",
        });

        await page.getByRole("textbox", { name: "name" }).fill("Test product");
        await page
          .getByRole("textbox", { name: "manufacturer" })
          .fill("Test manufacturer");
        await page.getByLabel("Category").selectOption("THERMAL_MUG");
        await page.getByLabel("Countries").click();
        await page.waitForSelector("text=UK");
        await page.getByText("UK").click();
        await page
          .getByRole("textbox", { name: "description" })
          .fill("Test description");

        await page.getByText("Submit").click();
        await page.waitForSelector("text=File is not a PNG or JPEG image");
        expect(
          await page.getByText("File is not a PNG or JPEG image").isVisible(),
        ).toBeTruthy();
      });
    });
  });

  test.describe("when adding a product is aborted", () => {
    test("then product is not added", async ({ page }) => {
      const productName = Math.random().toString(36).slice(2, 10);

      await loginAs(UserType.ADMIN, page);
      await page.waitForSelector("#homepage-logo");

      await page.goto("http://localhost:3000/admin/products/new", {
        waitUntil: "networkidle",
      });

      await page.getByRole("textbox", { name: "name" }).fill(productName);
      await page
        .getByRole("textbox", { name: "manufacturer" })
        .fill("Test manufacturer");
      await page.getByLabel("Category").selectOption("THERMAL_MUG");
      await page.getByLabel("Countries").click();
      await page.waitForSelector("text=UK");
      await page.getByText("UK").click();
      await page
        .getByRole("textbox", { name: "description" })
        .fill("Test description");
      await page.setInputFiles(
        "input[type=file]",
        "./playwright/fixtures/image.jpg",
      );

      const cancelButton = page.locator("#cancel-button");
      await cancelButton.click();
      await page.waitForSelector("text=Add product");
      const row = page.locator("tr", { hasText: productName });
      expect(await row.isVisible()).toBeFalsy();
    });
  });
});
