"use client";

import { useState } from "react";
import { Modal, Select, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useMessageApi } from "@/context/MessageContext";
import { changeMedicalAccountStatus } from "@/services/medicalAccounts/medicalAccounts";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";
import { STATUS_CODE_OPTIONS } from "../../constants";

const { Title } = Typography;

interface ModalChangeStatusProps {
  isOpen: boolean;
  accountId: number;
  onClose: () => void;
  onSuccess: (updated: IMedicalAccountUploadData) => void;
}

export function ModalChangeStatus({
  isOpen,
  accountId,
  onClose,
  onSuccess
}: ModalChangeStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();

  const handleOk = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      const response = await changeMedicalAccountStatus(accountId, selectedStatus);
      showMessage("success", "Estado actualizado correctamente.");
      onSuccess(response.data);
      onClose();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al cambiar el estado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedStatus(null);
      onClose();
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={480}
      onCancel={handleClose}
      title={<Title level={4}>Cambiar estado</Title>}
      footer={
        <FooterButtons
          titleConfirm="Cambiar estado"
          showLeftButton={false}
          isConfirmDisabled={!selectedStatus}
          isConfirmLoading={isLoading}
          onClose={handleClose}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <p className="-mt-2 mb-4 text-sm text-gray-500">
        Selecciona el nuevo estado para esta cuenta médica.
      </p>

      <Select
        placeholder="Seleccionar estado"
        style={{ width: "100%" }}
        options={STATUS_CODE_OPTIONS}
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
      />
    </Modal>
  );
}
