// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Href, router, useFocusEffect } from "expo-router";
import { IUser } from "@/src/types/types";
import { StatusBar } from "expo-status-bar";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useAuth } from "@/src/context/authContext";
import { db } from "@/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

import avatar1 from "../../../assets/images/avatar/avatar-1.png";
import avatar2 from "../../../assets/images/avatar/avatar-2.png";

import { fetchLists, fetchNotifications } from "@/src/api";

export default function Dashboard({ initialLoading = false }) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [isSharedLists, setIsSharedLists] = useState(false);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const avatars = {
    "avatar-1.png": avatar1,
    "avatar-2.png": avatar2,
  };

  const avatarSource = avatars[user?.profileImage] || null;

  const navigateTo = (screen, item) => {
    router.push({
      pathname: screen,
      params: {
        params: JSON.stringify(item),
      },
    });
  };

  const loadLists = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const data = await fetchLists(user.uid, isSharedLists);
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const data = await fetchNotifications(user.uid);
      setInvites(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
    loadNotifications();
  }, [user, isSharedLists, isRefreshing]);

  // /**
  //  * @async
  //  * @function fetchLists
  //  * @description - Busca as listas do usuário.
  //  */
  // const fetchLists = async (userId) => {
  //   setIsLoading(true);

  //   try {
  //     if (isSharedLists) {
  //       const listsRef = collection(db, "lists");

  //       const q = query(
  //         listsRef,
  //         where("sharedWith", "array-contains", userId),
  //         where("status", "==", "active")
  //       );

  //       const querySnapshot = await getDocs(q);

  //       const lists = [];
  //       querySnapshot.forEach((doc) => {
  //         lists.push({ id: doc.id, ...doc.data() });
  //       });

  //       setLists(lists);
  //     } else {
  //       const listsRef = collection(db, "lists");
  //       const q = query(
  //         listsRef,
  //         where("ownerId", "==", userId),
  //         where("status", "==", "active")
  //       );

  //       const querySnapshot = await getDocs(q);

  //       const lists = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));

  //       setLists(lists);
  //     }
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Erro ao buscar listas:", error);
  //   }
  // };

  // /**
  //  * @async
  //  * @function fetchNotifications
  //  * @description - Busca as notificações do usuário.
  //  */
  // const fetchNotifications = async (userId) => {
  //   setIsLoading(true);
  //   try {
  //     const invitesRef = collection(db, "invites");
  //     const q = query(
  //       invitesRef,
  //       where("toUserId", "==", userId),
  //       where("status", "==", "pending")
  //     );
  //     const querySnapshot = await getDocs(q);

  //     const invites = querySnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     setInvites(invites);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Erro ao buscar notificações:", error);
  //   }
  // };

  const renderListItem = (item) => {
    return (
      <TouchableOpacity onPress={() => navigateTo("/listScreen", item)}>
        <View className="flex-row justify-between items-center bg-white rounded-xl p-4 border-hairline border-gray2">
          <Text className="w-11/12 font-mediumInter text-lg text-black">
            {item.title}
          </Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-8 bg-background">
        <View className="flex-row justify-between item-center gap-2 px-4 py-8">
          <View className="flex-row item-center gap-4">
            <View className="h-16 w-16">
              <Image
                className="h-full w-full rounded-full"
                resizeMode="contain"
                source={
                  avatarSource ||
                  require("../../../assets/images/avatar/default-avatar.png")
                }
                testID="avatar-image"
              />
            </View>

            <View className="gap-[0.25rem]">
              <Text className="font-mediumInter text-l text-gray1">
                Bem vindo,
              </Text>
              <Text className="font-boldPoppins text-3xl">
                {user?.username}
              </Text>
            </View>
          </View>

          <View className="justify-center">
            <TouchableOpacity
              onPress={() => navigateTo("/notificationsScreen", invites)}
              testID="notification-bell"
            >
              <Entypo name="bell" size={24} color="black" />
              {invites.length > 0 && (
                <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4" testID="have-notification" ></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 gap-4 p-4 pb-12">
          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              className={`flex-1 rounded-xl p-4 items-center border-hairline border-gray2 ${
                isSharedLists ? "bg-background" : " bg-black"
              }`}
              onPress={() => setIsSharedLists(false)}
              disabled={!isSharedLists}
              testID="minhas-listas-button"
            >
              <Text
                className={`text-lg text-center ${
                  isSharedLists
                    ? "text-black font-boldInter"
                    : " text-white font-mediumInter"
                }`}
              >
                Minhas Listas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl p-4 items-center border-hairline border-gray2 ${
                isSharedLists ? "bg-black" : " bg-background"
              }`}
              onPress={() => setIsSharedLists(true)}
              disabled={isSharedLists}
              testID="seguindo-listas-button"
            >
              <Text
                className={`text-lg text-center ${
                  isSharedLists
                    ? "text-white font-mediumInter"
                    : " text-black font-boldInter"
                }`}
              >
                Seguindo Listas
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 gap-6">
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#000"
                className="flex-1 justify-center items-center"
                testID="loading-indicator"
              />
            ) : (
              <FlatList
                data={lists}
                contentContainerStyle={{ gap: 12 }}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => renderListItem(item)}
                refreshControl={
                  <RefreshControl
                    onRefresh={() => setIsRefreshing(!isRefreshing)}
                    refreshing={isLoading}
                    testID="refresh-control"
                  />
                }
                testID="flat-list"
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center p-8">
                    {isSharedLists ? (
                      <Text className="font-boldInter text-3xl text-center">
                        Você ainda não está seguindo nenhuma lista
                      </Text>
                    ) : (
                      <View className="justify-center items-center gap-6">
                        <Text className="font-boldInter text-3xl text-center">
                          Você ainda não criou nenhuma lista
                        </Text>
                        <Text className="font-mediumInter text-xl text-gray1 text-center">
                          Comece abaixo uma nova lista de compras para sua
                          comunidade.
                        </Text>
                      </View>
                    )}
                  </View>
                }
              />
            )}
          </View>

          <View className="w-full gap-4 mt-8">
            <TouchableOpacity
              className="bg-black rounded-xl p-4 items-center"
              onPress={() => navigateTo("/createListScreen", "")}
            >
              <Text className="font-mediumInter text-lg text-white">
                Criar Lista
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
