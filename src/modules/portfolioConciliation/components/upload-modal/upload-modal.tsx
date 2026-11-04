"use client";

import { useState } from "react";
import { Button, Checkbox, Modal, Typography, Upload } from "antd";
import { UploadSimple, Warning, X } from "phosphor-react";
import { useTranslations } from "use-intl";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { uploadPortfolioConciliation } from "@/services/portfolioConciliation/portfolioConciliation";
import { formatNumber } from "@/utils/utils";
import { IConciliationUpload } from "@/types/portfolioConciliation/IPortfolioConciliation";
import { TEMPLATE_URL, UPLOAD_MAX_BYTES } from "../../constants";
import { formatDateTime, formatFileSize } from "../../utils/format";

interface Props {
  isOpen: boolean;
  clientUUID: string;
  clientName?: string | null;
  /** Cartera vigente que se va a reemplazar, si existe. */
  currentUpload: IConciliationUpload | null;
  onClose: () => void;
  /** La carga quedó en PROCESSING: el contenedor empieza a consultar su estado. */
  onUploaded: (upload: IConciliationUpload) => void;
}

const UploadModal = ({
  isOpen,
  clientUUID,
  clientName,
  currentUpload,
  onClose,
  onUploaded
}: Props) => {
  const t = useTranslations("reconciliation.upload");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState<File | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setAccepted(false);
    setIsSending(false);
    setError(null);
  };

  const handleBeforeUpload = (selected: File) => {
    if (!/\.xlsx$/i.test(selected.name)) {
      setError(t("onlyXlsx"));
    } else if (selected.size > UPLOAD_MAX_BYTES) {
      setError(t("tooLarge", { size: formatFileSize(selected.size) }));
    } else {
      setError(null);
      setFile(selected);
    }
    // No se sube aquí: el archivo se envía al confirmar
    return Upload.LIST_IGNORE;
  };

  const handleSubmit = async () => {
    if (!file || !accepted) return;
    setIsSending(true);
    setError(null);
    try {
      const upload = await uploadPortfolioConciliation(clientUUID, file);
      onUploaded(upload);
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("uploadError"));
      setIsSending(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={isSending ? undefined : onClose}
      afterClose={reset}
      footer={null}
      closeIcon={null}
      centered
      maskClosable={false}
      width="min(640px, calc(100 * var(--vw) - 32px))"
      styles={{
        body: { padding: 0 },
        content: { padding: 0, overflow: "hidden", borderRadius: 12 }
      }}
    >
      <div className="flex flex-col text-foreground">
        <header className="flex items-center gap-3 border-b border-[#ececec] px-[22px] py-4">
          <div className="mr-auto min-w-0">
            <h3 className="text-base font-semibold">{t("title")}</h3>
            {clientName && (
              <p className="truncate text-[13px] text-muted-foreground">{clientName}</p>
            )}
          </div>
          <Button
            type="text"
            aria-label={tCommon("actions.close")}
            icon={<X size={14} />}
            onClick={onClose}
            disabled={isSending}
          />
        </header>

        <div className="flex flex-col gap-4 px-[22px] py-5">
          {file ? (
            <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-foreground p-4">
              <div className="flex min-w-0 max-w-full items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#f4f9d2] text-[13px] font-bold">
                  XLSX
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{file.name}</span>
                  <span className="block text-[13px] text-[#8a8a8a]">
                    {formatFileSize(file.size)}
                  </span>
                </span>
                <Button
                  type="text"
                  aria-label={t("removeFile")}
                  icon={<X size={12} />}
                  onClick={() => setFile(null)}
                  disabled={isSending}
                />
              </div>
            </div>
          ) : (
            <Upload.Dragger
              accept=".xlsx"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              className="flex min-h-[140px] flex-col"
            >
              <div className="flex flex-col items-center gap-2 px-4">
                <UploadSimple size={26} />
                <span className="text-[13px] font-medium">{t("dragHint")}</span>
                <span className="text-[13px] text-[#8a8a8a]">{t("formatHint")}</span>
              </div>
            </Upload.Dragger>
          )}

          <div className="flex flex-col gap-1 text-[13px] text-[#444]">
            <span>{t.rich("requiredColumns", { b: (chunks) => <b>{chunks}</b> })}</span>
            <Typography.Link href={TEMPLATE_URL} download underline className="!text-[13px]">
              {t("downloadTemplate")}
            </Typography.Link>
          </div>

          <div className="flex gap-3 rounded-lg border border-[#f5c99b] bg-[#fff7ed] px-4 py-3">
            <Warning size={20} weight="fill" className="mt-0.5 flex-none text-[#c2410c]" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[13px] font-semibold text-[#9a3412]">
                {t("replaceWarning")}
              </span>
              <span className="text-[13px] text-[#7c2d12]">
                {currentUpload
                  ? `${t("currentDocs", {
                      count: formatNumber(currentUpload.total_rows ?? 0),
                      date: formatDateTime(currentUpload.finished_at ?? currentUpload.created_at)
                    })} `
                  : ""}
                {t("replaceDetail")}
              </span>
            </div>
          </div>

          <Checkbox
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            disabled={isSending}
          >
            <span className="text-[13px]">{t("confirm")}</span>
          </Checkbox>

          {error && (
            <div className="rounded-lg bg-[#fdecec] px-3 py-2 text-[13px] text-[#c4321c]">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
          <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
            {!file ? t("noFile") : !accepted ? t("confirmToContinue") : t("ready")}
          </span>
          <Button type="text" size="large" onClick={onClose} disabled={isSending}>
            {tCommon("actions.cancel")}
          </Button>
          <PrincipalButton disabled={!file || !accepted} loading={isSending} onClick={handleSubmit}>
            {t("submit")}
          </PrincipalButton>
        </footer>
      </div>
    </Modal>
  );
};

export default UploadModal;
