// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  collection,
  CollectionReference,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  initializeFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { Auth, getAuth } from "firebase/auth";
import { Datastore } from "./datastore";
import { GameState, Response } from "../game/types";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export class FirebaseDatastore implements Datastore {
  private _app: FirebaseApp;
  private _db: Firestore;
  private _auth: Auth;
  private _gamesRef: CollectionReference;

  constructor(config: FirebaseConfig, gamesRef: string = "games") {
    this._app = initializeApp(config);
    this._db = initializeFirestore(this._app, {
      ignoreUndefinedProperties: true,
    });
    this._auth = getAuth(this._app);
    this._gamesRef = collection(this._db, gamesRef);
  }

  private async getDocSnap(gameId: string): Promise<DocumentSnapshot> {
    const docRef = doc(this._gamesRef, gameId);
    const docSnap = getDoc(docRef);
    return docSnap;
  }

  getAuth(): Auth {
    return this._auth;
  }

  async doesGameExist(gameId: string): Promise<boolean> {
    const docSnap = await this.getDocSnap(gameId);
    return docSnap.exists();
  }

  async getGame(gameId: string): Promise<GameState> {
    const docSnap = await this.getDocSnap(gameId);
    if (docSnap.exists()) {
      return docSnap.data() as GameState;
    } else {
      throw Error("Game does not exist");
    }
  }

  listenForGameUpdates(
    gameId: string,
    setGameCallback: (
      value: React.SetStateAction<GameState | undefined>
    ) => void
  ): void {
    onSnapshot(doc(this._gamesRef, gameId), (doc) => {
      if (doc.exists()) {
        setGameCallback({ ...doc.data() } as GameState);
      } else {
        throw Error("Game does not exist");
      }
    });
  }

  saveGame(state: GameState): Promise<Response> {
    return setDoc(doc(this._gamesRef, state.gameId), {
      ...state,
    })
      .then((t) => Response.ok())
      .catch((e) => Response.error(`Unable to save game. Error: ${e}`));
  }
}
