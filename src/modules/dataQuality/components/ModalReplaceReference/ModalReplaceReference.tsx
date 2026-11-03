"use client";

import { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { useTranslations } from "use-intl";

import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";
import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";
import {
  REFERENCE_ALLOWED_EXTENSIONS,
  isAllowedReferenceFile
} from "../../references/references.utils";

interface ModalReplaceReferenceProps {
  isOpen: boolean;
  onClose: () => void;
  reference: IReferenceFile | null;
  ownerLabel: string;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (file: File) => Promise<void>;
}

export function ModalReplaceReference({
  isOpen,
  onClose,
  reference,
  ownerLabel,
  onSubmit
}: ModalReplaceReferenceProps) {
  const t = useTranslations("dataQuality.references.replace");
  const tForm = useTranslations("dataQuality.references.form");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setConfirming(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleFile = (selected: File) => {
    if (!isAllowedReferenceFile(selected)) {
      setFile(null);
      setError(tForm("formatNotAllowed", { extensions: REFERENCE_ALLOWED_EXTENSIONS.join(", ") }));
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleConfirm = async () => {
    if (submitting || !file) return;
    setSubmitting(true);
    try {
      await onSubmit(file);
      message.success(t("replaced"));
      onClose();
    } catch (err) {
      // El conflicto de concurrencia (409) se informa y NO se reintenta solo.
      message.error(err instanceof Error ? err.message : t("replaceError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={submitting ? undefined : onClose}
      title={t("title")}
      footer={null}
      destroyOnClose
      maskClosable={!submitting}
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-[#F5F5F4] p-3 text-sm text-[#141414]">
          <p>
            <span className="font-medium">{t("type")}</span> {reference?.reference_type ?? "-"}
          </p>
          <p>
            <span className="font-medium">{t("scope")}</span> {ownerLabel}
          </p>
          <p>
            <span className="font-medium">{t("currentVersion")}</span> {reference?.version ?? "-"}
          </p>
        </div>

        {!confirming ? (
          <>
            <UploadDropZone
              onFileUpload={handleFile}
              allowedExtensions={[...REFERENCE_ALLOWED_EXTENSIONS]}
              title={t("dropTitle")}
            />
            {file && <p className="text-sm text-[#141414]">{file.name}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                {tCommon("actions.cancel")}
              </Button>
              <Button
                type="button"
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
                disabled={!file || submitting}
                onClick={() => setConfirming(true)}
              >
                {tCommon("actions.continue")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#141414]">
              {t.rich("confirmText", {
                from: reference?.version ?? "-",
                to: (reference?.version ?? 0) + 1,
                b: (chunks) => <span className="font-medium">{chunks}</span>
              })}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                {tCommon("actions.back")}
              </Button>
              <Button
                type="button"
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting ? t("replacing") : t("confirm")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
