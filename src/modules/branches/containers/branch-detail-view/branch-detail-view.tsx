"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Alert } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import type { IBranchUser } from "@/types/branches/IBranches";

import AddUsersModal from "../../components/add-users-modal/add-users-modal";
import BranchInfoCard from "../../components/branch-info-card/branch-info-card";
import BranchUsersCard from "../../components/branch-users-card/branch-users-card";
import RemoveUserModal from "../../components/remove-user-modal/remove-user-modal";
import { BRANCHES_PATH } from "../../constants";
import { useBranchDetail } from "../../hooks/use-branch-detail";

/**
 * Detalle de una sucursal (/branches/[branchId]): su información y los ejecutivos
 * registrados. "Agregar Nuevo Usuario" los asigna (POST AddUsers) y la basura de cada
 * usuario lo desvincula (PUT RemoveUsers), ambos tras confirmar Sí / No.
 */
export default function BranchDetailView({ branchId }: { branchId: string }) {
  const { detail, error, isLoading, addUsers, removeUser } = useBranchDetail(branchId);
  const { showMessage } = useMessageApi();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<IBranchUser | null>(null);

  const closeAdd = useCallback(() => setAdding(false), []);
  const closeRemove = useCallback(() => setRemoving(null), []);

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

  const { branch, users } = detail;

  const handleAdd = async (picked: IBranchUser[]) => {
    try {
      const result = await addUsers(picked);
      setAdding(false);
      // Nombre de la sucursal física, sin el sufijo (I)/(R) de cada registro.
      const branchName = branch.name || result.NombreSucursal;
      const names = (list: { NombreUsuario: string }[]) =>
        list.map((u) => u.NombreUsuario).join(", ");

      if (result.added.length) {
        showMessage(
          "success",
          result.added.length === 1
            ? `Se agregó exitosamente a ${names(result.added)} a la sucursal ${branchName}`
            : `Se agregaron exitosamente ${names(result.added)} a la sucursal ${branchName}`
        );
      }
      if (result.alreadyAssigned.length) {
        showMessage(
          "info",
          `${names(result.alreadyAssigned)} ya estaba${result.alreadyAssigned.length > 1 ? "n" : ""} en la sucursal ${branchName}`
        );
      }
      if (result.notFound.length) {
        showMessage("warning", `${result.notFound.length} usuario(s) no se encontraron`);
      }
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error && err.message
          ? err.message
          : "No se pudo agregar a la sucursal. Intenta de nuevo."
      );
      throw err;
    }
  };

  const handleRemove = async (user: IBranchUser) => {
    try {
      const result = await removeUser(user);
      setRemoving(null);
      if (result.removed.length) {
        showMessage("success", `Se eliminó a ${user.name} de la sucursal ${branch.name}`);
      } else {
        showMessage("info", `${user.name} ya no estaba en la sucursal ${branch.name}`);
      }
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error && err.message
          ? err.message
          : "No se pudo eliminar el usuario de la sucursal. Intenta de nuevo."
      );
      throw err;
    }
  };

  return (
    <div className="cp-page">
      <BranchInfoCard branch={branch} />
      <BranchUsersCard users={users} onAdd={() => setAdding(true)} onRemove={setRemoving} />

      {adding && (
        <AddUsersModal
          subtitle={`${branch.client_name} · ${branch.name}`}
          branchName={branch.name}
          assigned={users}
          onClose={closeAdd}
          onAdd={handleAdd}
        />
      )}

      {removing && (
        <RemoveUserModal
          user={removing}
          branchName={branch.name}
          onClose={closeRemove}
          onConfirm={() => handleRemove(removing)}
        />
      )}
    </div>
  );
}
