// Sin "use client": este módulo lo importan tanto componentes cliente como la
// API route /api/auth (server-side, src/app/api/auth/route.ts). Con "use client"
// aquí, Next.js trata el módulo como un client reference boundary y las funciones
// exportadas (p.ej. customGetAuth) dejan de ser invocables desde un Route Handler
// ("customGetAuth is not a function" en runtime). Mismo archivo sin la directiva
// en origin/main.
// Import the functions you need from the SDKs you need
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
} from "@/utils/constants/globalConstants";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  browserLocalPersistence,
  ParsedToken,
  signInWithCustomToken,
  Auth
} from "firebase/auth";
import "firebase/auth";
import "firebase/functions";
import "firebase/firestore";
import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";
import zlib from "react-zlib-js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken, AppCheck } from "firebase/app-check";

// https://google.com
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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// firebase.ts se importa transitivamente desde el layout raíz (api.ts -> store ->
// ModalContext), así que su código top-level corre también durante el SSR de
// cualquier página (Next.js ejecuta los Client Components en Node para el primer
// render). `getAuth(app)` en el import top-level crashea ahí con "Component auth
// has not been registered yet". Por eso Auth se resuelve perezosamente (solo cuando
// algo la pide) y se cachea una única instancia por proceso en vez de recrearla en
// cada llamada. Se usa SIEMPRE `initializeAuth` primero (registra el componente
// explícitamente) en vez de `getAuth(app)` como primer intento: en este bundle
// `getAuth` asume que "auth" ya quedó auto-registrado en el contenedor del app y
// revienta con "Component auth has not been registered yet" cuando no fue así.
// Si `initializeAuth` ya corrió antes en este mismo proceso (HMR, SSR repetido),
// tira su propio error ("already-initialized") y ahí sí `getAuth(app)` funciona
// porque el componente quedó registrado por esa primera llamada.
let cachedAuth: Auth | null = null;

export const getClientAuth = (): Auth => {
  if (cachedAuth) return cachedAuth;
  try {
    cachedAuth = initializeAuth(app, {
      persistence: typeof window === "undefined" ? inMemoryPersistence : browserLocalPersistence
    });
  } catch {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
};

export async function customGetAuth(token: string) {
  const customToken = await signInWithCustomToken(getClientAuth(), token);
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
  const decoded = await signInWithCustomToken(getClientAuth(), token);
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
