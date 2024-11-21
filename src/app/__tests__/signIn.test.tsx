import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignIn from "../signIn";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert");

const mockedUseAuth = useAuth as jest.Mock;

describe("SignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        uid: "user1",
        username: "testuser",
        profileImage: "avatar-1.png",
      },
    });
  });

  describe("Render", () => {
    it("should render all input fields and buttons", () => {
      const { getByPlaceholderText, getByText } = render(<SignIn />);

      expect(getByPlaceholderText("Digite seu e-mail")).toBeTruthy();
      expect(getByPlaceholderText("Digite sua senha")).toBeTruthy();

      expect(getByText("Entrar")).toBeTruthy();
      expect(getByText("Criar conta")).toBeTruthy();
      expect(getByText("Esqueceu sua senha?")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should validate email on change", async () => {
      const { getByPlaceholderText, queryByTestId } = render(<SignIn />);

      const emailInput = getByPlaceholderText("Digite seu e-mail");

      fireEvent.changeText(emailInput, "invalid-email");
      await waitFor(() => {
        expect(queryByTestId("email-valid-icon")).toBeNull();
      });

      fireEvent.changeText(emailInput, "test@example.com");
      await waitFor(() => {
        expect(queryByTestId("email-valid-icon")).toBeTruthy();
      });
    });

    it("should toggle password visibility", () => {
      const { getByPlaceholderText, getByTestId } = render(<SignIn />);
      const passwordInput = getByPlaceholderText("Digite sua senha");
      const toggleButton = getByTestId("password-visibility-toggle");

      expect(passwordInput.props.secureTextEntry).toBe(true);

      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it("should display an alert if email or password is empty on login", () => {
      const { getByText } = render(<SignIn />);
      const loginButton = getByText("Entrar");

      fireEvent.press(loginButton);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Sign In",
        "Por favor preencha todos os campos!"
      );
    });

    it("should call login method and handle failure", async () => {
      mockedUseAuth.mockReturnValue({
        login: jest.fn().mockResolvedValue({ success: false, msg: "Erro no login" }),
      });

      const { getByPlaceholderText, getByText } = render(<SignIn />);
      const emailInput = getByPlaceholderText("Digite seu e-mail");
      const passwordInput = getByPlaceholderText("Digite sua senha");
      const loginButton = getByText("Entrar");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Login", "Erro no login");
      });
    });

    it("should navigate to the sign-up screen when 'Criar conta' is pressed", () => {
      const { getByText } = render(<SignIn />);
      const signUpButton = getByText("Criar conta");

      fireEvent.press(signUpButton);
      expect(router.push).toHaveBeenCalledWith("/signUp");
    });
  });
});
