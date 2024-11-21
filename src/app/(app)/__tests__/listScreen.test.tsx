import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ListScreen from "../listScreen";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { updateDoc } from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";

jest.spyOn(Alert, "alert");

const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUpdateDoc = updateDoc as jest.Mock;

describe("ListScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        uid: "user1",
        username: "testuser",
        profileImage: "avatar-1.png",
      },
    });

    mockedUseLocalSearchParams.mockReturnValue({
      params: JSON.stringify({
        id: "123",
        title: "Test List",
        description: "Test Description",
        items: [
          { name: "Item 1", quantity: 1, checked: false },
          { name: "Item 2", quantity: 2, checked: true },
        ],
        status: "active",
        sharedWith: [],
        ownerId: "user1",
      }),
    });
  });

  describe("Render", () => {
    it("should render the list title and description", () => {
      const { getByText } = render(<ListScreen />);

      expect(getByText("Test List")).toBeTruthy();
      expect(getByText("Test Description")).toBeTruthy();
    });

    it("should render the list items", () => {
      const { getByText } = render(<ListScreen />);

      const items = [
        { name: "Item 1", quantity: 1, checked: false },
        { name: "Item 2", quantity: 2, checked: true },
      ];

      items.forEach((item) => {
        expect(getByText(item.name)).toBeTruthy();
        expect(getByText(item.quantity.toString())).toBeTruthy();
      });
    });

    it("should render edit and archive buttons for the owner", () => {
      const { getByText } = render(<ListScreen />);

      expect(getByText("Editar")).toBeTruthy();
      expect(getByText("Arquivar")).toBeTruthy();
      expect(getByText("Convidar")).toBeTruthy();
    });

    it("should display the 'Deixar de seguir' button when the user is not the owner", () => {
      mockedUseAuth.mockReturnValue({ user: { uid: "user2" } }); // Usuário que não é o proprietário
    
      mockedUseLocalSearchParams.mockReturnValue({
        params: JSON.stringify({
          id: "123",
          title: "Test List",
          description: "Test Description",
          items: [
            { name: "Item 1", quantity: 1, checked: false },
            { name: "Item 2", quantity: 2, checked: true },
          ],
          status: "active",
          sharedWith: ["user2"],
          ownerId: "user1",
        }),
      });
    
      const { getByText } = render(<ListScreen />);

      expect(getByText("Deixar de seguir")).toBeTruthy();      
    });

    it("should not show Save button initially", () => {
      const { queryByText } = render(<ListScreen />);
      expect(queryByText("Salvar")).toBeNull();
    });

    it("renders 'Deixar de seguir' button for non-owner", () => {
      mockedUseAuth.mockReturnValue({ user: { uid: "user2" } });

      const { getByText } = render(<ListScreen />);

      expect(getByText("Deixar de seguir")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should call updateList when 'Salvar' button is pressed", async () => {
      const { getByText, getByPlaceholderText } = render(<ListScreen />);

      fireEvent.press(getByText("Editar"));

      const titleInput = getByPlaceholderText("Título");
      fireEvent.changeText(titleInput, "Updated Title");

      const saveButton = getByText("Salvar");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            title: "Updated Title",
          })
        );
        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Lista salva com sucesso!",
          expect.anything()
        );
      });
    });

    it("should call archiveListStatus when 'Arquivar' button is pressed", async () => {
      jest
        .spyOn(Alert, "alert")
        .mockImplementation((title, message, buttons) => {
          const confirmButton = buttons?.find(
            (button) => button.text === "Confirmar"
          );
          if (confirmButton && confirmButton.onPress) {
            confirmButton.onPress();
          }
        });

      const { getByText } = render(<ListScreen />);

      const archiveButton = getByText("Arquivar");
      fireEvent.press(archiveButton);

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ status: "archived" })
        );

        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Lista arquivada com sucesso!",
          expect.anything()
        );
      });
    });

    it("should add a new item to the list when 'Adicione um novo item' input is used", async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <ListScreen />
      );
      fireEvent.press(getByText("Editar"));

      const input = getByPlaceholderText("Adicione um novo item");

      fireEvent.changeText(input, "New Item");
      fireEvent.press(getByTestId("add-item-button"));
      fireEvent.press(getByText("Salvar"));

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(
          expect.objectContaining({ id: "123" }),
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                name: "New Item",
                quantity: 1,
                checked: false,
              }),
            ]),
          })
        );
      });
    });

    it("should handle deleting an item", async () => {
      const { getByText, getAllByText } = render(<ListScreen />);

      fireEvent.press(getByText("Editar"));

      const deleteButtons = getAllByText("Excluir Item");

      fireEvent.press(deleteButtons[0]);
      fireEvent.press(getByText("Salvar"));

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            items: expect.not.arrayContaining([
              expect.objectContaining({ name: "Item 1" }),
            ]),
          })
        );
      });
    });

    it("should navigate to the invite modal when 'Convidar' button is pressed", () => {
      const { getByText } = render(<ListScreen />);
      fireEvent.press(getByText("Convidar"));

      expect(router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/createInviteModal",
          params: {
            listId: "123",
            listTitle: "Test List",
          },
        })
      );
    });

    it("should handle errors when saving the list", async () => {
      mockedUpdateDoc.mockRejectedValueOnce(new Error("Firestore error"));

      const { getByText, getByPlaceholderText } = render(<ListScreen />);

      fireEvent.press(getByText("Editar"));

      const titleInput = getByPlaceholderText("Título");
      fireEvent.changeText(titleInput, "Failing Title");

      const saveButton = getByText("Salvar");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Não foi possível salvar a lista. Tente novamente mais tarde.",
          expect.anything()
        );
      });
    });

    it("should display an error alert when archiving the list fails after confirmation", async () => {
      mockedUpdateDoc.mockRejectedValueOnce(new Error("Firestore error"));

      jest
        .spyOn(Alert, "alert")
        .mockImplementation((title, message, buttons) => {
          if (title === "Confirmação") {
            const confirmButton = buttons?.find(
              (button) => button.text === "Confirmar"
            );
            if (confirmButton && confirmButton.onPress) {
              confirmButton.onPress();
            }
          } else if (title === "Erro") {
            const okButton = buttons?.find((button) => button.text === "OK");
            if (okButton && okButton.onPress) {
              okButton.onPress();
            }
          }
        });

      const { getByText } = render(<ListScreen />);

      const archiveButton = getByText("Arquivar");
      fireEvent.press(archiveButton); // Abre o alerta de confirmação

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Não foi possível arquivar a lista. Tente novamente mais tarde.",
          expect.anything()
        );
      });
    });

    it("should cancel editing and restore original data", async () => {
      const { getByText, getByPlaceholderText } = render(<ListScreen />);

      fireEvent.press(getByText("Editar"));

      const titleInput = getByPlaceholderText("Título");
      fireEvent.changeText(titleInput, "Changed Title");

      const cancelButton = getByText("Cancelar");
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(getByText("Editar")).toBeTruthy();
        expect(getByText("Arquivar")).toBeTruthy();
        expect(getByText("Convidar")).toBeTruthy();
      });
    });

    it("should increase and decrease item quantity", async () => {
      const { getByText, getByTestId } = render(<ListScreen />);

      fireEvent.press(getByText("Editar"));

      const increaseButton = getByTestId("increase-button-0");
      const decreaseButton = getByTestId("decrease-button-0");

      fireEvent.press(increaseButton);

      fireEvent.press(decreaseButton);

      const saveButton = getByText("Salvar");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                name: "Item 1",
                quantity: 1,
              }),
            ]),
          })
        );
      });
    });
  });
});
