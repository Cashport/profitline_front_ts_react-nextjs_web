"use client";
import { usePathname } from "next/navigation";
import { useQueryClient } from "react-query";
import { Button } from "antd";

import { useAppStore } from "@/lib/store/store";
import { usePortfolioClientsRefresh } from "@/hooks/usePortfolioClientsRefresh";

import styles from "./PortfolioClientsCutoff.module.scss";

const formatCutoffDate = (date: string) =>
  new Date(date).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

// Solo aplica a la tabla de cartera; el layout de clientes también envuelve el detalle.
export const PortfolioClientsCutoff = () => {
  const pathname = usePathname();
  if (pathname !== "/clientes/all") return null;
  return <PortfolioClientsCutoffContent />;
};

const PortfolioClientsCutoffContent = () => {
  const { isSuperAdmin, rol_id } = useAppStore((state) => state.selectedProject);
  const queryClient = useQueryClient();

  // Mismo criterio que el backend (`isAdminORSuperAdmin`): super admin o rol 2 en el proyecto.
  const canRefresh = Boolean(isSuperAdmin) || rol_id === 2;
  const { refresh, refreshing, lastUpdatedAt } = usePortfolioClientsRefresh(canRefresh, () => {
    queryClient.invalidateQueries("portfolios");
  });

  if (!canRefresh) return null;

  return (
    <div className={styles.cutoff}>
      <span className={`${styles.dot} ${refreshing ? styles.dotRefreshing : ""}`} />
      <span className={styles.label}>
        {refreshing
          ? "Actualizando…"
          : lastUpdatedAt
            ? `Corte ${formatCutoffDate(lastUpdatedAt)}`
            : "Sin corte"}
      </span>
      <Button size="small" className={styles.button} loading={refreshing} onClick={refresh}>
        Actualizar ahora
      </Button>
    </div>
  );
};
