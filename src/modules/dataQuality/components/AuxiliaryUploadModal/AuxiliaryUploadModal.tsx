"use client";

/**
 * HU cargue multiple de Auxiliares de LATAM.
 *
 * Flujo:
 *   1. Seleccion multiple (UploadDropZone reutilizado).
 *   2. Subida SECUENCIAL: un request por archivo (evita saturar memoria/red).
 *   3. El backend responde 202 cuando el archivo quedo en S3 + registrado.
 *   4. Polling del lote hasta que cada archivo tenga su resultado final.
 *
 * El 202 NO significa entregado al SFTP: por eso el modal diferencia
 * "Recibido" de "Exitoso".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Tag, message } from "antd";
import { ArrowsClockwise, CheckCircle, XCircle } from "@phosphor-icons/react";

import ProfitLoader from "@/components/ui/profit-loader/profit-loader";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { Button } from "@/modules/chat/ui/button";

import {
  retryAuxiliaryUpload,
  uploadAuxiliaryUpload
} from "@/services/dataQuality/dataQuality";
import { useIntakeStructureUpload } from "@/components/molecules/modals/ModalIntakeStructure/useIntakeStructureUpload";
import { useAuxiliaryUploadBatch } from "../../hooks/useAuxiliaryUploadBatch";
import {
  AuxiliaryUploadStatus,
  IAuxiliaryFile,
  IAuxiliaryUpload
} from "@/types/dataQuality/IDataQuality";

interface AuxiliaryUploadModalProps {
  isOpen: boolean;
  auxiliaryFile: IAuxiliaryFile | null;
  onClose: () => void;
  onFinished?: () => void;
  /** Si viene, el modal muestra el detalle de ese lote en lugar de la seleccion. */
  initialBatchId?: string | null;
}

type LocalStatus = "pending" | "uploading" | "received" | "error";

interface LocalItem {
  slotIndex: number;
  file: File;
  status: LocalStatus;
  uploadId?: number;
  remoteFilename?: string;
  error?: string;
}

const MAX_ATTEMPTS_PER_FILE = 2;

const STATUS_META: Record<AuxiliaryUploadStatus | LocalStatus, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "default" },
  uploading: { label: "Subiendo", color: "processing" },
  received: { label: "Recibido", color: "blue" },
  processing: { label: "Procesando", color: "processing" },
  success: { label: "Exitoso", color: "success" },
  error: { label: "Error", color: "error" }
};

const errorMessageOf = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return "No se pudo cargar el archivo.";
};

const formatBytes = (bytes?: number | null): string => {
  if (!bytes) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const AuxiliaryUploadModal: React.FC<AuxiliaryUploadModalProps> = ({
  isOpen,
  auxiliaryFile,
  onClose,
  onFinished,
  initialBatchId
}) => {
  const [selected, setSelected] = useState<File[]>([]);
  const [items, setItems] = useState<LocalItem[]>([]);
  const { runUpload, structureModals } = useIntakeStructureUpload();
  // Respuesta a "¿usar este archivo como template?" para el resto del lote.
  const templateDecisionRef = useRef<boolean | undefined>(undefined);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const notifiedRef = useRef(false);

  const { batch, mutate, isTerminal } = useAuxiliaryUploadBatch(batchId);

  const reset = useCallback(() => {
    setSelected([]);
    setItems([]);
    setBatchId(null);
    setIsUploading(false);
    notifiedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reset();
    if (initialBatchId) setBatchId(initialBatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialBatchId]);

  useEffect(() => {
    if (!isOpen || !isTerminal || notifiedRef.current) return;
    notifiedRef.current = true;
    onFinished?.();
  }, [isOpen, isTerminal, onFinished]);

  const files: IAuxiliaryUpload[] = useMemo(() => batch?.files ?? [], [batch]);

  const summary = useMemo(() => {
    const ok = files.filter((file) => file.status === "success").length;
    const ko = files.filter((file) => file.status === "error").length;
    return { ok, ko, total: batch?.file_count ?? selected.length };
  }, [files, batch, selected.length]);

  const handleSelect = (file: File) => {
    setSelected((prev) => {
      if (prev.length >= (auxiliaryFile?.max_files ?? 1)) {
        message.warning(
          `Este auxiliar admite maximo ${auxiliaryFile?.max_files ?? 1} archivo(s) por cargue.`
        );
        return prev;
      }
      const duplicated = prev.some((item) => item.name === file.name && item.size === file.size);
      return duplicated ? prev : [...prev, file];
    });
  };

  const sendSlot = useCallback(
    async (targetBatchId: string, slotIndex: number, file: File, fileCount: number) => {
      const id = auxiliaryFile?.id;
      if (!id) return false;

      setItems((prev) =>
        prev.map((item) =>
          item.slotIndex === slotIndex ? { ...item, status: "uploading", error: undefined } : item
        )
      );

      let lastError = "";
      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_FILE; attempt++) {
        try {
          // Validacion de estructura: la decision sobre el template se toma una
          // vez y se reutiliza para los demas archivos del lote.
          const holder: {
            result?: Awaited<ReturnType<typeof uploadAuxiliaryUpload>>;
          } = {};
          const accepted = await runUpload(async (useAsTemplate) => {
            if (useAsTemplate !== undefined) templateDecisionRef.current = useAsTemplate;
            holder.result = await uploadAuxiliaryUpload({
              id,
              batchId: targetBatchId,
              fileCount,
              slotIndex,
              file,
              useAsTemplate: useAsTemplate ?? templateDecisionRef.current
            });
          });
          if (!accepted || !holder.result) {
            // Rechazado por estructura o cancelado: no tiene sentido reintentar.
            lastError = "No se cargó: la estructura del archivo no es válida o se canceló.";
            break;
          }
          const result = holder.result;
          setItems((prev) =>
            prev.map((item) =>
              item.slotIndex === slotIndex
                ? {
                    ...item,
                    status: "received",
                    uploadId: result.uploadId,
                    remoteFilename: result.remoteFilename,
                    error: undefined
                  }
                : item
            )
          );
          return true;
        } catch (error) {
          lastError = errorMessageOf(error);
        }
      }

      setItems((prev) =>
        prev.map((item) =>
          item.slotIndex === slotIndex ? { ...item, status: "error", error: lastError } : item
        )
      );
      return false;
    },
    [auxiliaryFile?.id, runUpload]
  );

  const handleStart = async () => {
    if (!auxiliaryFile || selected.length === 0) return;

    const targetBatchId = crypto.randomUUID();
    const fileCount = selected.length;
    templateDecisionRef.current = undefined;
    const locals: LocalItem[] = selected.map((file, index) => ({
      slotIndex: index + 1,
      file,
      status: "pending"
    }));

    setItems(locals);
    setIsUploading(true);

    let anyReceived = false;
    for (let index = 0; index < selected.length; index++) {
      const received = await sendSlot(targetBatchId, index + 1, selected[index], fileCount);
      if (received && !anyReceived) {
        anyReceived = true;
        // Solo se habilita el polling cuando el lote ya existe en el backend.
        setBatchId(targetBatchId);
      }
    }

    setIsUploading(false);
    if (anyReceived) {
      await mutate();
    } else {
      message.error("No se pudo recibir ningun archivo. Revisa la conexion e intenta de nuevo.");
    }
  };

  const handleRetryItem = async (item: LocalItem) => {
    if (!batchId) {
      // Nunca se creo el lote: hay que reiniciar la seleccion completa.
      reset();
      return;
    }
    await sendSlot(batchId, item.slotIndex, item.file, selected.length || items.length);
    await mutate();
  };

  const handleRetryDelivered = async (upload: IAuxiliaryUpload) => {
    try {
      await retryAuxiliaryUpload(upload.id);
      await mutate();
      message.success("Reintento encolado.");
    } catch (error) {
      message.error(errorMessageOf(error));
    }
  };

  const localOnlyItems = items.filter(
    (item) => !files.some((file) => file.slot_index === item.slotIndex)
  );

  const hasStarted = isUploading || items.length > 0 || !!batchId;
  const canClose = !isUploading;

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        if (!canClose) return;
        onClose();
      }}
      title={
        initialBatchId
          ? `Archivos de ${auxiliaryFile?.file_type ?? "auxiliar"}`
          : `Cargar ${auxiliaryFile?.file_type ?? "auxiliar"}`
      }
      footer={null}
      width={720}
      centered
      closable={canClose}
      maskClosable={canClose}
    >
      <div className="flex flex-col gap-4">
        {/* Seleccion */}
        {!hasStarted && (
          <>
            <UploadDropZone
              onFileUpload={handleSelect}
              multiple
              title="Arrastra tus archivos aqui"
              subtitle={`Puedes cargar hasta ${auxiliaryFile?.max_files ?? 1} archivo(s). Se suben uno por uno.`}
              allowedExtensions={[".xls", ".xlsx", ".csv"]}
            />

            {selected.length > 0 && (
              <div className="rounded-lg border border-[#DDDDDD]">
                {selected.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-2 border-b border-[#EEEEEE] px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#141414]" title={file.name}>
                        {index + 1}. {file.name}
                      </p>
                      <p className="text-[13px] text-[#6B7280]">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      className="text-[13px] text-[#B42318] hover:underline"
                      onClick={() => setSelected((prev) => prev.filter((_, i) => i !== index))}
                      disabled={isUploading}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleStart} disabled={selected.length === 0 || isUploading}>
                {isUploading ? "Subiendo..." : `Cargar ${selected.length || ""} archivo(s)`}
              </Button>
            </div>
          </>
        )}

        {/* Progreso / resultado */}
        {hasStarted && (
          <>
            {!batchId && !isUploading && (
              <Alert
                type="error"
                showIcon
                message="No se pudo recibir ningun archivo"
                description="Revisa la conexion e intenta de nuevo. No quedo ningun lote registrado."
                action={
                  <Button variant="outline" size="sm" onClick={reset}>
                    Volver a intentar
                  </Button>
                }
              />
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Tag color="blue">
                Recibidos {batch?.received_count ?? 0}/{summary.total}
              </Tag>
              <Tag color="success">Exitosos {summary.ok}</Tag>
              <Tag color={summary.ko > 0 ? "error" : "default"}>Error {summary.ko}</Tag>
            </div>

            {(batch?.status === "uploading" || localOnlyItems.length > 0) && !isUploading && (
              <Alert
                type="warning"
                showIcon
                message="El cargue quedo incompleto"
                description="Faltan archivos por recibir. Reintenta los archivos marcados; si cierras ahora, el auxiliar se libera cuando expire el lote (15 min)."
              />
            )}

            {batch?.status === "completed" && (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircle size={18} />}
                message="Todos los archivos fueron entregados al SFTP"
              />
            )}

            {batch?.status === "completed_with_errors" && (
              <Alert
                type="error"
                showIcon
                icon={<XCircle size={18} />}
                message="El lote termino con errores"
                description="Puedes reintentar los archivos fallidos sin volver a subirlos."
              />
            )}

            {batch?.status === "incomplete" && (
              <Alert
                type="error"
                showIcon
                message="El lote no se completo"
                description="No se entrego ningun archivo. Vuelve a cargar el auxiliar completo."
              />
            )}

            <div className="max-h-[360px] overflow-auto rounded-lg border border-[#DDDDDD]">
              {files.map((file) => {
                const meta = STATUS_META[file.status];
                return (
                  <div
                    key={file.id}
                    className="flex flex-col gap-1 border-b border-[#EEEEEE] px-3 py-2 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#141414]">
                          {file.slot_index}. {file.original_filename}
                        </p>
                        <p className="truncate text-[13px] text-[#6B7280]">
                          Remoto: {file.remote_filename}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag color={meta.color}>{meta.label}</Tag>
                        {file.status === "error" && (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[13px] text-[#175CD3] hover:underline"
                            onClick={() => handleRetryDelivered(file)}
                          >
                            <ArrowsClockwise size={14} /> Reintentar
                          </button>
                        )}
                      </div>
                    </div>
                    {file.error_message && (
                      <p className="text-[13px] text-[#B42318]">{file.error_message}</p>
                    )}
                  </div>
                );
              })}

              {localOnlyItems.map((item) => (
                <div
                  key={`local-${item.slotIndex}`}
                  className="flex flex-col gap-1 border-b border-[#EEEEEE] px-3 py-2 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#141414]">
                        {item.slotIndex}. {item.file.name}
                      </p>
                      <p className="text-[13px] text-[#6B7280]">
                        {item.remoteFilename
                          ? `Remoto: ${item.remoteFilename}`
                          : "Sin nombre remoto asignado"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={STATUS_META[item.status].color}>
                        {STATUS_META[item.status].label}
                      </Tag>
                      {item.status === "error" && (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[13px] text-[#175CD3] hover:underline"
                          onClick={() => handleRetryItem(item)}
                        >
                          <ArrowsClockwise size={14} /> Reintentar
                        </button>
                      )}
                    </div>
                  </div>
                  {item.error && <p className="text-[13px] text-[#B42318]">{item.error}</p>}
                </div>
              ))}
            </div>

            {(isUploading || (batch && !isTerminal)) && (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <ProfitLoader size="small" />
                {isUploading ? "Subiendo archivos..." : "Convirtiendo y entregando al SFTP..."}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                {isTerminal ? "Cerrar" : "Cerrar y continuar en segundo plano"}
              </Button>
              {isTerminal && (
                <Button
                  onClick={async () => {
                    await mutate();
                  }}
                >
                  Actualizar estado
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {structureModals}
    </Modal>
  );
};
