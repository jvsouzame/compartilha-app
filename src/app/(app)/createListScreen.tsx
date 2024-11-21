// @ts-nocheck
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Href, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { db } from "@/firebaseConfig";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/src/context/authContext";

export default function CreateListScreen() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");

  const navigateTo = (route: Href) => {
    router.push(route);
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
   * @function createList
   * @description - Cria a lista no Firestore.
   */
  const createList = async () => {
    if (!title.trim()) {
      Alert.alert("Aviso", "Digite um título para a lista.");
      return;
    }

    try {
      const listsRef = collection(db, "lists");

      const newList = {
        title: title,
        description: description,
        items: items,
        ownerId: user.uid,
        sharedWith: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      };

      const docRef = await addDoc(listsRef, newList);

      console.log("Lista criada com ID:", docRef.id);
      Alert.alert("Sucesso", "Lista criada com sucesso!");

      navigateTo("/dashboard");
    } catch (error) {
      console.error("Erro ao criar a lista:", error);
      Alert.alert("Erro", "Houve um erro ao criar a lista. Tente novamente.");
      navigateTo("/dashboard");
    }
  };

  /**
   * @async
   * @function addItemToList
   * @description - Adiciona um item à lista.
   */
  const addItemToList = async () => {
    if (!newItemName.trim()) {
      Alert.alert("Aviso", "Digite um nome para o item.");
      return;
    }

    console.log("Adicionando item:", newItemName);

    const newItem = { name: newItemName, quantity: 1, checked: false };

    setItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      console.log("Items atualizados:", updatedItems);
      return updatedItems;
    });
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

  const renderItems = (item, index) => {
    return (
      <View className="gap-2 pb-2">
        <View className="flex-row justify-between items-center gap-6 border-b-hairline py-4">
          <TextInput
            testID={`item-name-${index}`}
            className="flex-1 font-boldInter text-l bg-white rounded-xl py-2 px-4 border-hairline border-gray2"
            value={item.name}
            onChangeText={(text) => {
              const newItems = [...items];
              newItems[index].name = text;
              setItems(newItems);
            }}
          />

          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="bg-red-200 p-2 rounded-xl"
              onPress={() => handleQuantityChange(index, -1)}
            >
              <AntDesign name="minus" size={24} color="black" />
            </TouchableOpacity>

            <Text className="font-mediumInter text-lg text-black">
              {item.quantity}
            </Text>

            <TouchableOpacity
              className="bg-green-200 p-2 rounded-xl"
              onPress={() => handleQuantityChange(index, 1)}
            >
              <AntDesign name="plus" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="pt-2">
          <TouchableOpacity onPress={() => deleteItem(item)}>
            <Text className="font-boldInter text-l text-red-500 text-center">
              Excluir Item
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View className="flex-1 pt-8 bg-background">
        <View className="px-8 py-4">
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
        </View>

        <View className="flex-1 gap-4 px-8 pb-12">
          <View className="gap-2">
            <TextInput
              className="font-boldPoppins text-2xl bg-white rounded-xl p-4 border-hairline border-gray2"
              value={title}
              onChangeText={setTitle}
              placeholder="Título"
            />
          </View>

          <View className="gap-2">
            <Text className="font-mediumInter text-l text-gray1">
              Descrição
            </Text>

            <TextInput
              className="max-h-28 font-mediumInter text-l text-black bg-white rounded-xl p-4 border-hairline border-gray2"
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição da lista"
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-1">
            <FlatList
              data={items}
              contentContainerStyle={{}}
              keyExtractor={(item, index) => `${item.name} + ${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => renderItems(item, index)}
            />
          </View>

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
                onPress={addItemToList}
                testID="add-item-button"
              >
                <AntDesign name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="w-full gap-4 mt-8">
              <TouchableOpacity
                className="bg-black rounded-xl p-4 items-center"
                onPress={createList}
              >
                <Text className="font-mediumInter text-lg text-white">
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
