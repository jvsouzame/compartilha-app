// @ts-nocheck
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useAuth } from "../context/authContext";
import { ActivityIndicator } from "react-native";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsEmailValid(emailRegex.test(email));
  };

  const handleEmailChange = (email: string) => {
    const lowercaseEmail = email.toLowerCase()
    setEmail(lowercaseEmail);
    validateEmail(lowercaseEmail);
  };

  const navigateTo = (route: Href) => {
    router.push(route);
  };

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Sign In", "Por favor preencha todos os campos!");
      return;
    }

    setIsLoading(true);
    const response = await login(email, password);
    setIsLoading(false);
    if (!response.success) {
      Alert.alert("Login", response.msg);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-8 bg-white">
        <View className="gap-16 p-6">
          <View className="items-end">
            <Image
              style={{ height: hp(5) }}
              resizeMode="contain"
              source={require("../assets/images/star.png")}
            />
          </View>
          <View>
            <Text className="font-boldPoppins text-3xl">Acessar conta</Text>
            <View className="flex-row gap-2">
              <Text className="font-mediumInter text-l text-gray1">
                Não possui uma conta?
              </Text>
              <TouchableOpacity onPress={() => navigateTo("/signUp")}>
                <Text className="font-boldInter text-l">Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-1 justify-between p-6 pb-20">
          <View className="gap-6">
            <View className="gap-2">
              <Text className="font-mediumInter text-l">Email</Text>
              <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
                <TextInput
                  className="w-11/12 font-mediumInter text-lg text-gray2"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChangeText={handleEmailChange}
                />
                {isEmailValid && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="black"
                    testID="email-valid-icon"
                  />
                )}
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-mediumInter text-l">Senha</Text>
              <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
                <TextInput
                  className="w-11/12 font-mediumInter text-lg text-gray2"
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  testID="password-visibility-toggle"
                >
                  <Feather
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={18}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Text className="font-mediumInter text-l text-black text-right mt-2">
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="w-full gap-4 mt-8">
            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <TouchableOpacity
                className="bg-black rounded-xl p-4 items-center"
                onPress={handleLogin}
              >
                <Text className="font-mediumInter text-lg text-white">
                  Entrar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
