// @ts-nocheck
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/src/context/authContext";
import { AntDesign } from "@expo/vector-icons";

export default function CreateInviteModal() {
  const router = useRouter();
  const { user } = useAuth();

  const { listId, listTitle } = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * @async
   * @function handleInvite
   * @description - Envia o convite para a lista
   */
  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Aviso", "Digite um e-mail.");
      return;
    }

    try {
      setIsLoading(true);

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      console.log("querySnapshot", querySnapshot);

      if (!querySnapshot.empty) {
        let userIdToInvite = null;

        querySnapshot.forEach((doc) => {
          console.log("Usuário encontrado:", doc.id, doc.data());
          userIdToInvite = doc.id;
        });

        if (userIdToInvite) {
          const inviteRef = collection(db, "invites");

          const newInvite = {
            listId: listId,
            listTitle: listTitle,
            fromUserId: user.uid,
            fromUsername: user.username,
            profileImage: user.profileImage,
            toUserId: userIdToInvite,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "pending",
          };

          const docRef = await addDoc(inviteRef, newInvite);

          console.log("Convite criado com ID:", docRef.id);
          Alert.alert("Sucesso", "Convite enviado com sucesso!");

          setErrorMessage("");
        }
      } else {
        setErrorMessage("Usuário não encontrado");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setErrorMessage("Ocorreu um erro. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-black/50">
      <View className="bg-background p-6 rounded-lg w-4/5 shadow-lg gap-6">
        <TouchableOpacity className="items-end" onPress={() => router.back()}>
          <AntDesign
            name="close"
            size={24}
            color="black"
            className="text-end"
          />
        </TouchableOpacity>

        <TextInput
          className="font-mediumInter text-l text-black bg-white rounded-xl p-4 border-hairline border-gray2"
          placeholder="Digite o email"
          value={email}
          onChangeText={(email) => setEmail(email.toLowerCase())} 
          keyboardType="email-address"
        />

        {errorMessage ? (
          <Text className="text-red-500 text-sm mb-2">{errorMessage}</Text>
        ) : null}

        {isLoading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <TouchableOpacity
            className="bg-black rounded-xl p-4 items-center"
            onPress={handleInvite}
          >
            <Text className="font-mediumInter text-lg text-white">
              Convidar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
