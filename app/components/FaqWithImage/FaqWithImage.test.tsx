import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { FaqWithImage } from ".";


vi.mock("@remix-run/react", () => ({ Link: () => {} }));

describe("Given FAQ with image component", () => {
  describe("when accordion is expanded", () => {
    test("then its panel is visible", async () => {
      render(<FaqWithImage />);
      await userEvent.click(screen.getByTestId("review-verification-control"));
      expect(screen.getByTestId("review-verification-panel")).toBeVisible();
    });
  });

  describe("when it has rendered", () => {
    test("then image is visible", () => {
      render(<FaqWithImage />);
      expect(screen.getByRole("img")).toBeVisible();
    });
  });
});
