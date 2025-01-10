import {
  Auth,
  onAuthStateChanged,
  signInAnonymously,
  Unsubscribe,
  User,
} from "firebase/auth";
import { FirebaseDatastore } from "./firebase";
export interface AnonymousUserData {
  type: "anonymous";
  id: string;
  name: string;
}
export interface GoogleUserData {
  type: "google";
  id: string;
  name: string;
  email: string;
  locale: string;
  picture: string;
}
export type UserData = AnonymousUserData | GoogleUserData;

export function getUserDataFromFirebaseUser(user: User): UserData {
  return {
    type: "anonymous",
    id: user.uid,
    name: user.displayName || "",
  };
}

export function signInAnonymouslyWithFirebase(
  firebaseService: FirebaseDatastore,
  setUserState: (user?: User) => void
): Unsubscribe {
  const auth = firebaseService.getAuth();
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserState(user);
      //   if (!userState) {
      //     setUserState({
      //       type: "anonymous",
      //       id: user.uid,
      //       name: user.displayName || "",
      //     });
      //   }
    } else {
      signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`${errorCode}: ${errorMessage}`);
      });
    }
  });
}
