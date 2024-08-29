type User = {
  id: string;
  displayName: string;
  email: string;
  photoUrl: string;
};

type Message = {
  messageId: string;
  message: string;
  userId: string;
  timestamp: import("firebase/firestore").Timestamp;
};

type Chat = {
  id: string;
  chatName: string;
  chatImage: string;
  lastMessage: string | null;
  lastMessageUserId: string | null;
  timestamp: { _seconds: number; _nanoseconds: number };
};

type UserSharedBook = {
  bookDocId: string;
  bookId: string;
  bookName: string;
  bookImageUrl: string;
  userId: string;
};

type SharedBookUsers = {
  bookName: string;
  users: User[];
};
