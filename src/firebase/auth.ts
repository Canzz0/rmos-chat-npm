import { signInWithCustomToken, type Auth, type UserCredential } from "firebase/auth";

/** Backend'den alınan custom JWT ile Firebase Auth oturumu açar. */
export async function signInWithFirebaseToken(
  auth: Auth,
  customToken: string,
): Promise<UserCredential> {
  return signInWithCustomToken(auth, customToken);
}
