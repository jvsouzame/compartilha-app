// @ts-nocheck
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Href, Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/src/context/authContext";
import { AntDesign } from "@expo/vector-icons";

import avatar1 from "../../assets/images/avatar/avatar-1.png";
import avatar2 from "../../assets/images/avatar/avatar-2.png";
import { StatusBar } from "expo-status-bar";

export default function NotificationScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { params } = useLocalSearchParams();

  const invites = typeof params === "string" ? JSON.parse(params) : null;

  const [invitesState, setInvitesState] = useState(invites || []);

  const [isLoading, setIsLoading] = useState(false);

  const avatars = {
    "avatar-1.png": avatar1,
    "avatar-2.png": avatar2,
  };

  const avatarSource = avatars[user?.profileImage] || null;

  const navigateTo = (route: Href) => {
    router.push(route);
  };

  /**
   * @async
   * @function handleRespondInvite
   * @description - Responder o convite
   */
  const handleRespondInvite = async (listId, toUserId, inviteid) => {
    console.log("handleRespondInvite", listId, toUserId, inviteid);
    setIsLoading(true);

    try {
      const listRef = doc(db, "lists", listId);
      await updateDoc(listRef, {
        sharedWith: arrayUnion(toUserId),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Lista salva com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      await handleDeleteInvite(inviteid);

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao responder o convite:", error);
      setIsLoading(false);
    }
  };

  /**
   * @async
   * @function deleteInvite
   * @description - Excluir o convite
   */
  const handleDeleteInvite = async (inviteid) => {
    console.log("deleteInvite", inviteid);
    setIsLoading(true);

    try {
      const inviteRef = doc(db, "invites", inviteid);
      await deleteDoc(inviteRef);

      // Alert.alert("Sucesso", "Convite excluído com sucesso!", [
      //   { text: "OK", onPress: () => console.log("OK pressionado") },
      // ]);

      setInvitesState((prevItems) =>
        prevItems.filter((item) => item.name !== inviteid.name)
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao excluir o convite:", error);
      setIsLoading(false);
    }
  };

  const renderInviteItem = (item) => {
    return (
      <View className="flex-row justify-between py-2 gap-2">
        <View className="flex-1 flex-row items-center">
          <View className="h-12 w-12">
            <Image
              className="h-full w-full rounded-full"
              resizeMode="contain"
              source={avatars[item.profileImage] || null}
            />
          </View>

          <Text className="font-mediumInter text-l text-black flex-wrap flex-1 px-4">
            <Text className="font-mediumInter text-l text-black font-bold">
              {item.fromUsername}
            </Text>{" "}
            te convidou para a lista{" "}
            <Text className="font-mediumInter text-l text-black font-bold">
              {item.listTitle}
            </Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-2 w-1/5">
          <TouchableOpacity
            testID={`reject-invite-${item.id}`}
            className="flex-row items-center justify-center gap-2"
            onPress={() => handleDeleteInvite(item.id)}
          >
            <AntDesign name="closecircleo" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            testID={`accept-invite-${item.id}`}
            className="flex-row items-center justify-center gap-2"
            onPress={() =>
              handleRespondInvite(item.listId, item.toUserId, item.id)
            }
          >
            <AntDesign name="checkcircleo" size={24} color="green" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-12 bg-background gap-6 p-4">
        <View>
          <View className="items-end">
            <TouchableOpacity onPress={() => navigateTo("/dashboard")}>
              <AntDesign
                name="close"
                size={24}
                color="black"
                className="text-end"
              />
            </TouchableOpacity>
          </View>

          <Text className="font-boldPoppins text-3xl">Notificações</Text>
        </View>

        <View className="flex-1">
          {invitesState.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="font-boldInter text-3xl text-center">
                Você não tem nenhum convite pendente
              </Text>
            </View>
          ) : (
            <View className="flex-1 gap-4">
              <Text className="font-mediumInter text-xl text-black">
                Convites
              </Text>
              <FlatList
                data={invitesState}
                contentContainerStyle={{ gap: 12 }}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => renderInviteItem(item)}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
