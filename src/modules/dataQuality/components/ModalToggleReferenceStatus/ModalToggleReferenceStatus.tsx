"use client";

import { useEffect, useState } from "react";
import { Modal, message } from "antd";
import { useTranslations } from "use-intl";

import { Button } from "@/modules/chat/ui/button";
import { IReferenceFile } from "@/types/dataQuality/IDataQuality";

interface ModalToggleReferenceStatusProps {
  isOpen: boolean;
  onClose: () => void;
  reference: IReferenceFile | null;
  ownerLabel: string;
  onConfirm: () => Promise<void>;
}

export function ModalToggleReferenceStatus({
  isOpen,
  onClose,
  reference,
  ownerLabel,
  onConfirm
}: ModalToggleReferenceStatusProps) {
  const t = useTranslations("dataQuality.references.toggle");
  const tCommon = useTranslations("common");
  const [submitting, setSubmitting] = useState(false);
  const willDeactivate = reference?.is_active === 1;

  useEffect(() => {
    if (!isOpen) setSubmitting(false);
  }, [isOpen]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
      message.success(willDeactivate ? t("deactivated") : t("activated"));
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={submitting ? undefined : onClose}
      title={willDeactivate ? t("deactivateTitle") : t("activateTitle")}
      footer={null}
      destroyOnClose
      maskClosable={!submitting}
    >
      <div className="space-y-4">
        <p className="text-sm text-[#141414]">
          {willDeactivate ? t("deactivateDescription") : t("activateDescription")}
        </p>
        <div className="rounded-lg bg-[#F5F5F4] p-3 text-sm text-[#141414]">
          <p>
            <span className="font-medium">{t("type")}</span> {reference?.reference_type ?? "-"}
          </p>
          <p>
            <span className="font-medium">{t("scope")}</span> {ownerLabel}
          </p>
          <p>
            <span className="font-medium">{t("version")}</span> {reference?.version ?? "-"}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {tCommon("actions.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting
              ? tCommon("status.processing")
              : willDeactivate
                ? t("deactivate")
                : t("activate")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
