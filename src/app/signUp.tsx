// @ts-nocheck
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
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

export default function SignUp() {
  const { register } = useAuth();
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
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
    const lowercaseEmail = email.toLowerCase();
    setEmail(lowercaseEmail);
    validateEmail(lowercaseEmail);
  };

  const navigateTo = (route: Href) => {
    router.push(route);
  };

  const handleRegister = async () => {
    setIsLoading(true);

    const profileImage = "avatar-1.png";

    let response = await register(
      name,
      username,
      email,
      password,
      profileImage
    );
    console.log("got result", response);
    setIsLoading(false);
    if (!response.success) {
      Alert.alert("Cadastro", response.msg);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
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
                  <Text className="font-boldPoppins text-3xl">Criar conta</Text>
                  <View className="flex-row gap-2">
                    <Text className="font-mediumInter text-l text-gray1">
                      Já faz parte?
                    </Text>
                    <TouchableOpacity onPress={() => navigateTo("/signIn")}>
                      <Text className="font-boldInter text-l">
                        Acessar conta
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex-1 justify-between p-6 pb-20">
                <View className="gap-6">
                  <View className="gap-2">
                    <Text className="font-mediumInter text-l">
                      Nome Completo
                    </Text>
                    <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
                      <TextInput
                        className="w-11/12 font-mediumInter text-lg text-gray2"
                        placeholder="Digite seu nome completo"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>

                  <View className="gap-2">
                    <Text className="font-mediumInter text-l">
                      Nome de Usuário
                    </Text>
                    <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
                      <TextInput
                        className="w-11/12 font-mediumInter text-lg text-gray2"
                        placeholder="Digite seu nome de usuário"
                        value={username}
                        onChangeText={setUsername}
                      />
                    </View>
                  </View>

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
                    <Text className="font-mediumInter text-l">
                      Crie uma senha
                    </Text>
                    <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
                      <TextInput
                        className="w-11/12 font-mediumInter text-lg text-gray2"
                        placeholder="Mínimo de 6 caracteres"
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
                  </View>
                </View>

                <View className="w-full gap-4 mt-20">
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#000" />
                  ) : (
                    <TouchableOpacity
                      className="bg-black rounded-xl p-4 items-center"
                      onPress={() => handleRegister()}
                    >
                      <Text className="font-mediumInter text-lg text-white">
                        Criar Conta
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
}
