"use client";

import { useState } from "react";
import { Input, Modal, Typography } from "antd";
import type { UploadFile } from "antd";
import { UploadChangeParam } from "antd/es/upload";

import { useMessageApi } from "@/context/MessageContext";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

const { Title, Text } = Typography;

interface ModalPurchaseOrderInfoProps {
  isOpen: boolean;
  onCancel: () => void;
  // eslint-disable-next-line no-unused-vars
  onOk: (purchaseOrderNumber: string, file: File) => void;
  loading?: boolean;
}

export default function ModalPurchaseOrderInfo({
  isOpen,
  onCancel,
  onOk,
  loading = false
}: ModalPurchaseOrderInfoProps) {
  const { showMessage } = useMessageApi();
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [poFile, setPoFile] = useState<File | undefined>();

  const resetState = () => {
    setPurchaseOrderNumber("");
    setPoFile(undefined);
  };

  const handleCancel = () => {
    if (loading) return;
    resetState();
    onCancel();
  };

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    const raw = info.file as unknown as File & { originFileObj?: File };
    const file = raw?.originFileObj ?? raw;
    if (!file) return;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 30) {
      showMessage(
        "error",
        "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
      );
      return;
    }
    setPoFile(file);
  };

  const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setPoFile(undefined);
  };

  const handleOk = () => {
    const cleanedNumber = purchaseOrderNumber.trim();
    if (!cleanedNumber || !poFile) return;
    onOk(cleanedNumber, poFile);
    resetState();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      title={<Title level={4}>Orden de compra</Title>}
      width={520}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          titleCancel="Cancelar"
          onClose={handleCancel}
          handleOk={handleOk}
          isConfirmDisabled={!purchaseOrderNumber.trim() || !poFile}
          isConfirmLoading={loading}
        />
      }
      destroyOnClose
    >
      <div className="flex flex-col gap-4 my-6">
        <div className="flex flex-col gap-2">
          <Text className="font-medium text-[#141414]"># de orden de compra</Text>
          <Input
            value={purchaseOrderNumber}
            onChange={(e) => setPurchaseOrderNumber(e.target.value)}
            placeholder="Ingresa el # de orden de compra"
            maxLength={50}
            disabled={loading}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text className="font-medium text-[#141414]">PDF orden de compra</Text>
          <div className="h-[100px]">
            <DocumentButton
              title="PDF orden de compra"
              fileName={poFile?.name}
              fileSize={poFile?.size}
              handleOnChange={handleChange}
              handleOnDelete={handleDelete}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
