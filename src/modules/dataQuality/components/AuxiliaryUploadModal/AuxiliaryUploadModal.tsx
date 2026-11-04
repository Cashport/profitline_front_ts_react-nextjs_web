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
import { useTranslations } from "use-intl";

import ProfitLoader from "@/components/ui/profit-loader/profit-loader";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { Button } from "@/modules/chat/ui/button";

import { retryAuxiliaryUpload, uploadAuxiliaryUpload } from "@/services/dataQuality/dataQuality";
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

// La etiqueta de cada estado está en dataQuality.auxiliaryUpload.status.
const STATUS_META: Record<AuxiliaryUploadStatus | LocalStatus, { color: string }> = {
  pending: { color: "default" },
  uploading: { color: "processing" },
  received: { color: "blue" },
  processing: { color: "processing" },
  success: { color: "success" },
  error: { color: "error" }
};

const errorMessageOf = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
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
  const t = useTranslations("dataQuality.auxiliaryUpload");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState<File[]>([]);
  const [items, setItems] = useState<LocalItem[]>([]);
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
        message.warning(t("maxFilesWarning", { count: auxiliaryFile?.max_files ?? 1 }));
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
          const result = await uploadAuxiliaryUpload({
            id,
            batchId: targetBatchId,
            fileCount,
            slotIndex,
            file
          });
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
          lastError = errorMessageOf(error, t("uploadError"));
        }
      }

      setItems((prev) =>
        prev.map((item) =>
          item.slotIndex === slotIndex ? { ...item, status: "error", error: lastError } : item
        )
      );
      return false;
    },
    [auxiliaryFile?.id, t]
  );

  const handleStart = async () => {
    if (!auxiliaryFile || selected.length === 0) return;

    const targetBatchId = crypto.randomUUID();
    const fileCount = selected.length;
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
      message.error(t("noneReceivedMessage"));
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
      message.success(t("retryQueued"));
    } catch (error) {
      message.error(errorMessageOf(error, t("uploadError")));
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
          ? t("filesTitle", { fileType: auxiliaryFile?.file_type ?? t("auxiliaryFallback") })
          : t("uploadTitle", { fileType: auxiliaryFile?.file_type ?? t("auxiliaryFallback") })
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
              title={t("dropTitle")}
              subtitle={t("dropSubtitle", { count: auxiliaryFile?.max_files ?? 1 })}
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
                      {tCommon("actions.remove")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                {tCommon("actions.cancel")}
              </Button>
              <Button onClick={handleStart} disabled={selected.length === 0 || isUploading}>
                {isUploading ? t("uploadingShort") : t("uploadButton", { count: selected.length })}
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
                message={t("noneReceivedTitle")}
                description={t("noneReceivedDescription")}
                action={
                  <Button variant="outline" size="sm" onClick={reset}>
                    {t("tryAgain")}
                  </Button>
                }
              />
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Tag color="blue">
                {t("received", { count: batch?.received_count ?? 0, total: summary.total })}
              </Tag>
              <Tag color="success">{t("successful", { count: summary.ok })}</Tag>
              <Tag color={summary.ko > 0 ? "error" : "default"}>
                {t("errors", { count: summary.ko })}
              </Tag>
            </div>

            {(batch?.status === "uploading" || localOnlyItems.length > 0) && !isUploading && (
              <Alert
                type="warning"
                showIcon
                message={t("incompleteUploadTitle")}
                description={t("incompleteUploadDescription")}
              />
            )}

            {batch?.status === "completed" && (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircle size={18} />}
                message={t("allDelivered")}
              />
            )}

            {batch?.status === "completed_with_errors" && (
              <Alert
                type="error"
                showIcon
                icon={<XCircle size={18} />}
                message={t("batchErrorsTitle")}
                description={t("batchErrorsDescription")}
              />
            )}

            {batch?.status === "incomplete" && (
              <Alert
                type="error"
                showIcon
                message={t("batchIncompleteTitle")}
                description={t("batchIncompleteDescription")}
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
                          {t("remote", { name: file.remote_filename })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag color={meta.color}>{t(`status.${file.status}`)}</Tag>
                        {file.status === "error" && (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[13px] text-[#175CD3] hover:underline"
                            onClick={() => handleRetryDelivered(file)}
                          >
                            <ArrowsClockwise size={14} /> {tCommon("actions.retry")}
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
                          ? t("remote", { name: item.remoteFilename })
                          : t("noRemoteName")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={STATUS_META[item.status].color}>{t(`status.${item.status}`)}</Tag>
                      {item.status === "error" && (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[13px] text-[#175CD3] hover:underline"
                          onClick={() => handleRetryItem(item)}
                        >
                          <ArrowsClockwise size={14} /> {tCommon("actions.retry")}
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
                {isUploading ? t("uploadingFiles") : t("delivering")}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                {isTerminal ? tCommon("actions.close") : t("closeInBackground")}
              </Button>
              {isTerminal && (
                <Button
                  onClick={async () => {
                    await mutate();
                  }}
                >
                  {t("refreshStatus")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
