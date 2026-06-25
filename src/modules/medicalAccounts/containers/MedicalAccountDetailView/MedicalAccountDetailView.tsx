"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, MoreHorizontal, Pencil, X } from "lucide-react";

import { medicalAccountsMock } from "../../mocks/medicalAccountsMock";
import { IMedicalAccount, IMedicalAccountEditForm } from "../../types/IMedicalAccount";
import { MedicalAccountStatusTag } from "../../components/MedicalAccountStatusTag/MedicalAccountStatusTag";
import { MedicalAccountInfoPanel } from "../../components/MedicalAccountInfoPanel/MedicalAccountInfoPanel";
import { MedicalAccountNovedades } from "../../components/MedicalAccountNovedades/MedicalAccountNovedades";
import { MedicalAccountDocuments } from "../../components/MedicalAccountDocuments/MedicalAccountDocuments";

interface MedicalAccountDetailViewProps {
  accountId: string;
}

const EMPTY_FORM: IMedicalAccountEditForm = {
  idAutorizacion: "",
  tipoDocumento: "",
  documentoPaciente: "",
  nombrePaciente: "",
  regimen: "",
  tipoServicio: "",
  fechaServicio: ""
};

const buildForm = (account: IMedicalAccount): IMedicalAccountEditForm => ({
  idAutorizacion: account.idAutorizacion ?? "",
  tipoDocumento: account.tipoDocumento ?? "",
  documentoPaciente: account.documentoPaciente ?? "",
  nombrePaciente: account.nombrePaciente ?? "",
  regimen: account.regimen ?? "",
  tipoServicio: account.tipoServicio ?? "",
  fechaServicio: account.fechaServicio ?? ""
});

const barButton =
  "inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800";

export function MedicalAccountDetailView({ accountId }: MedicalAccountDetailViewProps) {
  const router = useRouter();
  const account = medicalAccountsMock.find((item) => item.id === accountId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<IMedicalAccountEditForm>(() =>
    account ? buildForm(account) : EMPTY_FORM
  );

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cuentas-medicas");
  };

  if (!account) {
    return (
      <main>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <button type="button" onClick={handleGoBack} className={barButton}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </button>
          <p className="mt-4 text-gray-600">Cuenta médica no encontrada.</p>
        </div>
      </main>
    );
  }

  const startEdit = () => {
    setForm(buildForm(account));
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => setEditing(false); // mock — no persistence (module mock is a const)

  const handleFormChange = (patch: Partial<IMedicalAccountEditForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

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
            <button type="button" className={barButton}>
              <MoreHorizontal className="h-3.5 w-3.5" />
              Generar acción
            </button>
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="inline-flex items-center gap-1.5 rounded-md bg-cashport-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  Guardar
                </button>
                <button type="button" onClick={cancelEdit} className={barButton}>
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              </>
            )}
          </div>
          <MedicalAccountStatusTag status={account.estado} />
        </div>

        {/* Patient + authorization info */}
        <div className="border-b border-gray-100">
          <MedicalAccountInfoPanel
            account={account}
            editing={editing}
            form={form}
            onChange={handleFormChange}
          />
        </div>

        {/* Novedades (only when present) */}
        {account.novedades && account.novedades.length > 0 && (
          <MedicalAccountNovedades novedades={account.novedades} />
        )}

        {/* Classified documents + PDF preview */}
        <MedicalAccountDocuments documents={account.documents ?? []} />
      </div>
    </main>
  );
}
