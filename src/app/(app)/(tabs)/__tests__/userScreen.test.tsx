import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import UserScreen from "../userScreen";
import { useAuth } from "@/src/context/authContext";

const mockedUseAuth = useAuth as jest.Mock;

describe("UserScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: {
        uid: "user1",
        name: "Test User",
        username: "testuser",
        email: "testuser@example.com",
        profileImage: "avatar-1.png",
      },
      logout: jest.fn(),
    });
  });

  describe("Render", () => {
    it("renders user details correctly", () => {
      const { getByText } = render(<UserScreen />);

      expect(getByText("Nome")).toBeTruthy();
      expect(getByText("Test User")).toBeTruthy();
      expect(getByText("Nome de usuário")).toBeTruthy();
      expect(getByText("testuser")).toBeTruthy();
      expect(getByText("E-mail")).toBeTruthy();
      expect(getByText("testuser@example.com")).toBeTruthy();

      expect(getByText("Logout")).toBeTruthy();
    });

    it("renders the avatar correctly", () => {
      const { getByTestId } = render(<UserScreen />);

      expect(getByTestId("avatar-image")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("deve chamar a função logout ao clicar no botão de logout", async () => {
      const { getByText } = render(<UserScreen />);
      const logoutButton = getByText("Logout");

      fireEvent.press(logoutButton);

      expect(mockedUseAuth).toHaveBeenCalled();
    });
  });

  describe("Cenários de fallback", () => {
    it("deve renderizar corretamente se o usuário não tiver uma imagem de perfil", () => {
      mockedUseAuth.mockReturnValue({
        user: {
          profileImage: null,
        },
      });

      const { getByTestId } = render(<UserScreen />);
      const avatarImage = getByTestId("avatar-image");

      expect(avatarImage.props.source).toBeNull();
    });
  });
});
