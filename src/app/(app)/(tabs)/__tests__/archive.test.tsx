import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Archive from "../archive";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { getDocs, updateDoc, doc } from "firebase/firestore";

jest.spyOn(Alert, "alert");

const mockedUseAuth = useAuth as jest.Mock;
const mockedDoc = doc as jest.Mock;
const mockedGetDocs = getDocs as jest.Mock;

describe("Archive Screen", () => {
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
    it("should display loading spinner when `isLoading` is true", async () => {
      const { getByTestId } = render(<Archive />);

      await waitFor(() => {
        expect(getByTestId("loading-indicator")).toBeTruthy();
      });
    });

    it("should display empty list message if no archived lists exist", async () => {
      mockedUseAuth.mockReturnValue({ user: { uid: "test-user-id" } });

      mockedDoc.mockResolvedValue({
        docs: [],
      });

      const { findByText } = render(<Archive />);

      const emptyMessage = await findByText(
        "Você ainda não arquivou nenhuma lista"
      );
      expect(emptyMessage).toBeTruthy();
    });

    it("should render archived lists when data is available", async () => {
      const mockLists = [
        { id: "1", title: "Archived List 1", status: "archived" },
        { id: "2", title: "Archived List 2", status: "archived" },
      ];

      mockedGetDocs.mockResolvedValueOnce({
        docs: mockLists.map((list) => ({
          id: list.id,
          data: () => list,
        })),
      });

      const { getByText } = render(<Archive />);
      await waitFor(() => {
        expect(getByText("Archived List 1")).toBeTruthy();
        expect(getByText("Archived List 2")).toBeTruthy();
      });
    });

    it("renders ListEmptyComponent correctly when no data", async () => {
      mockedGetDocs.mockResolvedValueOnce({ docs: [] });
    
      const { findByTestId } = render(<Archive />);
      const emptyListMessage = await findByTestId("empty-list-message");
      expect(emptyListMessage).toBeTruthy();
    });

    it("ensures all interactive elements are accessible", async () => {
      const mockLists = [
        { id: "1", title: "Archived List 1", status: "archived" },
      ];
    
      // Mock para retornar as listas
      mockedGetDocs.mockResolvedValueOnce({
        docs: mockLists.map((list) => ({
          id: list.id,
          data: () => list,
        })),
      });
    
      const { findByTestId } = render(<Archive />);
      
      // Verifica se os botões são renderizados corretamente
      const deleteButton = await findByTestId("delete-button-1");
      const restoreButton = await findByTestId("restore-button-1");
    
      expect(deleteButton).toBeTruthy();
      expect(restoreButton).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should call handleActivateList when restore button is pressed", async () => {
      mockedGetDocs.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ title: "Lista 1", status: "archived" }) },
        ],
      });

      const { findByTestId } = render(<Archive />);
      const restoreButton = await findByTestId("restore-button-1");

      fireEvent.press(restoreButton);
      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            status: "active",
            updatedAt: "mock-timestamp",
          })
        );
      });
    });

    it("should call handleDeleteList when delete button is pressed", async () => {
      mockedGetDocs.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ title: "Lista 1", status: "archived" }) },
        ],
      });

      const { findByTestId } = render(<Archive />);
      const deleteButton = await findByTestId("delete-button-1");

      fireEvent.press(deleteButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        "Confirmação",
        "Tem certeza de que deseja excluir esta lista?",
        expect.any(Array)
      );
    });

    it("should refresh the list when refresh is triggered", async () => {
      const { getByTestId, queryByTestId } = render(<Archive />);

      await waitFor(() => {
        expect(queryByTestId("loading-indicator")).toBeNull();
      });

      const flatListWrapper = getByTestId("flat-list-wrapper");

      fireEvent(flatListWrapper, "scroll");

      await waitFor(() => {
        expect(getDocs).toHaveBeenCalled();
      });
    });

    it("should handle error when fetching lists fails", async () => {
      mockedGetDocs.mockRejectedValue(new Error("Network Error"));
    
      const {} = render(<Archive />);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Não foi possível carregar as listas arquivadas. Tente novamente mais tarde.",
          expect.any(Array)
        );
      });
    });

    it("should do not delete the list if cancel is pressed in the alert", async () => {
      mockedGetDocs.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ title: "Lista 1", status: "archived" }) },
        ],
      });
    
      const { findByTestId } = render(<Archive />);
      const deleteButton = await findByTestId("delete-button-1");
    
      Alert.alert.mockImplementationOnce((title, message, buttons) => {
        // Verifica se há função onPress no botão "Cancelar"
        const cancelButton = buttons.find((button) => button.text === "Cancelar");
        if (cancelButton?.onPress) {
          cancelButton.onPress();
        }
      });
    
      fireEvent.press(deleteButton);
    
      expect(mockedDoc).not.toHaveBeenCalled();
    });
    
  });
});
