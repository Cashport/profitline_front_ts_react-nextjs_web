import { useEffect, useState } from "react";
import { Flex, Modal, Select, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";

import styles from "./modalUploadBalanceFile.module.scss";

const { Title } = Typography;

// TODO: replace with real "tipo de novedad" options from API
const MOCK_TIPO_NOVEDAD_OPTIONS = [
  { value: 1, label: "Novedad A" },
  { value: 2, label: "Novedad B" }
];

interface ModalUploadBalanceFileProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
}

export function ModalUploadBalanceFile({ isOpen, onClose, record }: ModalUploadBalanceFileProps) {
  const [tipoNovedadId, setTipoNovedadId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [observation, setObservation] = useState("");

  // Reset local state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setTipoNovedadId(null);
      setFile(null);
      setObservation("");
    }
  }, [isOpen]);

  const handleOnChangeDocument = (info: any) => {
    const uploaded = info?.file as File | undefined;
    if (!uploaded) return;
    if (uploaded.size / (1024 * 1024) > 30) {
      alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
      return;
    }
    setFile(uploaded);
  };

  const handleOk = () => {
    // eslint-disable-next-line no-console
    console.log("Cargar soporte", { file, observation, tipoNovedadId, record });
    onClose();
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={onClose}
      title={<Title level={4}>Cargar soporte</Title>}
      footer={
        <FooterButtons
          titleConfirm="Cargar soporte"
          onClose={onClose}
          handleOk={handleOk}
          isConfirmDisabled={!file || !tipoNovedadId || !observation.trim()}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1rem" style={{ marginBottom: "1rem" }}>
        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">Tipo de novedad</h4>
          <Select
            placeholder="Selecciona el tipo de novedad"
            style={{ width: "100%", height: 38 }}
            options={MOCK_TIPO_NOVEDAD_OPTIONS}
            value={tipoNovedadId}
            onChange={(value) => setTipoNovedadId(value)}
          />
        </Flex>

        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">Soporte</h4>
          <DocumentButton
            title={file?.name}
            fileName={file?.name}
            fileSize={file?.size}
            handleOnChange={handleOnChangeDocument}
            handleOnDelete={() => setFile(null)}
          />
        </Flex>

        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">Observación</h4>
          <textarea
            className={styles.textarea}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ingresar una observación"
            rows={2}
          />
        </Flex>
      </Flex>
    </Modal>
  );
}
