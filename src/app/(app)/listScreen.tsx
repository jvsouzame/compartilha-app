// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Href, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { db } from "@/firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/src/context/authContext";

export default function ListScreen() {
  const { params } = useLocalSearchParams();
  const { user } = useAuth();

  const userId = user?.uid;
  const list = typeof params === "string" ? JSON.parse(params) : null;

  const [title, setTitle] = useState(list?.title || "");
  const [description, setDescription] = useState(list?.description || "");
  const [status, setStatus] = useState(list?.status || "");
  const [items, setItems] = useState(list?.items || []);
  const [sharedWith, setSharedWith] = useState(list?.sharedWith || []);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigateTo = (route: Href) => {
    router.push(route);
  };

  const navigateToCreateInviteModal = () => {
    router.push({
      pathname: "/createInviteModal",
      params: {
        listId: list.id,
        listTitle: list.title,
      },
    });
  };

  const handleQuantityChange = (index, delta) => {
    setItems((prevItems) =>
      prevItems.map((itm, idx) =>
        idx === index
          ? { ...itm, quantity: Math.max(0, itm.quantity + delta) }
          : itm
      )
    );
  };

  /**
   * @async
   * @function updateList
   * @description - Atualiza a lista no Firestore.
   */
  const updateList = async () => {
    setIsLoading(true);

    try {
      const listRef = doc(db, "lists", list.id);
      await updateDoc(listRef, {
        title: title,
        description: description,
        items: items,
        status: status,
        sharedWith: sharedWith,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Lista salva com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      setIsEditEnabled(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao salvar a lista:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar a lista. Tente novamente mais tarde.",
        [{ text: "OK" }]
      );
      setIsEditEnabled(false);
      setIsLoading(false);
    }
  };

  /**
   * @async
   * @function addItem
   * @description - Adiciona um item à lista.
   */
  const addItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert("Aviso", "Digite um nome para o item.");
      return;
    }

    const newItem = { name: newItemName, quantity: 1, checked: false };

    setItems((prevItems) => [...prevItems, newItem]);
    setNewItemName("");
  };

  /**
   * @async
   * @function deleteItem
   * @description - Exclui um item da lista.
   */
  const deleteItem = async (itemToDelete) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.name !== itemToDelete.name)
    );
  };

  /**
   * @function confirmArchiveList
   * @description - Exibe um alerta de confirmação para arquivar a lista.
   */
  const confirmArchiveList = async () => {
    if (list?.status === "active") {
      Alert.alert(
        "Confirmação",
        "Tem certeza de que deseja arquivar esta lista?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Confirmar",
            onPress: () => {
              archiveListStatus();
            },
          },
        ]
      );
    }
  };

  /**
   * @async
   * @function archiveListStatus
   * @description - Atualiza o status da lista para 'archived' no Firestore.
   */
  const archiveListStatus = async () => {
    try {
      setIsLoading(true);
      const listRef = doc(db, "lists", list.id);
      await updateDoc(listRef, {
        status: "archived",
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Lista arquivada com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      setIsEditEnabled(false);
      setIsLoading(false);

      navigateTo("/dashboard");
    } catch (error) {
      console.error("Erro ao atualizar o status da lista:", error);
      Alert.alert(
        "Erro",
        "Não foi possível arquivar a lista. Tente novamente mais tarde.",
        [{ text: "OK" }]
      );
      setIsEditEnabled(false);
      setIsLoading(false);
    }
  };

  /**
   * @async
   * @function cancelEdit
   * @description - Cancela a edição da lista.
   */
  const cancelEdit = async () => {
    await fetchList();
    setIsEditEnabled(false);
  };

  /**
   * @async
   * @function fetchList
   * @description - Busca a lista atualizada no firebase.
   */
  const fetchList = async () => {
    try {
      const listRef = doc(db, "lists", list.id);
      const listDoc = await getDoc(listRef);

      if (listDoc.exists()) {
        const listData = listDoc.data();

        setTitle(listData.title);
        setDescription(listData.description);
        setItems(listData.items);
      } else {
        console.log("Documento não encontrado!");
      }
    } catch (error) {
      console.error("Erro ao adicionar o item:", error);
      Alert.alert(
        "Erro",
        "Houve um erro ao adicionar o item. Tente novamente."
      );
    }
  };

  /**
   * @async
   * @function handleUnsubscribe
   * @description - Deixa de seguir a lista.
   */
  const handleUnsubscribe = async () => {
    setIsLoading(true);

    try {
      const listRef = doc(db, "lists", list.id);

      await updateDoc(listRef, {
        sharedWith: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Lista salva com sucesso!", [
        { text: "OK", onPress: () => console.log("OK pressionado") },
      ]);

      setIsLoading(false);

      navigateTo("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar a lista:", error);
      setIsLoading(false);
    }
  };

  const renderItems = (item, index) => {
    return (
      <View className="gap-2 pb-2">
        <View className="flex-row justify-between items-center gap-6 border-b-hairline py-4">
          {isEditEnabled ? (
            <TextInput
              className="flex-1 font-boldInter text-l bg-white rounded-xl py-2 px-4 border-hairline border-gray2"
              value={item.name}
              onChangeText={(text) => {
                const newItems = [...items];
                newItems[index].name = text;
                setItems(newItems);
              }}
            />
          ) : (
            <Text className="font-boldInter text-l">{item.name}</Text>
          )}

          {isEditEnabled ? (
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className="bg-red-200 p-2 rounded-xl"
                onPress={() => handleQuantityChange(index, -1)}
                disabled={!isEditEnabled}
                testID={`decrease-button-${index}`}
              >
                <AntDesign name="minus" size={24} color="black" />
              </TouchableOpacity>

              <Text className="font-mediumInter text-lg text-black">
                {item.quantity}
              </Text>

              <TouchableOpacity
                className="bg-green-200 p-2 rounded-xl"
                onPress={() => handleQuantityChange(index, 1)}
                disabled={!isEditEnabled}
                testID={`increase-button-${index}`}
              >
                <AntDesign name="plus" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="font-mediumInter text-lg text-black">
                {item.quantity}
              </Text>
            </View>
          )}
        </View>

        {isEditEnabled ? (
          <View className="pt-2">
            <TouchableOpacity onPress={() => deleteItem(item)}>
              <Text className="font-boldInter text-l text-red-500 text-center">
                Excluir Item
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      {isLoading ? (
        <View className="flex-1 pt-8 bg-background justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 pt-8 bg-background">
            <View className="px-8 py-4">
              {isEditEnabled ? (
                <View className="items-end">
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text className="font-mediumInter text-l text-gray1" >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
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
              )}
            </View>

            <View className="flex-1 gap-4 px-8 pb-12">
              <View className="gap-2">
                {isEditEnabled ? (
                  <TextInput
                    className="font-boldPoppins text-2xl bg-white rounded-xl p-4 border-hairline border-gray2"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Título"
                  />
                ) : (
                  <Text className="font-boldPoppins text-2xl">{title}</Text>
                )}
              </View>

              <View className="gap-2">
                <Text className="font-mediumInter text-l text-gray1">
                  Descrição
                </Text>

                {isEditEnabled ? (
                  <TextInput
                    className="max-h-28 font-mediumInter text-l text-black bg-white rounded-xl p-4 border-hairline border-gray2"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Descrição da lista"
                    multiline={true}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text className="font-mediumInter text-l">{description}</Text>
                )}
              </View>

              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="flex-1">
                  {items.map((item, index) => (
                    <View key={`${item.name}-${index}`} className="gap-2 pb-2">
                      {renderItems(item, index)}
                    </View>
                  ))}
                </View>
              </ScrollView>

              {isEditEnabled ? (
                <View>
                  <View className="flex-row items-center gap-4 mt-4">
                    <TextInput
                      className="flex-1 font-mediumInter text-l text-black bg-white rounded-xl py-2 px-4 border-hairline border-gray2"
                      placeholder="Adicione um novo item"
                      value={newItemName}
                      onChangeText={setNewItemName}
                    />
                    <TouchableOpacity
                      className="bg-black p-1 rounded-xl"
                      onPress={addItem}
                      testID="add-item-button"
                    >
                      <AntDesign name="plus" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="w-full gap-4 mt-8">
                    <TouchableOpacity
                      className="bg-black rounded-xl p-4 items-center"
                      onPress={updateList}
                    >
                      <Text className="font-mediumInter text-lg text-white">
                        Salvar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : userId === list.ownerId ? (
                <View className="flex-row justify-between">
                  <View className="w-[28%]">
                    <TouchableOpacity
                      className="justify-between items-center bg-white rounded-xl py-4 border-hairline border-gray2 gap-1"
                      onPress={() => setIsEditEnabled(!isEditEnabled)}
                    >
                      <AntDesign name="edit" size={24} color="black" />
                      <Text className="font-mediumInter text-l text-black">
                        Editar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="w-[28%]">
                    <TouchableOpacity
                      className="justify-between items-center bg-white rounded-xl py-4 border-hairline border-gray2 gap-1"
                      onPress={() => confirmArchiveList()}
                      testID="archive-list-button"
                    >
                      <Feather name="archive" size={24} color="black" />
                      <Text className="font-mediumInter text-l text-black">
                        Arquivar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="w-[28%]">
                    <TouchableOpacity
                      className="justify-between items-center bg-white rounded-xl py-4 border-hairline border-gray2 gap-1"
                      onPress={navigateToCreateInviteModal}
                    >
                      <Ionicons name="share-outline" size={24} color="black" />
                      <Text className="font-mediumInter text-l text-black">
                        Convidar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="justify-center items-center">
                  <TouchableOpacity
                    className="justify-between items-center bg-white rounded-xl py-4 px-8 border-hairline border-gray2 gap-1"
                    onPress={() => handleUnsubscribe()}
                  >
                    <FontAwesome5 name="outdent" size={24} color="black" />
                    <Text className="font-mediumInter text-l text-black">
                      Deixar de seguir
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}
