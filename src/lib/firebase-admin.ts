import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { Auth, getAuth } from "firebase-admin/auth";

let adminDB: Firestore | undefined;
let adminAuth: Auth | undefined;
const currentApps = getApps();

if (currentApps.length <= 0) {
  const app = initializeApp({
    credential: cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }),
  });
  adminDB = getFirestore(app);
  adminAuth = getAuth(app);
} else {
  adminDB = getFirestore(currentApps[0]);
  adminAuth = getAuth(currentApps[0]);
}

export { adminDB, adminAuth };
