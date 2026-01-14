// Import the functions you need from the SDKs you need
import {
  CAPTCHA_SITE_KEY,
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
} from "@/utils/constants/globalConstants";
import { initializeApp } from "firebase/app";
import { getAuth, ParsedToken, signInWithCustomToken } from "firebase/auth";
import "firebase/auth";
import "firebase/functions";
import "firebase/firestore";
import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";
import zlib from "react-zlib-js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, AppCheck } from "firebase/app-check";

// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export async function customGetAuth(token: string) {
  const customToken = await signInWithCustomToken(auth, token);
  customToken.user.getIdTokenResult();
  return customToken;
}

export const getTokenAppCheck = async (appCheck: AppCheck) => {
  const appCheckToken = await getToken(appCheck, false);
  return appCheckToken.token;
};

interface Claims extends ParsedToken {
  permissions: IUserPermissions["data"];
}

export const decodedClaims = async (token: string) => {
  const decoded = await signInWithCustomToken(auth, token);
  const decodedIdToken = await decoded.user.getIdTokenResult();
  const claims = decodedIdToken.claims;
  const permissionsEncoded = claims.permissions as string;
  const buffer = Buffer.from(permissionsEncoded, "base64") as any;
  const decompressedClaims = await new Promise<any>((resolve, reject) => {
    zlib.unzip(buffer, (err: any, data: any) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  claims.permissions = JSON.parse(decompressedClaims);
  return claims as Claims;
};

export default app;
