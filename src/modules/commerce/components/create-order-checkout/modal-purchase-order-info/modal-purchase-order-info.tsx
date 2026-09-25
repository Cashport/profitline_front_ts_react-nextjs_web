"use client";

import { useEffect, useState } from "react";
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
  onOk: (purchaseOrderNumber: string, file?: File) => void;
  initialPurchaseOrderNumber?: string;
  initialFile?: File;
  isNumberRequired?: boolean;
}

export default function ModalPurchaseOrderInfo({
  isOpen,
  onCancel,
  onOk,
  initialPurchaseOrderNumber,
  initialFile,
  isNumberRequired
}: ModalPurchaseOrderInfoProps) {
  const { showMessage } = useMessageApi();
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [poFile, setPoFile] = useState<File | undefined>();
  const [numberError, setNumberError] = useState(false);

  // Al abrir, parte de lo ya guardado en el checkout: así cancelar
  // descarta los cambios y volver a abrir muestra lo adjuntado.
  useEffect(() => {
    if (!isOpen) return;
    setPurchaseOrderNumber(initialPurchaseOrderNumber ?? "");
    setPoFile(initialFile);
    setNumberError(false);
  }, [isOpen]);

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

  // El PDF siempre es opcional. El # solo es obligatorio en los canales que lo
  // exigen (ver `requiresPurchaseOrder`); en el resto, guardar en blanco limpia
  // la orden de compra.
  const handleOk = () => {
    const cleaned = purchaseOrderNumber.trim();
    if (isNumberRequired && !cleaned) {
      setNumberError(true);
      return;
    }
    onOk(cleaned, poFile);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      title={<Title level={4}>Orden de compra</Title>}
      width={520}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          titleCancel="Cancelar"
          onClose={onCancel}
          handleOk={handleOk}
        />
      }
      destroyOnClose
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Text className="font-medium text-[#141414]">
            # de orden de compra
            {isNumberRequired && <span className="text-red-500"> *</span>}
          </Text>
          <Input
            value={purchaseOrderNumber}
            onChange={(e) => {
              setPurchaseOrderNumber(e.target.value);
              setNumberError(false);
            }}
            placeholder="Ingresa el # de orden de compra"
            maxLength={50}
            className="h-10"
            status={numberError ? "error" : undefined}
          />
          {numberError && (
            <Text type="danger" className="text-xs">
              Ingresa el # de orden de compra
            </Text>
          )}
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
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
