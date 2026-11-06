import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { getSupportConfig, getSupportFormConfig } from "@/services/support/support";

const quiet = { shouldRetryOnError: false, revalidateOnFocus: false };

export const useProjectId = () => useAppStore((s) => s.selectedProject?.ID) as number | undefined;

/** Configurar soporte depende del rol (endpoint de administradores): se prueba y se oculta si falla. */
export function useCanConfigureSupport() {
  const projectId = useProjectId();
  const { data } = useSWR(
    projectId ? ["support-access-config", projectId] : null,
    getSupportConfig,
    quiet
  );
  return !!data;
}

/** Banderas del usuario en el proyecto: si resuelve tickets y si entra al Support Desk. */
export function useSupportFlags() {
  const projectId = useProjectId();
  const { data } = useSWR(projectId ? ["support-form", projectId] : null, getSupportFormConfig, quiet);
  return { canAttend: !!data?.can_attend, canUseDesk: !!data?.can_use_desk, loaded: !!data };
}
