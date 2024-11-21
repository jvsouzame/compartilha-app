import React from "react";
import { Tabs } from "expo-router";
import {
  AntDesign,
  Feather,
  FontAwesome6,
} from "@expo/vector-icons";
import { Text } from "react-native";

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FAFAFA",
          borderTopWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#2B2B2B", // Cor do ícone/título ativo
        tabBarInactiveTintColor: "rgba(0, 0, 0, 0.5)", // Cor do ícone/título inativo
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "",
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "#2B2B2B" : "rgba(0, 0, 0, 0.5)" }}
              className="font-mediumInter text-sm "
            >
              Listas
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            return <FontAwesome6 name="list-check" color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: "",
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "#2B2B2B" : "rgba(0, 0, 0, 0.5)" }}
              className="font-mediumInter text-sm "
            >
              Arquivo
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            return <Feather name="archive" color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name="userScreen"
        options={{
          title: "",
          tabBarLabel: ({ focused }) => (
            <Text
              style={{ color: focused ? "#2B2B2B" : "rgba(0, 0, 0, 0.5)" }}
              className="font-mediumInter text-sm "
            >
              Meu Perfil
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            return <AntDesign name="user" color={color} size={size} />;
          },
        }}
      />
    </Tabs>
  );
}
