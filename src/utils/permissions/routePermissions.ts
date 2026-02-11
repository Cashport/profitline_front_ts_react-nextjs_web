import { ISelectedProject } from "@/lib/slices/createProjectSlice";
import { checkUserViewPermissions } from "@/utils/utils";

export const PERMISSION_ROUTE_MAP: Record<string, string> = {
  Dashboard: "/dashboard",
  Clientes: "/clientes/all",
  Descuentos: "/descuentos",
  Notificaciones: "/notificaciones",
  Marketplace: "/comercio",
  Bancos: "/banco",
  Configuracion: "/settings",
  Proveedores: "/proveedores",
  AdministracionClientes: "/client-management",
  Whatsapp: "/chat",
  Aprobaciones: "/aprobaciones",
  GestorTareas: "/task-manager",
  PurchaseOrders: "/purchase-orders",
  DataQuality: "/data-quality"
};

const ROUTE_PREFIX_TO_PERMISSION: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/descuentos": "Descuentos",
  "/notificaciones": "Notificaciones",
  "/comercio": "Marketplace",
  "/banco": "Bancos",
  "/settings": "Configuracion",
  "/proveedores": "Proveedores",
  "/client-management": "AdministracionClientes",
  "/chat": "Whatsapp",
  "/aprobaciones": "Aprobaciones",
  "/task-manager": "GestorTareas",
  "/purchase-orders": "PurchaseOrders",
  "/data-quality": "DataQuality"
};

export const getFirstPermittedRoute = (selectedProject: ISelectedProject | undefined): string => {
  const FALLBACK_ROUTE = "/land";

  if (!selectedProject) return FALLBACK_ROUTE;
  if (selectedProject.isSuperAdmin) return "/clientes/all";

  const viewPermissions = selectedProject.views_permissions;
  if (!viewPermissions?.length) return FALLBACK_ROUTE;

  for (const permission of viewPermissions) {
    const route = PERMISSION_ROUTE_MAP[permission.page_name];
    if (route) return route;
  }

  return FALLBACK_ROUTE;
};

export const isCurrentRoutePermitted = (
  selectedProject: ISelectedProject | undefined,
  pathname: string
): boolean => {
  if (!selectedProject) return false;

  const permissionName = Object.entries(ROUTE_PREFIX_TO_PERMISSION).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  // Route not in map (e.g. /proyectos/review, /applyModule) → no permission required
  if (!permissionName) return true;

  return checkUserViewPermissions(selectedProject, permissionName);
};
