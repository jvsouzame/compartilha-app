// @ts-nocheck
import React, { useEffect } from "react";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import "../styles/global.css";
import { useFonts } from 'expo-font';
import {
  Poppins_100Thin,
  Poppins_100Thin_Italic,
  Poppins_200ExtraLight,
  Poppins_200ExtraLight_Italic,
  Poppins_300Light,
  Poppins_300Light_Italic,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  Poppins_900Black,
  Poppins_900Black_Italic,
} from "@expo-google-fonts/poppins";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { AuthContextProvider, useAuth } from "../context/authContext";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated == "undefined") {
      return;
    }

    const inApp = segments[0] == "(app)";

    if (isAuthenticated && !inApp) {
      router.replace("/dashboard");
    } else if (isAuthenticated == false) {
      router.replace("/openingScreen");
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(app)/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)/listScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="(app)/createListScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(app)/createInviteModal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(app)/notificationsScreen"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default function _layout() {
  let [fontsLoaded, fontError] = useFonts({
    Poppins_100Thin,
    Poppins_100Thin_Italic,
    Poppins_200ExtraLight,
    Poppins_200ExtraLight_Italic,
    Poppins_300Light,
    Poppins_300Light_Italic,
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic,
    Poppins_900Black,
    Poppins_900Black_Italic,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
