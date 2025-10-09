import { auth } from "firebase-admin";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { customInitApp } from "../../../../firebase-admin-config";
import { COOKIE_NAME } from "@/utils/constants/globalConstants";
import { customGetAuth } from "../../../../firebase";
import { getPermissions } from "@/utils/permissions/getPermissions";
import { deflateSync } from "zlib";
import { Buffer } from "buffer";

customInitApp();

export async function POST() {
  const authorization = headers().get("Authorization");
  let token: string = "";

  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    const permissions = await getPermissions(idToken);
    const buffer = Buffer.from(JSON.stringify(permissions)) as any;
    const compressedClaims = deflateSync(buffer).toString("base64");
    const idCustomToken = await auth().createCustomToken(decodedToken.uid, {
      permissions: compressedClaims
    });
    console.log(idCustomToken);
    const idCustomTokenSession = await auth().createCustomToken(decodedToken.uid);
    token = idCustomToken;
    const customToken = await customGetAuth(idCustomTokenSession);
    if (decodedToken) {
      //Generar cookie
      const expiresIn = 60 * 60 * 24 * 14 * 1000;
      const sessionCookie = await auth().createSessionCookie(
        (await customToken.user.getIdTokenResult()).token,
        {
          expiresIn
        }
      );
      const options = {
        name: COOKIE_NAME,
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true
      };

      cookies().set(options as any);
    }
  }

  return NextResponse.json({ data: { token } }, { status: 200 });
}
export async function GET() {
  const pathname = headers().get("x-pathname") || "";

  // If the path starts with /mobile or /cetaphil, skip authentication
  if (pathname.startsWith("/mobile") || pathname.startsWith("/cetaphil")) {
    return NextResponse.json({ isLogged: true }, { status: 200 });
  }

  const session = cookies().get(COOKIE_NAME || "")?.value || "";

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  const decodedClaims = await auth().verifySessionCookie(session, true);

  if (!decodedClaims) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  return NextResponse.json({ isLogged: true }, { status: 200 });
}
