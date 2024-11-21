import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUp from "../signUp";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert");

const mockedUseAuth = useAuth as jest.Mock;

describe("SignUp", () => {
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
    it("should render all input fields", () => {
      const { getByPlaceholderText } = render(<SignUp />);
      expect(getByPlaceholderText("Digite seu nome completo")).toBeTruthy();
      expect(getByPlaceholderText("Digite seu nome de usuário")).toBeTruthy();
      expect(getByPlaceholderText("Digite seu e-mail")).toBeTruthy();
      expect(getByPlaceholderText("Mínimo de 6 caracteres")).toBeTruthy();
    });

    it("should render the create account button", () => {
      const { getByText } = render(<SignUp />);
      expect(getByText("Criar Conta")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should allow the user to input their name", () => {
      const { getByPlaceholderText } = render(<SignUp />);
      const nameInput = getByPlaceholderText("Digite seu nome completo");
      fireEvent.changeText(nameInput, "Igor Pestana");
      expect(nameInput.props.value).toBe("Igor Pestana");
    });

    it("should validate email format correctly", async () => {
      const { getByPlaceholderText, queryByTestId } = render(<SignUp />);

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
      const { getByPlaceholderText, getByTestId } = render(<SignUp />);

      const passwordInput = getByPlaceholderText("Mínimo de 6 caracteres");
      const toggleVisibilityButton = getByTestId("password-visibility-toggle");

      fireEvent.press(toggleVisibilityButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      fireEvent.press(toggleVisibilityButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it("should call the register function when 'Criar Conta' is pressed", async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        success: true,
        msg: "Success",
      });
      mockedUseAuth.mockReturnValue({ register: mockRegister });

      const { getByText, getByPlaceholderText } = render(<SignUp />);
      const nameInput = getByPlaceholderText("Digite seu nome completo");
      const usernameInput = getByPlaceholderText("Digite seu nome de usuário");
      const emailInput = getByPlaceholderText("Digite seu e-mail");
      const passwordInput = getByPlaceholderText("Mínimo de 6 caracteres");
      const createAccountButton = getByText("Criar Conta");

      fireEvent.changeText(nameInput, "Igor Pestana");
      fireEvent.changeText(usernameInput, "igor123");
      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");

      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          "Igor Pestana",
          "igor123",
          "test@example.com",
          "password123",
          "avatar-1.png"
        );
      });
    });

    it("should show an alert if registration fails", async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        success: false,
        msg: "Erro ao criar conta",
      });
      mockedUseAuth.mockReturnValue({ register: mockRegister });

      const { getByText, getByPlaceholderText } = render(<SignUp />);
      const nameInput = getByPlaceholderText("Digite seu nome completo");
      const usernameInput = getByPlaceholderText("Digite seu nome de usuário");
      const emailInput = getByPlaceholderText("Digite seu e-mail");
      const passwordInput = getByPlaceholderText("Mínimo de 6 caracteres");
      const createAccountButton = getByText("Criar Conta");

      fireEvent.changeText(nameInput, "Igor Pestana");
      fireEvent.changeText(usernameInput, "igor123");
      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.changeText(passwordInput, "password123");

      fireEvent.press(createAccountButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Cadastro", "Erro ao criar conta");
      });
    });

    it("should navigate to login screen when 'Acessar conta' is pressed", () => {
      const { getByText } = render(<SignUp />);
      const accessAccountButton = getByText("Acessar conta");

      fireEvent.press(accessAccountButton);
      expect(router.push).toHaveBeenCalledWith("/signIn");
    });
  });
});
