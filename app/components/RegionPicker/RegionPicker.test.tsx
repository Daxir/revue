import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { RegionPicker } from ".";

vi.mock("@remix-run/react", () => ({
  Link: () => {},
  useLocation: () => ({ pathname: "/" }),
}));

describe("Given RegionPicker component", () => {
  describe("When component renders for the first time", () => {
    test("Then default option (all) should be selected", () => {
      render(<RegionPicker />);
      expect(screen.getByTestId("icon-world")).toBeVisible();
      expect(localStorage.getItem("revue-selected-region")).toBeNull();
    });

    test("Then it should display correct label on hover", async () => {
      render(<RegionPicker />);
      await userEvent.hover(screen.getByTestId("region-picker"));
      expect(screen.getByText("Region (All)")).toBeVisible();
    });
  });

  describe("When user clicks on the component", () => {
    test("Then list of regions should be visible", async () => {
      render(<RegionPicker />);
      await userEvent.click(screen.getByTestId("region-picker"));
      const regions = await screen.findAllByTestId(
        /region-picker-(uk|pl|de|all)/,
      );
      expect(regions).toHaveLength(4);
      await waitFor(() => {
        for (const region of regions) {
          expect(region).toBeVisible();
        }
      });
    });

    describe("When user selects a region", () => {
      test("Then it should save selected value in local storage", async () => {
        render(<RegionPicker />);
        await userEvent.click(screen.getByTestId("region-picker"));
        await userEvent.click(screen.getByTestId("region-picker-pl"));
        expect(localStorage.getItem("revue-selected-region")).toBe(
          JSON.stringify("pl"),
        );
      });
    });
  });

  describe("When user already set the region", () => {
    test("Then the value should be loaded from local storage", () => {
      localStorage.setItem("revue-selected-region", JSON.stringify("pl"));
      render(<RegionPicker />);
      expect(screen.getByTestId("icon-poland")).toBeVisible();
    });

    test("Then it should display correct label on hover", async () => {
      render(<RegionPicker />);
      await userEvent.hover(screen.getByTestId("region-picker"));
      expect(screen.getByText("Region (Polish)")).toBeVisible();
    });
  });
});
