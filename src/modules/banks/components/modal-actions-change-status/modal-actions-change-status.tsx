import React, { useEffect, useState } from "react";
import { Button, Flex, Modal, Radio, RadioChangeEvent } from "antd";
import { CaretLeft } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { changePaymentStatus, getPaymentsStatus } from "@/services/banksPayments/banksPayments";

import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";

import { ISingleBank } from "@/types/banks/IBanks";

import styles from "./modal-actions-change-status.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows?: ISingleBank[] | undefined;
}

interface infoObject {
  file: File;
  fileList: File[];
}

const ModalActionsChangeStatus: React.FC<Props> = ({ isOpen, onClose, selectedRows }) => {
  const [states, setStates] = useState<{ id: number; label: string }[]>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string | undefined>();
  const [isSecondView, setIsSecondView] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessageApi();
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await getPaymentsStatus();
      setStates(res.map((status) => ({ id: status.id, label: status.status_description })));
    };
    fetchStatus();
  }, []);

  const handleOnChangeRadioGroup = (e: RadioChangeEvent) => {
    setSelectedStatus(e.target.value);
  };

  const handlegoBackToFirstView = () => {
    setIsSecondView(false);
    setSelectedStatus(undefined);
    setSelectedEvidence([]);
    setCommentary(undefined);
  };

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentary(e.target.value);
  };

  const handleAttachEvidence = async () => {
    if (!selectedRows || !selectedStatus) {
      console.error("No se han seleccionado filas o estado");
      return;
    }
    setLoading(true);
    try {
      // Call API to change the status of the payment
      const modelData = {
        projectId,
        clientId: selectedRows[0].id_client,
        payment_ids: selectedRows.map((row) => row.id),
        status_id: parseInt(selectedStatus),
        comment: commentary,
        file: selectedEvidence[0]
      };
      await changePaymentStatus(modelData);
      showMessage("success", "Estado cambiado con éxito");
      onClose();
      handlegoBackToFirstView();
    } catch (error) {
      showMessage("error", "Ha ocurrido un error al cambiar el estado del pago");
    }
    setLoading(false);
  };

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage(
          "error",
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setSelectedEvidence([...selectedEvidence, rawFile]);
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = selectedEvidence?.filter((file) => file.name !== fileName);
    setSelectedEvidence(updatedFiles);
  };

  //  Commented logic to add more than 1 document
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //     const file = files[0];
  //     const fileSizeInMB = file.size / (1024 * 1024);
  //     if (fileSizeInMB > 30) {
  //       showMessage(
  //         "error",
  //         "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
  //       );
  //       return;
  //     }
  //     setSelectedEvidence((prevFiles) => [...prevFiles, file]);
  //   }
  // };

  const firstViewModal = {
    title: "Cambio de estado",
    description: "Selecciona el nuevo estado del pago",
    innerContent: (
      <>
        <div className={styles.content__status}>
          {states?.map((state) => (
            <Radio.Group onChange={handleOnChangeRadioGroup} value={selectedStatus} key={state.id}>
              <Radio className={styles.content__status__item} value={state?.id}>
                {state.label}
              </Radio>
            </Radio.Group>
          ))}
        </div>
        <div className={styles.footer}>
          <SecondaryButton fullWidth onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrincipalButton
            fullWidth
            disabled={!selectedStatus}
            onClick={() => setIsSecondView(!isSecondView)}
          >
            Cambiar de estado
          </PrincipalButton>
        </div>
      </>
    )
  };

  const secondViewModal = {
    title: "Evidencia",
    description: "Adjunta la evidencia e ingresa un comentario",
    innerContent: (
      <>
        <div className={styles.content__evidence}>
          <Flex vertical>
            <p>Evidencia</p>
            <em className="descriptionDocument">*Opcional</em>
          </Flex>
          <DocumentButton
            key={selectedEvidence[0]?.name}
            title={selectedEvidence[0]?.name}
            handleOnChange={handleOnChangeDocument}
            handleOnDelete={() => handleOnDeleteDocument(selectedEvidence[0]?.name)}
            fileName={selectedEvidence[0]?.name}
            fileSize={selectedEvidence[0]?.size}
          />
          {selectedEvidence.length > 0
            ? selectedEvidence.slice(1).map((file) => {
                return (
                  <DocumentButton
                    key={file.name}
                    className={styles.documentButton}
                    title={file.name}
                    handleOnChange={handleOnChangeDocument}
                    handleOnDelete={() => handleOnDeleteDocument(file.name)}
                    fileName={file.name}
                    fileSize={file.size}
                  />
                );
              })
            : null}

          {/* Commented logic to add more than 1 document */}
          {/* {selectedEvidence.length > 0 && (
            <>
              <Button
                onClick={() => {
                  const fileInput = document.getElementById("fileInput");
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                className={styles.addDocument}
                icon={<Plus size={"1rem"} />}
              >
                <p>Cargar otro documento</p>
              </Button>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".pdf, .png, .doc, .docx, .xls, .xlsx, .msg, .txt, .eml"
              />
            </>
          )} */}

          <p>Comentarios</p>
          <textarea
            onChange={handleOnChangeTextArea}
            placeholder="Ingresar un comentario (opcional)"
          />
        </div>
        <div className={styles.footer}>
          <SecondaryButton fullWidth onClick={() => setIsSecondView(false)}>
            Cancelar
          </SecondaryButton>
          <PrincipalButton fullWidth onClick={handleAttachEvidence} loading={loading}>
            {selectedEvidence.length > 0 ? "Adjuntar evidencia" : "Cambiar sin evidencia"}
          </PrincipalButton>
        </div>
      </>
    )
  };

  useEffect(() => {
    return () => {
      setSelectedStatus(undefined);
      setSelectedEvidence([]);
      setCommentary(undefined);
    };
  }, [isOpen]);

  return (
    <Modal className={styles.wrapper} width="50%" open={isOpen} footer={null} closable={false}>
      <Button
        onClick={isSecondView ? handlegoBackToFirstView : onClose}
        className={styles.content__header}
      >
        <CaretLeft size="1.25rem" />
        <span>{isSecondView ? secondViewModal.title : firstViewModal.title}</span>
      </Button>

      <div className={styles.content} style={{ height: "90%" }}>
        <p className={styles.content__description}>
          {isSecondView ? secondViewModal.description : firstViewModal.description}
        </p>

        <div>{isSecondView ? secondViewModal.innerContent : firstViewModal.innerContent}</div>
      </div>
    </Modal>
  );
};

export default ModalActionsChangeStatus;
