"use client";

import Link from "next/link";
import { Alert } from "antd";

import BranchInfoCard from "../../components/branch-info-card/branch-info-card";
import BranchUsersCard from "../../components/branch-users-card/branch-users-card";
import { BRANCHES_PATH } from "../../constants";
import { useBranchDetail } from "../../hooks/use-branch-detail";

/**
 * Detalle de una sucursal (/branches/[branchId]): su información y los ejecutivos
 * registrados en ella, ambos de solo lectura por ahora.
 */
export default function BranchDetailView({ branchId }: { branchId: string }) {
  const { detail, error, isLoading } = useBranchDetail(branchId);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="No se pudo cargar la sucursal"
        description={error.message}
      />
    );
  }

  if (isLoading || detail === undefined) return null;

  if (!detail) {
    return (
      <div className="cp-card py-16 text-center">
        <p className="m-0 text-[13.5px] font-semibold text-cp-ink">No encontramos esta sucursal</p>
        <Link href={BRANCHES_PATH} className="mt-2 inline-block text-[13px]">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <BranchInfoCard branch={detail.branch} />
      <BranchUsersCard users={detail.users} />
    </div>
  );
}
