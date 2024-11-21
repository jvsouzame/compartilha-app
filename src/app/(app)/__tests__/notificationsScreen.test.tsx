import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import NotificationScreen from "../notificationsScreen";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";

jest.spyOn(Alert, "alert");

const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUpdateDoc = updateDoc as jest.Mock;
const mockedDeleteDoc = deleteDoc as jest.Mock;
const mockedArrayUnion = arrayUnion as jest.Mock;

describe("NotificationScreen", () => {
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
      params: JSON.stringify([
        {
          id: "1",
          fromUsername: "Joao",
          listTitle: "Lista para Igor",
          profileImage: "avatar-1.png",
          listId: "list1",
          toUserId: "user2",
        },
      ]),
    });
  });

  describe("Render", () => {
    it("should render correctly when there are invitations", () => {
      const { getByText, getByTestId } = render(<NotificationScreen />);

      expect(getByText("Notificações")).toBeTruthy();
      expect(getByText("Convites")).toBeTruthy();
      expect(
        getByText("Joao te convidou para a lista Lista para Igor")
      ).toBeTruthy();
      expect(getByTestId("reject-invite-1")).toBeTruthy();
      expect(getByTestId("accept-invite-1")).toBeTruthy();
    });

    it("should render correctly when there are no invitations", () => {
      mockedUseLocalSearchParams.mockReturnValue({
        params: JSON.stringify([]),
      });

      const { getByText } = render(<NotificationScreen />);

      expect(getByText("Você não tem nenhum convite pendente")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should call handleRespondInvite when accepting an invitation", async () => {
      const { getByTestId } = render(<NotificationScreen />);

      const acceptButton = getByTestId("accept-invite-1");

      fireEvent.press(acceptButton);

      await waitFor(() => {
        expect(mockedUpdateDoc).toHaveBeenCalledWith(expect.any(Object), {
          sharedWith: mockedArrayUnion("user2"),
          updatedAt: "mock-timestamp",
        });
        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Lista salva com sucesso!",
          expect.any(Array)
        );
      });
    });

    it("should call handleDeleteInvite when rejecting an invitation", async () => {
      const { getByTestId } = render(<NotificationScreen />);

      const rejectButton = getByTestId("reject-invite-1");

      fireEvent.press(rejectButton);

      await waitFor(() => {
        expect(mockedDeleteDoc).toHaveBeenCalledWith(expect.any(Object));
      });
    });
  });
});
