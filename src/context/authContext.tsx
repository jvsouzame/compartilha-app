// @ts-nocheck
import { auth, db } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        updateUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return unsub;
  }, []);

  const updateUserData = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      setUser({
        ...user,
        name: data.name,
        username: data.username,
        email: data.email,
        uid: data.userId,
        profileImage: data.profileImage,
      });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email")) {
        msg = "Email inválido";
      }
      if (msg.includes("(auth/invalid-credential")) {
        msg = "Email ou senha inválidos";
      }
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message, error: 0 };
    }
  };

  const register = async (name, username, email, password, profileImage) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("register response user", response?.user);

      await setDoc(doc(db, "users", response?.user?.uid), {
        name,
        username,
        email,
        profileImage,
        userId: response?.user?.uid,
        createdAt: serverTimestamp()
      });
      return { success: true, data: response?.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) {
        msg = "Email inválido.";
      }
      if (msg.includes("(auth/email-already-in-use)")) {
        msg = "Esse e-mail já está sendo usado.";
      }
      console.log(e.message)
      if (msg.includes("(auth/weak-password).")) {
        msg = "A senha deve ter pelo menos 6 caracteres.";
      }
      return { success: false, msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContextProvider");
  }
  return value;
};
