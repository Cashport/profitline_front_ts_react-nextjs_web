"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Popconfirm } from "antd";
import {
  ArrowLeft,
  Check,
  FileCheck2,
  FileUp,
  Pencil,
  Send,
  ShieldCheck,
  Trash,
  X
} from "lucide-react";

import { useMedicalAccountDetail } from "../../hooks/useMedicalAccountDetail";
import { MedicalAccountStatusTag } from "../../components/MedicalAccountStatusTag/MedicalAccountStatusTag";
import { MedicalAccountInfoPanel } from "../../components/MedicalAccountInfoPanel/MedicalAccountInfoPanel";
import { MedicalAccountNovedades } from "../../components/MedicalAccountNovedades/MedicalAccountNovedades";
import { MedicalAccountDocuments } from "../../components/MedicalAccountDocuments/MedicalAccountDocuments";
import { MedicalAccountFacturas } from "../../components/MedicalAccountFacturas/MedicalAccountFacturas";
import { MedicalAccountTimeline } from "../../components/MedicalAccountTimeline/MedicalAccountTimeline";
import { ModalRadiateMedicalAccount } from "../../components/ModalRadiateMedicalAccount/ModalRadiateMedicalAccount";
import { ModalUploadInvoice } from "../../components/ModalUploadInvoice/ModalUploadInvoice";
import {
  auditMedicalAccount,
  changeMedicalAccountStatus,
  deleteMedicalAccount,
  updateMedicalAccount
} from "@/services/medicalAccounts/medicalAccounts";
import { useMessageApi } from "@/context/MessageContext";
import {
  IMedicalAccountUpdatePayload,
  IMedicalAccountUploadData
} from "@/types/medicalAccounts/IMedicalAccounts";
import { IMedicalAccountEditForm } from "../../types/IMedicalAccount";

interface MedicalAccountDetailViewProps {
  accountId: string;
}

type TransitionAction =
  | { type: "SEND_TO_AUDIT" }
  | { type: "AUDIT" }
  | { type: "INVOICE" }
  | { type: "RADICATE" }
  | null;

const getAction = (statusCode: string): TransitionAction => {
  switch (statusCode) {
    case "CARGUE":
    case "NOVEDAD":
      return { type: "SEND_TO_AUDIT" };
    case "PENDIENTE_AUDITORIA":
      return { type: "AUDIT" };
    case "AUDITADO":
      return { type: "INVOICE" };
    case "FACTURADO":
      return { type: "RADICATE" };
    default:
      return null;
  }
};

const EMPTY_FORM: IMedicalAccountEditForm = {
  idAutorizacion: "",
  tipoDocumento: "",
  documentoPaciente: "",
  nombrePaciente: "",
  regimen: "",
  tipoServicio: "",
  fechaServicio: "",
  eps: ""
};

const buildForm = (account: IMedicalAccountUploadData): IMedicalAccountEditForm => ({
  idAutorizacion: account.authorization_number ?? "",
  tipoDocumento: account.document_type ?? "",
  documentoPaciente: account.document_number ?? "",
  nombrePaciente: account.patient_name ?? "",
  regimen: (account.regimen as IMedicalAccountEditForm["regimen"]) ?? "",
  tipoServicio: account.service_type ?? "",
  fechaServicio: account.service_date ?? "",
  eps: account.eps ?? ""
});

const barButton =
  "inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800";

const primaryButton =
  "inline-flex items-center gap-1.5 rounded-md bg-cashport-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50";

export function MedicalAccountDetailView({ accountId }: MedicalAccountDetailViewProps) {
  const router = useRouter();
  const { account, isLoading, error, mutate } = useMedicalAccountDetail(accountId);
  const { showMessage } = useMessageApi();

  const [isBusy, setIsBusy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showRadiate, setShowRadiate] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<IMedicalAccountEditForm>(EMPTY_FORM);

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cuentas-medicas");
  };

  const handleDelete = useCallback(async () => {
    if (!account) return;
    setIsDeleting(true);
    try {
      await deleteMedicalAccount(account.id);
      showMessage("success", "Cuenta médica eliminada correctamente.");
      router.push("/cuentas-medicas");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al eliminar la cuenta."
      );
      setIsDeleting(false);
    }
  }, [account, router, showMessage]);

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

  const handleSendToAudit = useCallback(async () => {
    if (!account) return;
    setIsBusy(true);
    try {
      const response = await changeMedicalAccountStatus(account.id, "PENDIENTE_AUDITORIA");
      showMessage("success", "Cuenta enviada a pendiente por auditar.");
      handleDetailUpdate(response.data);
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al enviar a auditar."
      );
    } finally {
      setIsBusy(false);
    }
  }, [account, handleDetailUpdate, showMessage]);

  const handleAudit = useCallback(async () => {
    if (!account) return;
    setIsBusy(true);
    try {
      const response = await auditMedicalAccount(account.id);
      showMessage("success", "Cuenta médica auditada correctamente.");
      handleDetailUpdate(response.data);
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al auditar la cuenta."
      );
    } finally {
      setIsBusy(false);
    }
  }, [account, handleDetailUpdate, showMessage]);

  const handleStartEdit = () => {
    if (!account) return;
    setForm(buildForm(account));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm(EMPTY_FORM);
  };

  const handleSaveEdit = async () => {
    if (!account) return;

    const payload: IMedicalAccountUpdatePayload = {
      patient_name: form.nombrePaciente,
      document_type: form.tipoDocumento,
      document_number: form.documentoPaciente,
      authorization_number: form.idAutorizacion,
      service_type: form.tipoServicio,
      service_date: form.fechaServicio,
      regimen: form.regimen || undefined,
      eps: form.eps
    };

    setIsSaving(true);
    try {
      const response = await updateMedicalAccount(account.id, payload);
      showMessage("success", "Cuenta médica actualizada correctamente.");
      handleDetailUpdate(response.data);
      setIsEditing(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al actualizar la cuenta."
      );
    } finally {
      setIsSaving(false);
    }
  };

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

  const action = getAction(account.status_code);

  const renderActionButton = () => {
    switch (action?.type) {
      case "SEND_TO_AUDIT":
        return (
          <button type="button" onClick={handleSendToAudit} disabled={isBusy} className={primaryButton}>
            <Send className="h-3.5 w-3.5" />
            {isBusy ? "Enviando…" : "Enviar a pendiente auditar"}
          </button>
        );
      case "AUDIT":
        return (
          <button type="button" onClick={handleAudit} disabled={isBusy} className={primaryButton}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {isBusy ? "Auditando…" : "Auditar"}
          </button>
        );
      case "INVOICE":
        return (
          <button
            type="button"
            onClick={() => setShowUploadInvoice(true)}
            className={primaryButton}
          >
            <FileUp className="h-3.5 w-3.5" />
            Facturar
          </button>
        );
      case "RADICATE":
        return (
          <button type="button" onClick={() => setShowRadiate(true)} className={primaryButton}>
            <FileCheck2 className="h-3.5 w-3.5" />
            Radicar
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <main>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Top action bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleGoBack} className={barButton}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>

            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className={primaryButton}
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? "Guardando…" : "Guardar"}
                </button>
                <button type="button" onClick={handleCancelEdit} disabled={isSaving} className={barButton}>
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {renderActionButton()}

                <button type="button" onClick={handleStartEdit} className={barButton}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>

                <Popconfirm
                  title="Eliminar cuenta médica"
                  description="¿Seguro que deseas eliminar esta cuenta médica?"
                  okText="Eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleDelete}
                >
                  <button
                    type="button"
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    {isDeleting ? "Eliminando…" : "Eliminar"}
                  </button>
                </Popconfirm>
              </>
            )}
          </div>
          <MedicalAccountStatusTag
            statusCode={account.status_code}
            statusName={account.status_name}
          />
        </div>

        {/* Patient + authorization info */}
        <div className="border-b border-gray-100">
          <MedicalAccountInfoPanel
            account={account}
            editing={isEditing}
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />
        </div>

        {/* Novedades (only when present) */}
        {account.novedades.length > 0 && (
          <MedicalAccountNovedades
            novedades={account.novedades}
            accountId={account.id}
            onResolved={() => mutate()}
          />
        )}

        {/* Facturas */}
        {account.facturas && account.facturas.length > 0 && (
          <MedicalAccountFacturas facturas={account.facturas} />
        )}

        {/* Status tracking timeline */}
        <div className="border-b border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
            <span className="text-xs font-semibold text-gray-600">Historial</span>
          </div>
          <MedicalAccountTimeline
            accountId={account.id}
            currentStatusCode={account.status_code}
          />
        </div>

        {/* Classified documents + PDF preview */}
        <MedicalAccountDocuments
          documents={account.documentos}
          novedades={account.novedades}
          accountId={account.id}
          onChanged={() => mutate()}
        />
      </div>

      <ModalUploadInvoice
        isOpen={showUploadInvoice}
        accountId={account.id}
        onClose={() => setShowUploadInvoice(false)}
        onSuccess={handleDetailUpdate}
      />

      <ModalRadiateMedicalAccount
        isOpen={showRadiate}
        accountId={account.id}
        onClose={() => setShowRadiate(false)}
        onSuccess={handleDetailUpdate}
      />
    </main>
  );
}
