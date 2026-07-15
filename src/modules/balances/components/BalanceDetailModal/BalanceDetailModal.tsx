"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Select } from "antd";
import { Badge } from "@/modules/chat/ui/badge";
import { CaretDoubleRight, Paperclip, Pencil } from "phosphor-react";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import {
  getEligibilityStatuses,
  updateBalance,
  UpdateBalancePayload,
  EligibilityStatusOption
} from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";
import { BalanceTableContext } from "../BalanceRowActions/BalanceRowActions";

interface BalanceDetailModalProps {
  saldoData: IBalanceRow;
  onBack: () => void;
  isModal?: boolean;
  context?: BalanceTableContext;
  onUpdated?: () => void | Promise<unknown>;
}

interface BalanceEditForm {
  motive_id: number | null;
  file: File | null;
  audit_observation: string;
  client_documents: { id: number; document: string }[];
  eligibility_status: string | null;
}

const getDefaultValues = (saldoData: IBalanceRow): BalanceEditForm => ({
  motive_id: saldoData.motive_id,
  file: null,
  audit_observation: saldoData.audit_observation ?? "",
  client_documents:
    saldoData.client_documents?.map((doc) => ({ id: doc.id, document: doc.document })) ?? [],
  eligibility_status: saldoData.eligibility_status ? String(saldoData.eligibility_status.id) : null
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function BalanceDetailModal({
  saldoData,
  onBack,
  isModal = false,
  onUpdated
}: BalanceDetailModalProps) {
  const { showMessage } = useMessageApi();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { dirtyFields }
  } = useForm<BalanceEditForm>({
    defaultValues: getDefaultValues(saldoData)
  });

  const editFile = watch("file");

  const { data: motives, isLoading: motivesLoading } = useFinancialDiscountMotives();

  const [eligibilityStatuses, setEligibilityStatuses] = useState<EligibilityStatusOption[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setEligibilityStatuses(await getEligibilityStatuses());
      } catch (error) {
        console.error("Error fetching eligibility statuses", error);
      }
    })();
  }, []);

  useEffect(() => {
    reset(getDefaultValues(saldoData));
    setIsEditing(false);
  }, [saldoData, reset]);

  const handleToggleEdit = () => {
    if (isEditing) {
      reset(getDefaultValues(saldoData));
    }
    setIsEditing((prev) => !prev);
  };

  const onSubmit = async (data: BalanceEditForm) => {
    const payload: UpdateBalancePayload = {};

    if (dirtyFields.file && data.file) payload.file = data.file;
    if (dirtyFields.motive_id && typeof data.motive_id === "number" && data.motive_id > 0) {
      payload.motive_id = data.motive_id;
    }
    if (dirtyFields.audit_observation) payload.audit_observation = data.audit_observation;
    if (dirtyFields.eligibility_status && data.eligibility_status)
      payload.eligibility_status = data.eligibility_status;

    const editedDocuments = data.client_documents
      .filter((_, index) => dirtyFields.client_documents?.[index]?.document)
      .map((doc) => ({ id: doc.id, document: doc.document }));
    if (editedDocuments.length) payload.client_documents = editedDocuments;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateBalance(saldoData.id, payload);
      showMessage("success", "Saldo actualizado correctamente");
      await onUpdated?.();
      setIsEditing(false);
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Error al actualizar el saldo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldDirty: true });
    }
    e.target.value = "";
  };

  return (
    <div className={isModal ? "bg-white" : "min-h-screen bg-white"}>
      <div className={isModal ? "px-6 pt-5 pb-4" : "px-6 lg:px-8 pt-5 pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center bg-white border-none cursor-pointer hover:bg-[#f7f7f7]"
            >
              <CaretDoubleRight size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-cashport-black">{saldoData.id}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="px-3 py-1 text-sm font-medium text-primary-foreground bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando…" : "Guardar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleEdit}
                className="px-3 py-1 text-sm font-medium text-cashport-black border border-input rounded bg-white hover:bg-[#f7f7f7] transition-colors"
              >
                Editar
              </button>
            )}
            <Badge
              className="text-xs px-2.5 py-1 whitespace-nowrap"
              style={{
                backgroundColor: "transparent",
                color: "#000",
                border: "1px solid #d9d9d9"
              }}
            >
              {saldoData.status_name}
            </Badge>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div className={isModal ? "px-6 py-5" : "px-6 lg:px-8 py-5"}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-gray-400">Cliente</p>
              <p className="text-sm font-semibold text-cashport-black">{saldoData.client_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tipo</p>
              {isEditing ? (
                <Controller
                  control={control}
                  name="motive_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      options={motives?.map((m) => ({ value: m.id, label: m.name })) ?? []}
                      loading={motivesLoading}
                      allowClear
                      placeholder="Selecciona un tipo"
                      getPopupContainer={(trigger) => trigger.parentElement!}
                    />
                  )}
                />
              ) : (
                <p className="text-sm font-semibold text-cashport-black">
                  {saldoData.motive_name ?? "-"}
                </p>
              )}
            </div>
            {saldoData.kam_name && (
              <div>
                <p className="text-xs text-gray-400">KAM</p>
                <p className="text-sm font-semibold text-cashport-black">{saldoData.kam_name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Fecha creación</p>
              <p className="text-sm font-semibold text-cashport-black">
                {formatDate(saldoData.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Procedencia</p>
              {isEditing ? (
                <Controller
                  control={control}
                  name="eligibility_status"
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      options={eligibilityStatuses.map((e) => ({
                        value: e.id,
                        label: e.description
                      }))}
                      allowClear
                      placeholder="Selecciona una procedencia"
                      getPopupContainer={(trigger) => trigger.parentElement!}
                    />
                  )}
                />
              ) : saldoData.eligibility_status ? (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    color: saldoData.eligibility_status.status_color,
                    backgroundColor: saldoData.eligibility_status.background_color,
                    borderColor: "transparent"
                  }}
                >
                  {saldoData.eligibility_status.description}
                </Badge>
              ) : (
                <p className="text-sm font-semibold text-cashport-black">-</p>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <p className="text-xs text-gray-400">Descripción</p>
            <p className="text-sm font-semibold text-cashport-black">
              {saldoData.COMMENTS ?? saldoData.comments ?? "-"}
            </p>
          </div>

          {saldoData.audit_observation != null && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-xs text-gray-400">Observación auditoría</p>
                {isEditing ? (
                  <Controller
                    control={control}
                    name="audit_observation"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="Ingresar una observación de auditoría"
                        rows={3}
                        className="w-full mt-1 px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      />
                    )}
                  />
                ) : (
                  <p className="text-sm font-semibold text-cashport-black">
                    {saldoData.audit_observation || "-"}
                  </p>
                )}
              </div>
            </>
          )}

          {!!saldoData.client_documents?.length && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-xs text-gray-400">Documento cliente</p>
                <div className="space-y-2 mt-1">
                  {saldoData.client_documents.map((doc, index) =>
                    isEditing ? (
                      <Controller
                        key={doc.id}
                        control={control}
                        name={`client_documents.${index}.document`}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Ingresar documento"
                            className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        )}
                      />
                    ) : (
                      <p key={doc.id} className="text-sm font-semibold text-cashport-black">
                        {doc.document}
                      </p>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Saldo inicial</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(saldoData.initial_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pendiente</p>
              <p className="text-base font-bold text-cashport-black">
                {formatCurrency(saldoData.pending_amount)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {saldoData.audit_file_url && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Soportes
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(saldoData.audit_file_url!, "_blank")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm text-cashport-black hover:bg-[#f7f7f7] transition-colors"
                >
                  <Paperclip size={20} />
                  <span>{saldoData.audit_file_name}</span>
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-[#f7f7f7] transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {editFile && (
                <p className="text-xs text-muted-foreground mt-1">Nuevo archivo: {editFile.name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
