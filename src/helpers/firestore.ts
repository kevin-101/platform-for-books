import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export async function setRecentChat(
  userId: string,
  friendId: string,
  chatId: string
) {
  try {
    const userQuery = query(
      collection(db, `user:${userId}:recent-chats`),
      orderBy("timestamp", "desc")
    );
    const friendQuery = query(
      collection(db, `user:${friendId}:recent-chats`),
      orderBy("timestamp", "desc")
    );

    const userResult = await getDocs(userQuery);
    const userRecentChats = userResult.docs;

    const friendResult = await getDocs(userQuery);
    const friendRecentChats = friendResult.docs;

    if (userRecentChats.length >= 3 && friendRecentChats.length >= 3) {
      // delete and add for user
      await deleteDoc(
        doc(db, `user:${userId}:recent-chats/${userResult.docs[2].id}`)
      );
      await setDoc(doc(db, `user:${userId}:recent-chats/${chatId}`), {
        id: chatId,
      });

      // delete and add for friend
      await deleteDoc(
        doc(db, `user:${friendId}:recent-chats/${friendResult.docs[2].id}`)
      );
      await setDoc(doc(db, `user:${friendId}:recent-chats/${chatId}`), {
        id: chatId,
      });
    } else {
      // add for user and friend
      await setDoc(doc(db, `user:${userId}:recent-chats/${chatId}`), {
        id: chatId,
      });
      await setDoc(doc(db, `user:${friendId}:recent-chats/${chatId}`), {
        id: chatId,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateUserChats(
  chatId: string,
  userId: string,
  friendId: string,
  lastMessage: string | undefined
) {
  try {
    await updateDoc(doc(db, `user:${userId}:chats/${chatId}`), {
      lastMessage: lastMessage,
      lastMessageUserId: userId,
      timestamp: serverTimestamp(),
    });

    await updateDoc(doc(db, `user:${friendId}:chats/${chatId}`), {
      lastMessage: lastMessage,
      lastMessageUserId: userId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
  }
}
