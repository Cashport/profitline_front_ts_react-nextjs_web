"use client";

import { useEffect, useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useMessageApi } from "@/context/MessageContext";
import type { IReportType } from "@/types/reports/IReports";

import { useReportTypes } from "../../hooks/useReportTypes";

const { Title } = Typography;

interface ModalCreateReportTypeProps {
  isOpen: boolean;
  onClose: () => void;
  /** El tipo creado, tal cual lo devuelve el backend. */
  onSuccess?: (type: IReportType) => void;
}

/** "Crear tipo de informe". Se abre desde Publicar informe, que se cierra mientras tanto. */
export function ModalCreateReportType({ isOpen, onClose, onSuccess }: ModalCreateReportTypeProps) {
  const t = useTranslations("reports.typeModal");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { createType } = useReportTypes();
  const { showMessage } = useMessageApi();

  // Cada apertura arranca vacía.
  useEffect(() => {
    if (!isOpen) setName("");
  }, [isOpen]);

  const handleOk = async () => {
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const type = await createType(name.trim());
      showMessage("success", t("created"));
      onSuccess?.(type);
      onClose();
    } catch (err) {
      // Un nombre repetido responde 409 con su mensaje: el modal sigue abierto para cambiarlo.
      showMessage("error", err instanceof Error ? err.message : t("createError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={480}
      onCancel={isLoading ? undefined : onClose}
      title={<Title level={4}>{t("title")}</Title>}
      footer={
        <FooterButtons
          titleConfirm={tCommon("actions.save")}
          titleCancel={tCommon("actions.cancel")}
          isConfirmDisabled={!name.trim()}
          isConfirmLoading={isLoading}
          onClose={onClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="0.5rem" style={{ marginBottom: "1rem" }}>
        <p className="text-[13px] font-semibold text-gray-500">
          {t("nameLabel")} <span className="text-red-500">*</span>
        </p>
        <Input
          size="large"
          autoFocus
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleOk}
        />
      </Flex>
    </Modal>
  );
}
