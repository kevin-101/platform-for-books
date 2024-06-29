import {
  Auth,
  AuthError,
  AuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { useCallback, useState } from "react";

type AuthActionHook<M> = [M, boolean, AuthError | undefined];

type singnInWithRedirect = AuthActionHook<() => void>;

export function useSignInWithRedirect(
  auth: Auth,
  provider: AuthProvider
): singnInWithRedirect {
  const [error, setError] = useState<AuthError>();
  const [loading, setLoading] = useState<boolean>(false);

  const doSignInWithRedirect = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      setError(error as AuthError);
    } finally {
      setLoading(false);
    }
  }, [auth, provider]);

  return [doSignInWithRedirect, loading, error];
}
