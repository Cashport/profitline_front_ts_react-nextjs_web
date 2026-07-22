"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, MoreHorizontal, RefreshCw, ShieldCheck } from "lucide-react";

import { useMedicalAccountDetail } from "../../hooks/useMedicalAccountDetail";
import { MedicalAccountStatusTag } from "../../components/MedicalAccountStatusTag/MedicalAccountStatusTag";
import { MedicalAccountInfoPanel } from "../../components/MedicalAccountInfoPanel/MedicalAccountInfoPanel";
import { MedicalAccountNovedades } from "../../components/MedicalAccountNovedades/MedicalAccountNovedades";
import { MedicalAccountDocuments } from "../../components/MedicalAccountDocuments/MedicalAccountDocuments";
import { MedicalAccountFacturas } from "../../components/MedicalAccountFacturas/MedicalAccountFacturas";
import { ModalChangeStatus } from "../../components/ModalChangeStatus/ModalChangeStatus";
import { ModalUploadInvoice } from "../../components/ModalUploadInvoice/ModalUploadInvoice";
import { auditMedicalAccount } from "@/services/medicalAccounts/medicalAccounts";
import { useMessageApi } from "@/context/MessageContext";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";

interface MedicalAccountDetailViewProps {
  accountId: string;
}

// TODO: re-enable edit mode when a PUT /medical-accounts/:id endpoint exists.
// The API response (IMedicalAccountUploadData) has no editable persistence and no
// `regimen`, so the detail is read-only for now. Restore alongside the block below.
// const EMPTY_FORM: IMedicalAccountEditForm = {
//   idAutorizacion: "", tipoDocumento: "", documentoPaciente: "", nombrePaciente: "",
//   regimen: "", tipoServicio: "", fechaServicio: ""
// };
// const buildForm = (account: IMedicalAccountUploadData): IMedicalAccountEditForm => ({
//   idAutorizacion: account.authorization_number ?? "",
//   tipoDocumento: account.document_type ?? "",
//   documentoPaciente: account.document_number ?? "",
//   nombrePaciente: account.patient_name ?? "",
//   regimen: "",
//   tipoServicio: account.service_type ?? "",
//   fechaServicio: account.service_date ?? ""
// });

const barButton =
  "inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800";

export function MedicalAccountDetailView({ accountId }: MedicalAccountDetailViewProps) {
  const router = useRouter();
  const { account, isLoading, error, mutate } = useMedicalAccountDetail(accountId);
  const { showMessage } = useMessageApi();

  const [isAuditing, setIsAuditing] = useState(false);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cuentas-medicas");
  };

  const handleAudit = useCallback(async () => {
    if (!account) return;
    setIsAuditing(true);
    try {
      const response = await auditMedicalAccount(account.id);
      showMessage("success", "Cuenta médica auditada correctamente.");
      mutate({ ...response, success: true } as any);
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al auditar la cuenta."
      );
    } finally {
      setIsAuditing(false);
    }
  }, [account, mutate, showMessage]);

  const handleDetailUpdate = useCallback(
    (updated: IMedicalAccountUploadData) => {
      mutate(
        (prev) =>
          prev
            ? { ...prev, data: updated }
            : { status: 200, message: "", data: updated },
        false
      );
    },
    [mutate]
  );

  const renderMessage = (message: string) => (
    <main>
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <button type="button" onClick={handleGoBack} className={barButton}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </main>
  );

  if (isLoading && !account) return renderMessage("Cargando cuenta médica…");
  if (error) return renderMessage("No se pudo cargar la cuenta médica.");
  if (!account) return renderMessage("Cuenta médica no encontrada.");

  return (
    <main>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Top action bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleGoBack} className={barButton}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>

            {account.status_code === "PENDIENTE_AUDITORIA" && (
              <button
                type="button"
                onClick={handleAudit}
                disabled={isAuditing}
                className="inline-flex items-center gap-1.5 rounded-md bg-cashport-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {isAuditing ? "Auditando…" : "Auditar"}
              </button>
            )}

            {account.status_code === "AUDITADO" && (
              <button
                type="button"
                onClick={() => setShowUploadInvoice(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-cashport-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                <FileUp className="h-3.5 w-3.5" />
                Subir factura
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowChangeStatus(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Cambiar estado
            </button>

            <button type="button" className={barButton}>
              <MoreHorizontal className="h-3.5 w-3.5" />
              Generar acción
            </button>
          </div>
          <MedicalAccountStatusTag status={account.status_name} />
        </div>

        {/* Patient + authorization info (read-only) */}
        <div className="border-b border-gray-100">
          <MedicalAccountInfoPanel account={account} />
        </div>

        {/* Novedades (only when present) */}
        {account.novedades.length > 0 && <MedicalAccountNovedades novedades={account.novedades} />}

        {/* Facturas */}
        {account.facturas && account.facturas.length > 0 && (
          <MedicalAccountFacturas facturas={account.facturas} />
        )}

        {/* Classified documents + PDF preview */}
        <MedicalAccountDocuments documents={account.documentos} novedades={account.novedades} />
      </div>

      <ModalChangeStatus
        isOpen={showChangeStatus}
        accountId={account.id}
        onClose={() => setShowChangeStatus(false)}
        onSuccess={handleDetailUpdate}
      />

      <ModalUploadInvoice
        isOpen={showUploadInvoice}
        accountId={account.id}
        onClose={() => setShowUploadInvoice(false)}
        onSuccess={handleDetailUpdate}
      />
    </main>
  );
}
