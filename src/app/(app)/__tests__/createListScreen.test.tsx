import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateListScreen from "../createListScreen";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { addDoc } from "firebase/firestore";
import { router } from "expo-router";
import { listsRef } from "@/firebaseConfig";

jest.spyOn(Alert, "alert");

const mockedUseAuth = useAuth as jest.Mock;
const mockedAddDoc = addDoc as jest.Mock;

describe("CreateListScreen", () => {
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
    it("should render correctly with initial state", () => {
      const { getByPlaceholderText, getByText } = render(<CreateListScreen />);
      expect(getByPlaceholderText("Título")).toBeTruthy();
      expect(getByPlaceholderText("Descrição da lista")).toBeTruthy();
      expect(getByPlaceholderText("Adicione um novo item")).toBeTruthy();
      expect(getByText("Salvar")).toBeTruthy();
    });

    it("should render empty list when no items are added", () => {
      const { queryByText } = render(<CreateListScreen />);
      expect(queryByText("Excluir Item")).toBeNull();
    });
  });

  describe("Interactions", () => {
    it("should show an alert if title is empty when saving the list", async () => {
      const { getByText } = render(<CreateListScreen />);

      fireEvent.press(getByText("Salvar"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Aviso",
          "Digite um título para a lista."
        );
      });
    });

    it("should add a new item to the list", async () => {
      const { getByPlaceholderText, getByTestId } = render(
        <CreateListScreen />
      );

      const itemInput = getByPlaceholderText("Adicione um novo item");
      fireEvent.changeText(itemInput, "Novo Item");

      const addButton = getByTestId("add-item-button");
      fireEvent.press(addButton);

      await waitFor(() => {
        const newItemInput = getByTestId("item-name-0");
        expect(newItemInput.props.value).toBe("Novo Item");
      });
    });

    it("should delete an item from the list", async () => {
      const { getByPlaceholderText, getByText, queryByText, getByTestId } =
        render(<CreateListScreen />);

      const itemInput = getByPlaceholderText("Adicione um novo item");
      fireEvent.changeText(itemInput, "Item a ser deletado");

      const addButton = getByTestId("add-item-button");
      fireEvent.press(addButton);

      fireEvent.press(getByText("Excluir Item"));
      expect(queryByText("Item a ser deletado")).toBeNull();
    });

    it("should create a list when valid data is provided", async () => {
      mockedAddDoc.mockImplementationOnce(async (collection, data) => {
        console.log("Mocked addDoc called with data:", data);
        return { id: "mockListId" };
      });

      const { getByPlaceholderText, getByText } = render(<CreateListScreen />);

      fireEvent.changeText(getByPlaceholderText("Título"), "Minha Lista");
      fireEvent.changeText(
        getByPlaceholderText("Descrição da lista"),
        "Descrição Teste"
      );
      fireEvent.press(getByText("Salvar"));

      await waitFor(() => {
        expect(addDoc).toHaveBeenCalledWith(
          listsRef,
          expect.objectContaining({
            title: "Minha Lista",
            description: "Descrição Teste",
            items: [],
            ownerId: "user1",
            sharedWith: [],
            createdAt: "mock-timestamp",
            updatedAt: "mock-timestamp",
            status: "active",
          })
        );

        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Lista criada com sucesso!"
        );
        expect(router.push).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should show an error alert when list creation fails", async () => {
      mockedAddDoc.mockRejectedValueOnce(new Error("Firestore Error"));

      const { getByPlaceholderText, getByText } = render(<CreateListScreen />);

      fireEvent.changeText(getByPlaceholderText("Título"), "Minha Lista");
      fireEvent.press(getByText("Salvar"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Houve um erro ao criar a lista. Tente novamente."
        );
        expect(router.push).toHaveBeenCalledWith("/dashboard");
      });
    });
  });
});
