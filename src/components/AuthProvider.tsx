"use client";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext } from "react";
import { IdTokenHook, useIdToken } from "react-firebase-hooks/auth";

const AuthContext = createContext<IdTokenHook>([undefined, false, undefined]);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, loading, error] = useIdToken(auth, {
    onUserChanged: async (user) => {
      if (!user) {
        document.cookie = `idToken=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        router.push("/login");
      }
    },
  });

  return (
    <AuthContext.Provider value={[user, loading, error]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);