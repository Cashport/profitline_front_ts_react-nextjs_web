import { IProjectRole } from "@/types/roles/IProjectRoles";

/** Códigos de grupo; la etiqueta visible sale de `platform.groups.<código>`. */
export const ROLE_GROUPS = ["cashport", "data", "purchaseOrders", "marketplace", "tms"] as const;

export type RoleGroup = (typeof ROLE_GROUPS)[number];

export const getRoleGroup = (rolName: string): RoleGroup => {
  const name = rolName.toLowerCase();
  if (name.startsWith("tms-")) return "tms";
  if (name.startsWith("oc ")) return "purchaseOrders";
  if (name.includes("data")) return "data";
  if (name.includes("marketplace") || name.includes("external")) return "marketplace";
  return "cashport";
};

export const groupRoles = (roles: IProjectRole[]) =>
  ROLE_GROUPS.map((group) => ({
    group,
    roles: roles.filter((role) => getRoleGroup(role.rol_name) === group)
  })).filter(({ roles }) => roles.length > 0);
