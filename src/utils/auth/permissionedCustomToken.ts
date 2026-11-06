import { auth } from "firebase-admin";
import { deflateSync } from "zlib";
import { Buffer } from "buffer";
import { compactTokenPermissions } from "@/utils/permissions/tokenPermissions";
import { getPermissions } from "@/utils/permissions/getPermissions";

type PermissionsData = Awaited<ReturnType<typeof getPermissions>>;

export async function createPermissionedCustomToken(uid: string, permissions: PermissionsData) {
  let extraPermissions: {
    guestName?: string;
    guestId?: string;
    guestDocument?: string;
    guestEmail?: string;
    isMarketplaceGuest?: boolean;
  } = {};
  if (permissions?.isMarketplaceGuest) {
    extraPermissions = {
      guestName: permissions.guestName,
      guestId: permissions.guestId,
      guestDocument: permissions.guestDocument,
      guestEmail: permissions.guestEmail,
      isMarketplaceGuest: permissions.isMarketplaceGuest
    };
  }
  // Un super admin no necesita el árbol de views_permissions dentro del
  // token: el backend lo autoriza contra la base de datos. Sin esto el JWT
  // supera el límite de headers de App Runner/Envoy (HTTP 431).
  const tokenPermissions = compactTokenPermissions(permissions);
  const buffer = Buffer.from(JSON.stringify(tokenPermissions)) as any;
  const compressedClaims = deflateSync(buffer).toString("base64");
  return auth().createCustomToken(uid, {
    ...extraPermissions,
    userName: permissions?.userName,
    permissions: compressedClaims
  });
}
