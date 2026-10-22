"use client";

import { useEffect, useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

const { Title } = Typography;

interface ModalCreateReportTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

/** "Crear tipo de informe". Se abre desde Publicar informe, que se cierra mientras tanto. */
export function ModalCreateReportType({ isOpen, onClose }: ModalCreateReportTypeProps) {
  const [name, setName] = useState("");

  // Cada apertura arranca vacía.
  useEffect(() => {
    if (!isOpen) setName("");
  }, [isOpen]);

  const handleOk = () => {
    if (!name.trim()) return;
    // Aún no hay endpoint para crear tipos: por ahora sólo se registra el nombre.
    console.log(name.trim());
    onClose();
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={480}
      onCancel={onClose}
      title={<Title level={4}>Crear tipo de informe</Title>}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          isConfirmDisabled={!name.trim()}
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
