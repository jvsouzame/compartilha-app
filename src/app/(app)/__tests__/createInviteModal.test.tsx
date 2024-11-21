import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateInviteModal from "../createInviteModal";
import { Alert } from "react-native";
import { addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/src/context/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { invitesRef } from "@/firebaseConfig";

jest.spyOn(Alert, "alert");

const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedAddDoc = addDoc as jest.Mock;
const mockedGetDocs = getDocs as jest.Mock;

describe("CreateInviteModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        uid: "user1",
        username: "testuser",
        profileImage: "avatar-1.png",
      },
    });

    mockedUseRouter.mockReturnValue({
      back: jest.fn(),
    });

    mockedUseLocalSearchParams.mockReturnValue({
      listId: "list123",
      listTitle: "Test List",
    });
  });

  describe("Render", () => {
    it("should render the component correctly", () => {
      const { getByPlaceholderText, getByText } = render(<CreateInviteModal />);

      expect(getByPlaceholderText("Digite o email")).toBeTruthy();
      expect(getByText("Convidar")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should display an alert if the email is empty", () => {
      const { getByText } = render(<CreateInviteModal />);

      const button = getByText("Convidar");
      fireEvent.press(button);

      expect(Alert.alert).toHaveBeenCalledWith("Aviso", "Digite um e-mail.");
    });

    it("should display an error if the user is not found", async () => {
      const { getByText, getByPlaceholderText } = render(<CreateInviteModal />);

      const input = getByPlaceholderText("Digite o email");
      fireEvent.changeText(input, "notfound@email.com");

      const button = getByText("Convidar");
      fireEvent.press(button);

      await waitFor(() =>
        expect(getByText("Usuário não encontrado")).toBeTruthy()
      );
    });

    it("should display an error message on invitation sending failure", async () => {
      mockedGetDocs.mockRejectedValueOnce(
        new Error("Erro no Firebase")
      );

      const { getByText, getByPlaceholderText } = render(<CreateInviteModal />);

      const input = getByPlaceholderText("Digite o email");
      fireEvent.changeText(input, "error@email.com");

      const button = getByText("Convidar");
      fireEvent.press(button);

      await waitFor(() =>
        expect(getByText("Ocorreu um erro. Tente novamente.")).toBeTruthy()
      );
    });

    it("should send an invitation if the user is found", async () => {
      mockedGetDocs.mockResolvedValueOnce({
        empty: false,
        forEach: (callback: any) =>
          callback({ id: "foundUser", data: jest.fn() }),
      });

      mockedAddDoc.mockImplementationOnce(async (collection, data) => {
        console.log("Mocked addDoc called with data:", data);
        return { id: "mockInviteId" };
      });

      const { getByText, getByPlaceholderText } = render(<CreateInviteModal />);

      const input = getByPlaceholderText("Digite o email");
      fireEvent.changeText(input, "found@email.com");

      const button = getByText("Convidar");
      fireEvent.press(button);

      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(invitesRef, {
          listId: "list123",
          listTitle: "Test List",
          fromUserId: "user1",
          fromUsername: "testuser",
          profileImage: "avatar-1.png",
          toUserId: "foundUser",
          createdAt: "mock-timestamp",
          updatedAt: "mock-timestamp",
          status: "pending",
        });

        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Convite enviado com sucesso!"
        );
      });
    });
  });
});
