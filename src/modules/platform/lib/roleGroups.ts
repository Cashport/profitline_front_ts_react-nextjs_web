import { IProjectRole } from "@/types/roles/IProjectRoles";

export const ROLE_GROUPS = [
  "Cashport",
  "Data",
  "Órdenes de compra",
  "Marketplace y externos",
  "TMS"
] as const;

export type RoleGroup = (typeof ROLE_GROUPS)[number];

export const getRoleGroup = (rolName: string): RoleGroup => {
  const name = rolName.toLowerCase();
  if (name.startsWith("tms-")) return "TMS";
  if (name.startsWith("oc ")) return "Órdenes de compra";
  if (name.includes("data")) return "Data";
  if (name.includes("marketplace") || name.includes("external")) return "Marketplace y externos";
  return "Cashport";
};

export const groupRoles = (roles: IProjectRole[]) =>
  ROLE_GROUPS.map((group) => ({
    group,
    roles: roles.filter((role) => getRoleGroup(role.rol_name) === group)
  })).filter(({ roles }) => roles.length > 0);
