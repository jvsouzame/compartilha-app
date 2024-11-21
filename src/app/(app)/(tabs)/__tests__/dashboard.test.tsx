import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Dashboard from "../dashboard";
import { useAuth } from "@/src/context/authContext";
import { Alert } from "react-native";
import { router } from "expo-router";
import { getDocs } from "firebase/firestore";

jest.spyOn(Alert, "alert");

jest.mock("@/src/api", () => ({
  fetchLists: jest.fn(),
  fetchNotifications: jest.fn(),
}));

const { fetchLists, fetchNotifications } = require("@/src/api");

const mockedUseAuth = useAuth as jest.Mock;
const mockedGetDocs = getDocs as jest.Mock;

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        uid: "user1",
        username: "TestUser",
        profileImage: "avatar-1.png",
      },
    });

    fetchLists.mockResolvedValue([{ id: "1", title: "List 1" }]);
    fetchNotifications.mockResolvedValue([{ id: "2", title: "Notification 1" }]);
  });

  describe("Render", () => {
    it("should render the user avatar and username correctly", () => {
      const { getByText, getByTestId } = render(<Dashboard />);

      expect(getByText("Bem vindo,")).toBeTruthy();
      expect(getByText("TestUser")).toBeTruthy();
      expect(getByTestId("avatar-image")).toBeTruthy();
    });

    it("should render the avatar image with the correct source", () => {
      const { getByTestId } = render(<Dashboard />);
      const avatarImage = getByTestId("avatar-image");
      expect(avatarImage.props.source).toBeDefined();
    });

    it("should render the notification bell", () => {
      const { getByTestId } = render(<Dashboard />);
      const notificationBell = getByTestId("notification-bell");
      expect(notificationBell).toBeTruthy();
    });

    it("should render the 'Minhas Listas' and 'Seguindo Listas' buttons", () => {
      const { getByText } = render(<Dashboard />);
      expect(getByText("Minhas Listas")).toBeTruthy();
      expect(getByText("Seguindo Listas")).toBeTruthy();
    });

    it("should render the create list button", () => {
      const { getByText } = render(<Dashboard />);
      expect(getByText("Criar Lista")).toBeTruthy();
    });

    it("should not display the empty state message when there are lists", async () => {
      const { queryByText } = render(<Dashboard />);

      await waitFor(() => {
        expect(queryByText("Você ainda não criou nenhuma lista")).toBeNull();
      });
    });

    it("should show loading indicator while loading", () => {
      const { getByTestId } = render(<Dashboard initialLoading={true} />);
 
      const loadingIndicator = getByTestId("loading-indicator");
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("should navigate to create list screen when 'Criar Lista' button is pressed", () => {
      const { getByText, debug } = render(<Dashboard />);
      const createListButton = getByText("Criar Lista");

      fireEvent.press(createListButton);
      debug()
      expect(router.push).toHaveBeenCalledWith({
        pathname: "/createListScreen",
        params: {
          params: JSON.stringify(""),
        },
      });
    });

    it("should toggle between 'Minhas Listas' and 'Seguindo Listas' when buttons are pressed", () => {
      const { getByTestId } = render(<Dashboard />);
      const minhasListasButton = getByTestId("minhas-listas-button");
      const seguindoListasButton = getByTestId("seguindo-listas-button");
    
      expect(minhasListasButton.props.accessibilityState.disabled).toBe(true);
      expect(seguindoListasButton.props.accessibilityState.disabled).toBe(false);
    
      fireEvent.press(seguindoListasButton);
    
      expect(minhasListasButton.props.accessibilityState.disabled).toBe(false);
      expect(seguindoListasButton.props.accessibilityState.disabled).toBe(true);
    
      fireEvent.press(minhasListasButton);
    
      expect(minhasListasButton.props.accessibilityState.disabled).toBe(true);
      expect(seguindoListasButton.props.accessibilityState.disabled).toBe(false);
    });

    it("should navigate to notifications screen when bell icon is pressed", () => {
      const { getByTestId } = render(<Dashboard />);
      const notificationBell = getByTestId("notification-bell");

      fireEvent.press(notificationBell);

      expect(router.push).toHaveBeenCalledWith({
        pathname: "/notificationsScreen",
        params: {
          params: JSON.stringify([]),
        },
      });
    });

    it("should call fetchLists and fetchNotifications on mount", async () => {

      const { getByText, getByTestId } = render(<Dashboard />);
      
      await waitFor(() => {
        expect(getByText("List 1")).toBeTruthy();
        expect(fetchLists).toHaveBeenCalledWith("user1", false);
        expect(getByTestId("have-notification")).toBeTruthy();
        expect(fetchNotifications).toHaveBeenCalledWith("user1");
      })
    });

    it("should update state with fetched lists", async () => {

      fetchLists.mockResolvedValue([
        { id: "1", title: "List 1" },
        { id: "2", title: "List 2" },
      ]);

      mockedGetDocs.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ title: "List 1" }) },
          { id: "2", data: () => ({ title: "List 2" }) },
        ],
      });

      const { getByText } = render(<Dashboard />);

      await waitFor(() => {
        expect(getByText("List 1")).toBeTruthy();
        expect(getByText("List 2")).toBeTruthy();
      })
    });
  });
});
