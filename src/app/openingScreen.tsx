import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Href, router } from "expo-router";

const navigateTo = (route: Href) => {
  router.push(route);
};

export default function OpeningScreen() {
  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 bg-white justify-center items-center gap-12 p-6">
        <View>
          <Image
            style={{ height: hp(30) }}
            resizeMode="contain"
            source={require("../assets/images/compartilha-logo.png")}
            testID="compartilha-logo"
          />
        </View>

        <View className="gap-4 px-4">
          <Text className="font-boldPoppins text-4xl leading-[3rem] text-center">
            Participe da comunidade compartilha+
          </Text>
          <Text className="font-regularInter text-lg text-center text-gray1">
            Organize campanhas e compras colaborativas em um só lugar
          </Text>
        </View>

        <View className="w-full gap-4">
          <TouchableOpacity
            className="bg-black rounded-xl p-4 items-center"
            onPress={() => navigateTo("/signIn")}
          >
            <Text className="font-mediumInter text-lg text-white">Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white rounded-xl p-4 items-center border-hairline border-gray1"
            onPress={() => navigateTo("/signUp")}
          >
            <Text className="font-mediumInter text-lg text-black">
              Criar Conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
