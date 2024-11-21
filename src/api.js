import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export const fetchLists = async (userId, isSharedLists) => {
    const listsRef = collection(db, "lists");
    const q = query(
        listsRef,
        isSharedLists
            ? where("sharedWith", "array-contains", userId)
            : where("ownerId", "==", userId),
        where("status", "==", "active")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchNotifications = async (userId) => {
    const invitesRef = collection(db, "invites");
    const q = query(
        invitesRef,
        where("toUserId", "==", userId),
        where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
