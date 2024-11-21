// @ts-nocheck
import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useAuth } from "@/src/context/authContext";
import avatar1 from "../../../assets/images/avatar/avatar-1.png";
import avatar2 from "../../../assets/images/avatar/avatar-2.png";
import { StatusBar } from "expo-status-bar";

export default function UserScreen() {
  const { user } = useAuth();

  const avatars = {
    "avatar-1.png": avatar1,
    "avatar-2.png": avatar2,
  };

  const avatarSource = avatars[user?.profileImage] || null;

  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-8 bg-black">
        <View className="flex-row justify-center item-center gap-2 px-4 pb-8 pt-24 bg-black"></View>

        <View className="flex-1 gap-4 px-4 pt-24 pb-12 rounded-t-xl bg-white">
          <View className="flex-1 gap-4">
            <View className=" bg-white rounded-xl p-4 border-hairline border-gray2">
              <Text className="font-mediumInter text-l text-gray1">Nome</Text>
              <Text className="font-boldPoppins text-xl">{user?.name}</Text>
            </View>

            <View className=" bg-white rounded-xl p-4 border-hairline border-gray2">
              <Text className="font-mediumInter text-l text-gray1">
                Nome de usuário
              </Text>
              <Text className="font-boldPoppins text-xl">{user?.username}</Text>
            </View>

            <View className=" bg-white rounded-xl p-4 border-hairline border-gray2">
              <Text className="font-mediumInter text-l text-gray1">E-mail</Text>
              <Text className="font-boldPoppins text-xl">{user?.email}</Text>
            </View>
          </View>

          <View className="w-full gap-4 mt-20">
            <TouchableOpacity
              className="bg-black rounded-xl p-4 items-center"
              onPress={() => handleLogout()}
            >
              <Text className="font-mediumInter text-lg text-white">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="absolute left-0 right-0 items-center"
          style={{ top: "18%", transform: [{ translateY: -50 }] }}
        >
          <View className="h-32 w-32">
            <Image
              testID="avatar-image"
              className="h-full w-full rounded-full"
              resizeMode="contain"
              source={avatarSource}
            />
          </View>
        </View>
      </View>
    </>
  );
}
