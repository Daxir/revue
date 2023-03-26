import { ProductCategory } from "@prisma/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { CategorySelect } from ".";

describe("Given CategorySelect component", () => {
  describe("When component renders for the first time", () => {
    test("Then popover should be hidden", () => {
      render(<CategorySelect />);
      expect(screen.getByTestId("category-select-popover")).not.toBeVisible();
    });
  });

  describe("When user clicks on the component", () => {
    test("Then popover should be visible", async () => {
      render(<CategorySelect />);
      await userEvent.click(screen.getByTestId("category-select-button"));
      expect(screen.getByTestId("category-select-popover")).toBeVisible();
    });
    test("Then list of categories should be visible", async () => {
      render(<CategorySelect />);
      await userEvent.click(screen.getByTestId("category-select-button"));
      const categories = await screen.findAllByTestId(
        new RegExp(
          `category-(${ProductCategory.DETERGENT}|${ProductCategory.THERMAL_MUG}|${ProductCategory.DISHWASHER_CUBE})-checkbox`,
        ),
      );
      expect(categories).toHaveLength(3);
      await waitFor(() => {
        for (const categoryCheckbox of categories) {
          expect(categoryCheckbox).toBeVisible();
        }
      });
    });

    describe("When user clicks on the button when popover is visible", () => {
      test("Then popover should be hidden", async () => {
        render(<CategorySelect />);
        await userEvent.click(screen.getByTestId("category-select-button"));
        expect(screen.getByTestId("category-select-popover")).toBeVisible();
        await userEvent.click(screen.getByTestId("category-select-button"));
        expect(screen.getByTestId("category-select-popover")).not.toBeVisible();
      });
    });
  });
});
