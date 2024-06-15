type User = {
  id: string;
  displayName: string;
  email: string;
  photoUrl: string;
};

type Message = {
  message: string;
  userId: string;
  timestamp: import("firebase/firestore").Timestamp;
};
