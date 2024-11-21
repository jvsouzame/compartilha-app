// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/context/authContext";
import {
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
import {
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function Archive() {
  const { user } = useAuth();

  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchLists(user?.uid);
    } else if (user?.uid) {
      fetchLists(user?.uid);
    }
  }, [isRefreshing]);

  /**
   * @async
   * @function fetchLists
   * @description - Busca as listas do usuário.
   */
  const fetchLists = async (userId) => {
    setIsLoading(true);

    try {
      const listsRef = collection(db, "lists");
      const q = query(
        listsRef,
        where("ownerId", "==", userId),
        where("status", "==", "archived")
      );

      const querySnapshot = await getDocs(q);

      const lists = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLists(lists);

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar listas:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as listas arquivadas. Tente novamente mais tarde.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
    }
  };

   /**
   * @function confirmArchiveList
   * @description - Exibe um alerta de confirmação para arquivar a lista.
   */
   const confirmArchiveList = async (listId, listStatus) => {
    if (listStatus === "archived") {
      Alert.alert(
        "Confirmação",
        "Tem certeza de que deseja excluir esta lista?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Confirmar",
            onPress: () => {
              handleDeleteList(listId);
            },
          },
        ]
      );
    }
  };

  /**
   * @async
   * @function handleDeleteList
   * @description - Exclui a lista.
   */
  const handleDeleteList = async (listId) => {
    setIsLoading(true);

    try {
      const listRef = doc(db, "lists", listId);
      await deleteDoc(listRef);

      setLists((prevItems) => prevItems.filter((item) => item.id !== listId));

      Alert.alert("Sucesso", "Lista excluída com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao excluir o convite:", error);
      setIsLoading(false);
    }
  };

  /**
   * @async
   * @function handleActivateList
   * @description - Desarquiva a lista.
   */
  const handleActivateList = async (listId) => {
    try {
      setIsLoading(true);
      const listRef = doc(db, "lists", listId);
      await updateDoc(listRef, {
        status: "active",
        updatedAt: serverTimestamp(),
      });

      setLists((prevItems) => prevItems.filter((item) => item.id !== listId));

      Alert.alert("Sucesso", "Lista desarquivada com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar o status da lista:", error);
      setIsLoading(false);
    }
  };

  const renderListItem = (item) => {
    return (
      <View className="flex-row justify-between gap-4 bg-white rounded-xl border-hairline p-4">
        <View className="flex-row flex-1 justify-between items-center border-gray2">
          <Text className="font-mediumInter text-lg text-black">
            {item.title}
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-2  w-1/4">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2"
            onPress={() => confirmArchiveList(item.id, item.status)}
            testID={`delete-button-${item.id}`}
          >
            <AntDesign name="delete" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2"
            onPress={() => handleActivateList(item.id)}
            testID={`restore-button-${item.id}`}
          >
            <MaterialCommunityIcons name="restore" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-8 bg-background">
        <View className="px-4 py-8 ">
          <Text className="font-boldPoppins text-3xl">Listas Arquivadas</Text>
        </View>

        <View className="flex-1 gap-4 p-4">
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#000"
              className="flex-1 justify-center items-center"
              testID="loading-indicator"
            />
          ) : (
            <View testID="flat-list-wrapper">
              <FlatList
                data={lists}
                contentContainerStyle={{ flexGrow: 1, gap: 12 }}
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
                  <View className="flex-1 justify-center items-center gap-6 p-4">
                    <Text
                      className="font-boldInter text-3xl text-center"
                      testID="empty-list-message"
                    >
                      Você ainda não arquivou nenhuma lista
                    </Text>
                  </View>
                }
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
