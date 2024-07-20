import { db } from "@/lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
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
    const userRecentChatRef = doc(
      db,
      `recent-chats/${userId}`
    ) as DocumentReference<{ ids: string[] }, DocumentData>;
    const friendRecentChatRef = doc(
      db,
      `recent-chats/${friendId}`
    ) as DocumentReference<{ ids: string[] }, DocumentData>;

    const userResult = await getDoc(userRecentChatRef);
    const userRecentChats = userResult.data();
    const userRecentChatsLength = userRecentChats?.ids.length as number;

    const friendResult = await getDoc(friendRecentChatRef);
    const friendRecentChats = friendResult.data();
    const friendRecentChatsLength = friendRecentChats?.ids.length as number;

    if (userRecentChatsLength >= 3 && friendRecentChatsLength >= 3) {
      // delete and add for user
      await updateDoc(doc(db, `recent-chats/${userId}`), {
        ids: arrayRemove(userRecentChats?.ids[userRecentChatsLength - 1]),
      });
      await updateDoc(doc(db, `recent-chats/${userId}`), {
        ids: arrayUnion(chatId),
      });

      // delete and add for friend
      await updateDoc(doc(db, `recent-chats/${friendId}`), {
        ids: arrayRemove(friendRecentChats?.ids[friendRecentChatsLength - 1]),
      });
      await updateDoc(doc(db, `recent-chats/${friendId}`), {
        ids: arrayUnion(chatId),
      });
    } else {
      // add for user and friend
      await setDoc(doc(db, `recent-chats/${userId}`), {
        ids: arrayUnion(chatId),
      });
      await setDoc(doc(db, `recent-chats/${friendId}`), {
        ids: arrayUnion(chatId),
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
    await updateDoc(doc(db, `chats/${userId}/chat-details/${chatId}`), {
      lastMessage: lastMessage,
      lastMessageUserId: userId,
      timestamp: serverTimestamp(),
    });

    await updateDoc(doc(db, `chats/${friendId}/chat-details/${chatId}`), {
      lastMessage: lastMessage,
      lastMessageUserId: userId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
  }
}
