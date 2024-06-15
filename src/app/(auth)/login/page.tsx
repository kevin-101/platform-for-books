"use client";

import { Button } from "@/components/ui/button";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  User,
  UserCredential,
  getRedirectResult,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSignInWithRedirect } from "@/hooks/use-signin-with-redirect";
import { useEffect, useState } from "react";

export default function Page() {
  const [user, __, ___] = useAuthState(auth);
  const provider = new GoogleAuthProvider();
  const [signInWithGoogle, loading, _] = useSignInWithRedirect(auth, provider);
  const [redirectLoading, setRedirectLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      setRedirectLoading(true);

      try {
        const result = await getRedirectResult(auth);
        const userId = result?.user.uid as string;
        const user = await getDoc(doc(db, "users", userId));

        // check if user already doesn't exist
        if (!user.exists()) {
          try {
            await setDoc(doc(db, "users", userId), {
              id: userId,
              displayName: result?.user.displayName,
              email: result?.user.email,
              photoUrl: result?.user.photoURL,
            });
            router.push("/dashboard");
          } catch (error) {
            console.log(error);
          } finally {
            setRedirectLoading(false);
            return;
          }
        }
        setRedirectLoading(false);
        router.push("/dashboard");
      } catch (error) {
        console.log(error);
      } finally {
        setRedirectLoading(false);
      }
    }

    if (user) {
      handleRedirect();
    }
  }, [user]);

  async function signIn() {
    try {
      signInWithGoogle();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex justify-center w-full h-[100dvh]">
      <div className="hidden lg:flex flex-col gap-8 justify-center items-center w-1/2 relative bg-orange-50 border-r border-orange-500">
        <h1 className="text-6xl font-bold text-orange-500">Welcome</h1>
        <p className="text-3xl text-center text-orange-300">
          Login to get full access to the site
        </p>
      </div>

      <div className="bg-orange-50 lg:bg-background flex-1 flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-12 w-3/4">
          <div className="flex flex-col gap-4 items-center lg:hidden">
            <h1 className="text-3xl font-bold text-orange-500">Welcome</h1>
            <p className="text-center text-xl text-orange-300">
              Login to get full access to the site
            </p>
          </div>

          <Button
            variant="outline"
            className="flex gap-4 w-full lg:w-2/3 border-orange-200 bg-orange-50 lg:bg-background hover:bg-orange-100 font-bold"
            disabled={user ? redirectLoading : loading}
            onClick={() => signIn()}
          >
            {(user ? redirectLoading : loading) ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="25"
                  height="25"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                Login with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
