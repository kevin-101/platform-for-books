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

    if (!userResult.exists()) {
      await setDoc(doc(db, `recent-chats/${userId}`), {
        ids: arrayUnion(chatId),
      });
    } else {
      const userRecentChats = userResult.data();
      const userRecentChatsLength = userRecentChats?.ids.length as number;

      if (userRecentChatsLength >= 3) {
        await updateDoc(doc(db, `recent-chats/${userId}`), {
          ids: arrayRemove(userRecentChats?.ids[userRecentChatsLength - 1]),
        });
        await updateDoc(doc(db, `recent-chats/${userId}`), {
          ids: arrayUnion(chatId),
        });
      } else {
        await setDoc(doc(db, `recent-chats/${userId}`), {
          ids: arrayUnion(chatId),
        });
      }
    }

    const friendResult = await getDoc(friendRecentChatRef);

    if (!userResult.exists()) {
      await setDoc(doc(db, `recent-chats/${userId}`), {
        ids: arrayUnion(chatId),
      });
    } else {
      const friendRecentChats = friendResult.data();
      const friendRecentChatsLength = friendRecentChats?.ids.length as number;

      if (friendRecentChatsLength >= 3) {
        await updateDoc(doc(db, `recent-chats/${friendId}`), {
          ids: arrayRemove(friendRecentChats?.ids[friendRecentChatsLength - 1]),
        });
        await updateDoc(doc(db, `recent-chats/${friendId}`), {
          ids: arrayUnion(chatId),
        });
      } else {
        await setDoc(doc(db, `recent-chats/${friendId}`), {
          ids: arrayUnion(chatId),
        });
      }
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
