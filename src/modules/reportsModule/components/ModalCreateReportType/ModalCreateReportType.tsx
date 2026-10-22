"use client";

import { useEffect, useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";

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
      showMessage("success", "Tipo de informe creado");
      onSuccess?.(type);
      onClose();
    } catch (err) {
      // Un nombre repetido responde 409 con su mensaje: el modal sigue abierto para cambiarlo.
      showMessage(
        "error",
        err instanceof Error ? err.message : "No se pudo crear el tipo de informe."
      );
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
      title={<Title level={4}>Crear tipo de informe</Title>}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          isConfirmDisabled={!name.trim()}
          isConfirmLoading={isLoading}
          onClose={onClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="0.5rem" style={{ marginBottom: "1rem" }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Nombre del tipo de informe <span className="text-red-500">*</span>
        </p>
        <Input
          size="large"
          autoFocus
          placeholder="Ej. Informe de cartera"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleOk}
        />
      </Flex>
    </Modal>
  );
}
