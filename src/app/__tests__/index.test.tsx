import React from "react";
import { render } from "@testing-library/react-native";
import StartPage from "../index";

describe("StartPage", () => {
  describe("Render", () => {
    it("should render the activity indicator", () => {
      const { getByTestId } = render(<StartPage />);
      const activityIndicator = getByTestId("activity-indicator");
      expect(activityIndicator).toBeTruthy();
    });

    it("should have the correct structure", () => {
      const { getByTestId } = render(<StartPage />);
      const container = getByTestId("start-page-container");
      expect(container).toBeTruthy();
    });
  });
});