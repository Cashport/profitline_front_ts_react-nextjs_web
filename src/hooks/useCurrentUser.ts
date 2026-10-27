"use client";
import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";

import { auth } from "../../firebase";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";

export interface ICurrentUser {
  name: string;
  email: string;
}

const base64ToBytes = (b64: string) =>
  Uint8Array.from(atob(b64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/**
 * El nombre vive en los permisos que /api/auth comprime dentro del token local
 * (`claims.permissions`, deflate + base64). Se lee el payload sin verificarlo ni volver a
 * iniciar sesión: `decodedClaims` hace signInWithCustomToken y dispararía este mismo listener.
 */
const readUserName = async (): Promise<string> => {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) return "";
    const payload = JSON.parse(new TextDecoder().decode(base64ToBytes(token.split(".")[1])));
    const stream = new Blob([base64ToBytes(payload.claims.permissions)])
      .stream()
      .pipeThrough(new DecompressionStream("deflate"));
    const permissions = JSON.parse(await new Response(stream).text());
    return permissions.userName ?? "";
  } catch {
    return "";
  }
};

/** Usuario de la sesión: correo de Firebase; nombre del claim `userName` o del token local. */
export const useCurrentUser = () => {
  const [user, setUser] = useState<ICurrentUser | null>(null);

  useEffect(
    () =>
      onIdTokenChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          return;
        }
        // Tras el login, la sesión trae `userName` como claim; sesiones más viejas solo lo
        // tienen dentro del token local.
        const { claims } = await firebaseUser.getIdTokenResult();
        setUser({
          name:
            (claims.userName as string | undefined) ||
            (await readUserName()) ||
            firebaseUser.displayName ||
            "",
          email: firebaseUser.email ?? ""
        });
      }),
    []
  );

  return user;
};
