import { getAuth, signInAnonymously } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

export const signInAnon = async () => {
  await signInAnonymously(auth);
};
