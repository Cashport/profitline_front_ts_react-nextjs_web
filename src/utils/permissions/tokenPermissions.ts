export interface TokenPermissionEntry {
  is_super_admin?: boolean;
  views_permissions?: unknown;
  [key: string]: unknown;
}

export interface TokenPermissionsPayload {
  permissions?: TokenPermissionEntry[];
  [key: string]: unknown;
}

/**
 * Compacta el payload de permisos que `/api/auth` comprime dentro del custom
 * token de Firebase.
 *
 * Un super admin recibe todos los proyectos y todos los componentes; con el
 * catálogo actual (48 proyectos × 64 componentes) el JWT supera los 16 KB y
 * AWS App Runner / Envoy responde HTTP 431 antes de llegar al backend.
 *
 * Para las entradas de super admin se quita `views_permissions` del token y se
 * conserva todo lo demás (`project_id`, `name`, `logo`, `action_permissions`,
 * `is_super_admin`). Los usuarios normales no se tocan.
 *
 * Seguridad: la ausencia de `views_permissions` NO autoriza en el backend.
 * `validate-token.ts` exige `is_super_admin === true` en el token firmado y lo
 * confirma contra la base de datos (uid + email).
 */
export function compactTokenPermissions<T>(payload: T): T {
  const data = payload as TokenPermissionsPayload | null | undefined;
  if (!data || !Array.isArray(data.permissions) || data.permissions.length === 0) {
    return payload;
  }

  let changed = false;
  const permissions = data.permissions.map((project) => {
    if (project?.is_super_admin !== true || !("views_permissions" in project)) {
      return project;
    }
    changed = true;
    const compact: TokenPermissionEntry = { ...project };
    delete compact.views_permissions;
    return compact;
  });

  return changed ? ({ ...data, permissions } as T) : payload;
}
