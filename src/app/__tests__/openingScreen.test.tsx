import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OpeningScreen from "../openingScreen";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn((callback) => callback()),
  router: {
    push: jest.fn(),
  },
}));

describe("OpeningScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Render", () => {
    it("should render the logo image", () => {
      const { getByTestId } = render(<OpeningScreen />);
      const logoImage = getByTestId("compartilha-logo");
      expect(logoImage).toBeTruthy();
    });

    it("should render the main title", () => {
      const { getByText } = render(<OpeningScreen />);
      expect(
        getByText("Participe da comunidade compartilha+")
      ).toBeTruthy();
    });

    it("should render the subtitle", () => {
      const { getByText } = render(<OpeningScreen />);
      expect(
        getByText(
          "Organize campanhas e compras colaborativas em um só lugar"
        )
      ).toBeTruthy();
    });

    it("should render the 'Entrar' button", () => {
      const { getByText } = render(<OpeningScreen />);
      expect(getByText("Entrar")).toBeTruthy();
    });

    it("should render the 'Criar Conta' button", () => {
      const { getByText } = render(<OpeningScreen />);
      expect(getByText("Criar Conta")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should navigate to '/signIn' when 'Entrar' button is pressed", () => {
      const { getByText } = render(<OpeningScreen />);
      const entrarButton = getByText("Entrar");

      fireEvent.press(entrarButton);

      expect(router.push).toHaveBeenCalledWith("/signIn");
    });

    it("should navigate to '/signUp' when 'Criar Conta' button is pressed", () => {
      const { getByText } = render(<OpeningScreen />);
      const criarContaButton = getByText("Criar Conta");

      fireEvent.press(criarContaButton);

      expect(router.push).toHaveBeenCalledWith("/signUp");
    });
  });
});
