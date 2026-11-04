import { ISelectedProject } from "@/lib/slices/createProjectSlice";
import { checkUserViewPermissions } from "@/utils/utils";

export const PERMISSION_ROUTE_MAP: Record<string, string> = {
  Dashboard: "/dashboard",
  Clientes: "/clients/all",
  Descuentos: "/discounts",
  Notificaciones: "/notifications",
  Marketplace: "/commerce",
  Bancos: "/banks",
  Configuracion: "/settings",
  Proveedores: "/suppliers",
  AdministracionClientes: "/client-management",
  Whatsapp: "/chat",
  Aprobaciones: "/approvals",
  GestorTareas: "/task-manager",
  PurchaseOrders: "/purchase-orders",
  DataQuality: "/data-quality",
  MedicalAccounts: "/medical-accounts",
  Visits: "/visits",
  Reports: "/reports",
  BlockingAlerts: "/blocking-alerts"
};

const ROUTE_PREFIX_TO_PERMISSION: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/discounts": "Descuentos",
  "/notifications": "Notificaciones",
  "/commerce": "Marketplace",
  "/banks": "Bancos",
  "/settings": "Configuracion",
  "/suppliers": "Proveedores",
  "/client-management": "AdministracionClientes",
  "/chat": "Whatsapp",
  "/approvals": "Aprobaciones",
  "/task-manager": "GestorTareas",
  "/purchase-orders": "PurchaseOrders",
  "/data-quality": "DataQuality",
  "/medical-accounts": "MedicalAccounts",
  "/visits": "Visits",
  "/reports": "Reports",
  "/blocking-alerts": "BlockingAlerts"
};

export const getFirstPermittedRoute = (selectedProject: ISelectedProject | undefined): string => {
  const FALLBACK_ROUTE = "/land";

  if (!selectedProject) return FALLBACK_ROUTE;
  if (selectedProject.isSuperAdmin) return "/clients/all";

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
