import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/store";
import {
  isCurrentRoutePermitted,
  getFirstPermittedRoute
} from "@/utils/permissions/routePermissions";

const IGNORED_PREFIXES = ["/auth", "/mobile", "/proyectos/review"];

export const usePermissionRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isRedirecting = useRef(false);

  const selectedProject = useAppStore((state) => state.selectedProject);
  const isHy = useAppStore((state) => state.isHy);

  useEffect(() => {
    if (!isHy || !selectedProject?.ID) return;

    const isIgnoredRoute = IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isIgnoredRoute) return;

    if (isRedirecting.current) {
      isRedirecting.current = false;
      return;
    }

    // Si estamos en /land y hay proyecto con permisos, redirigir al primer view permitido
    if (pathname === "/land" && selectedProject?.views_permissions?.length) {
      const firstRoute = getFirstPermittedRoute(selectedProject);
      if (firstRoute !== "/land") {
        isRedirecting.current = true;
        router.replace(firstRoute);
        return;
      }
    }

    if (!isCurrentRoutePermitted(selectedProject, pathname)) {
      isRedirecting.current = true;
      const firstRoute = getFirstPermittedRoute(selectedProject);
      router.replace(firstRoute);
    }
  }, [isHy, selectedProject, pathname]);
};
