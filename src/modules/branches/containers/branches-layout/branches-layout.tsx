"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";

import BranchesHeaderActions from "../../components/branches-header-actions/branches-header-actions";
import { BRANCHES_PATH } from "../../constants";
import { useBranchDetail } from "../../hooks/use-branch-detail";
import { useBranchesPage } from "../../hooks/use-branches";
import { useBranchesStore } from "../../stores/branches-store";
import { fmtUpdatedAt } from "../../utils/branches";

const LIST_TITLE = "Sucursales de Devolución";
/** Sucursales se abre desde Administración (Configuración). */
const MARKET_ADMIN_PATH = "/market-admin";

/** Junto al título del listado: cuándo se consultaron los datos. */
function UpdatedAt() {
  const { fetchedAt } = useBranchesPage();
  if (!fetchedAt) return null;
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-full bg-cp-lime-dark" />
      Actualizado {fmtUpdatedAt(fetchedAt)}
    </span>
  );
}

/** Marco del listado: "‹" a Administración, header compartido con el buscador y el avatar. */
function ListLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewWrapper
      headerTitle={LIST_TITLE}
      headerTitleExtra={<UpdatedAt />}
      headerActions={<BranchesHeaderActions />}
      headerBack={MARKET_ADMIN_PATH}
    >
      {children}
    </ViewWrapper>
  );
}

/** Marco del detalle: "‹" al listado, el nombre de la sucursal y, al lado, su cliente y NIT. */
function DetailLayout({ branchId, children }: { branchId: string; children: React.ReactNode }) {
  const { detail } = useBranchDetail(branchId);
  const branch = detail?.branch;

  return (
    <ViewWrapper
      headerTitle={branch?.name ?? "Sucursal"}
      headerTitleExtra={
        branch && (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-cp-ink">{branch.client_name}</span>
            {branch.client_nit && (
              <>
                <span aria-hidden="true" className="text-cp-line-2">
                  |
                </span>
                <span className="shrink-0">NIT {branch.client_nit}</span>
              </>
            )}
          </span>
        )
      }
      headerBack={BRANCHES_PATH}
    >
      {children}
    </ViewWrapper>
  );
}

/** Marco de /branches: el listado y el detalle de cada sucursal comparten menú y header. */
export default function BranchesLayout({ children }: { children: React.ReactNode }) {
  const { branchId } = useParams<{ branchId?: string }>() ?? {};
  const reset = useBranchesStore((s) => s.reset);

  // Este marco sigue montado entre el listado y el detalle, y se desmonta al salir de
  // /branches: al volver, la tabla arranca en la página 1, sin búsqueda ni filtros.
  useEffect(() => reset, [reset]);

  return branchId ? (
    <DetailLayout branchId={branchId}>{children}</DetailLayout>
  ) : (
    <ListLayout>{children}</ListLayout>
  );
}
