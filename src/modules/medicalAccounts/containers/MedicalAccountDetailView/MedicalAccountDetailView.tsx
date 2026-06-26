"use client";

// import { useState } from "react"; // TODO: edit mode — restore with the block below.
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
// import { Check, Pencil, X } from "lucide-react"; // TODO: edit mode — restore with the block below.

import { useMedicalAccountDetail } from "../../hooks/useMedicalAccountDetail";
import { MedicalAccountStatusTag } from "../../components/MedicalAccountStatusTag/MedicalAccountStatusTag";
import { MedicalAccountInfoPanel } from "../../components/MedicalAccountInfoPanel/MedicalAccountInfoPanel";
import { MedicalAccountNovedades } from "../../components/MedicalAccountNovedades/MedicalAccountNovedades";
import { MedicalAccountDocuments } from "../../components/MedicalAccountDocuments/MedicalAccountDocuments";

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
  const { account, isLoading, error } = useMedicalAccountDetail(accountId);

  // TODO: re-enable edit mode when a PUT /medical-accounts/:id endpoint exists.
  // const [editing, setEditing] = useState(false);
  // const [form, setForm] = useState<IMedicalAccountEditForm>(EMPTY_FORM);
  // const startEdit = () => { setForm(buildForm(account)); setEditing(true); };
  // const cancelEdit = () => setEditing(false);
  // const saveEdit = () => setEditing(false); // no persistence yet
  // const handleFormChange = (patch: Partial<IMedicalAccountEditForm>) =>
  //   setForm((prev) => ({ ...prev, ...patch }));

  const handleGoBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cuentas-medicas");
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
            {/* TODO: re-enable edit mode when a PUT /medical-accounts/:id endpoint exists.
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
            )} */}
          </div>
          <MedicalAccountStatusTag status={account.status_name} />
        </div>

        {/* Patient + authorization info (read-only) */}
        <div className="border-b border-gray-100">
          <MedicalAccountInfoPanel account={account} />
        </div>

        {/* Novedades (only when present) */}
        {account.novedades.length > 0 && <MedicalAccountNovedades novedades={account.novedades} />}

        {/* Classified documents + PDF preview */}
        <MedicalAccountDocuments documents={account.documentos} novedades={account.novedades} />
      </div>
    </main>
  );
}
