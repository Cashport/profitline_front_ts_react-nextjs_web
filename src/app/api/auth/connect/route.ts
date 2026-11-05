import { auth } from "firebase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { customInitApp } from "../../../../../firebase-admin-config";
import { getPermissionsWithStatus } from "@/utils/permissions/getPermissions";
import { createPermissionedCustomToken } from "@/utils/auth/permissionedCustomToken";

customInitApp();

const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ code, message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST() {
  const authorization = headers().get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return fail(401, "TOKEN_MISSING", "Sesión no encontrada");
  }
  const idToken = authorization.split("Bearer ")[1];

  let uid: string;
  try {
    uid = (await auth().verifyIdToken(idToken, true)).uid;
  } catch {
    return fail(401, "SESSION_INVALID", "Tu sesión no es válida");
  }

  const result = await getPermissionsWithStatus(idToken);
  if (result.status !== 200 || !result.data) {
    if (result.status === 401 || result.status === 404) {
      return fail(
        401,
        result.code ?? "SESSION_INVALID",
        "No se pudo validar tu sesión. Revisa OTP, contraseña o estado de tu usuario"
      );
    }
    return fail(502, "PERMISSIONS_UNAVAILABLE", "No se pudo consultar tus permisos");
  }

  const projects = (result.data.permissions ?? []) as Array<{ client_id?: string | null }>;
  if (result.data.isMarketplaceGuest || projects.some((p) => p?.client_id)) {
    return fail(403, "EXTERNAL_USER", "Este tipo de usuario no puede conectar el MCP");
  }

  const token = await createPermissionedCustomToken(uid, result.data);
  return NextResponse.json(
    { data: { token } },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
