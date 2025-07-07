import React, { useEffect } from "react";
import { Button, Flex, Modal } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import { CaretLeft, Plus } from "@phosphor-icons/react";

import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import styles from "./modalAttachEvidence.module.scss";

type IsMandatoryType = {
  commentary?: boolean;
  evidence?: boolean;
};

type customTexts = {
  title?: string;
  description?: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
};

type EvidenceModalProps = {
  selectedEvidence: File[];
  setSelectedEvidence: React.Dispatch<React.SetStateAction<File[]>>;
  handleAttachEvidence: () => void;
  commentary?: string;
  setCommentary: React.Dispatch<React.SetStateAction<string | undefined>>;
  isOpen: boolean;
  handleCancel: () => void;
  customTexts?: customTexts;
  multipleFiles?: boolean;
  noComment?: boolean;
  loading?: boolean;
  confirmDisabled?: boolean;
  isMandatory?: IsMandatoryType;
  noModal?: boolean;
  noTitle?: boolean;
  noDescription?: boolean;
  defaultEvidenceFile?: {
    name: string;
    url: string;
  };
  showDefaultFile?: boolean;
  setShowDefaultFile?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ModalAttachEvidence = ({
  selectedEvidence,
  setSelectedEvidence,
  handleAttachEvidence,
  isOpen,
  handleCancel,
  customTexts,
  setCommentary,
  commentary,
  multipleFiles = false,
  loading = false,
  confirmDisabled,
  isMandatory = { commentary: false, evidence: false },
  noModal = false,
  noTitle = false,
  noDescription = false,
  defaultEvidenceFile,
  setShowDefaultFile,
  showDefaultFile
}: EvidenceModalProps) => {
  const handleOnChangeDocument: any = (info: UploadChangeParam<File>) => {
    const { file } = info;
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);

      if (fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
        return;
      }

      setSelectedEvidence([...selectedEvidence, file]);
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = selectedEvidence?.filter((file) => file.name !== fileName);
    setSelectedEvidence(updatedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files as FileList);

    for (let i = 0; i < files.length; i++) {
      if (selectedEvidence.some((file) => file.name === files[i].name)) {
        alert("Ya existe un archivo con el mismo nombre");
        return;
      }
    }

    setSelectedEvidence((prevFiles) => [...prevFiles, ...files]);
  };

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentary(e.target.value);
  };

  //useEffect for cleaning the states when the modal is closed
  useEffect(() => {
    return () => {
      setCommentary("");
      setSelectedEvidence([]);
    };
  }, [isOpen, setCommentary, setSelectedEvidence]);

  const handleDeleteDefault = () => {
    setShowDefaultFile && setShowDefaultFile(false);
  };

  const renderView = () => {
    return (
      <div className={styles.content}>
        {!noTitle && (
          <button className={styles.content__header} onClick={handleCancel}>
            <CaretLeft size={"1.25rem"} />
            <h4>{customTexts?.title ? customTexts?.title : "Evidencia"}</h4>
          </button>
        )}
        {!noDescription && (
          <p className={styles.content__description}>
            {customTexts?.description
              ? customTexts?.description
              : "Adjunta la evidencia e ingresa un comentario"}
          </p>
        )}
        <div className={styles.content__evidence}>
          <Flex vertical>
            <p>Evidencia</p>
            <em className="descriptionDocument">
              {" "}
              *{isMandatory?.evidence ? "Obligatorio" : "Opcional"}
            </em>
          </Flex>

          <div className={styles.documentss}>
            {defaultEvidenceFile && showDefaultFile ? (
              <DocumentButton
                title={defaultEvidenceFile.name}
                fileName={defaultEvidenceFile.name}
                fileSize={undefined}
                onFileNameClick={() => window.open(defaultEvidenceFile.url, "_blank")}
                handleOnDelete={handleDeleteDefault}
                handleOnChange={undefined}
              />
            ) : (
              <>
                <DocumentButton
                  title={selectedEvidence[0]?.name}
                  handleOnChange={handleOnChangeDocument}
                  handleOnDelete={() => handleOnDeleteDocument(selectedEvidence[0]?.name)}
                  fileName={selectedEvidence[0]?.name}
                  fileSize={selectedEvidence[0]?.size}
                />
                {selectedEvidence.length > 0 &&
                  selectedEvidence
                    .slice(1)
                    .map((file) => (
                      <DocumentButton
                        key={file.name}
                        className={styles.documentButton}
                        title={file.name}
                        handleOnChange={handleOnChangeDocument}
                        handleOnDelete={() => handleOnDeleteDocument(file.name)}
                        fileName={file.name}
                        fileSize={file.size}
                      />
                    ))}
              </>
            )}
          </div>

          {multipleFiles && selectedEvidence.length > 0 && (
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
                accept={FILE_EXTENSIONS.join(", ")}
              />
            </>
          )}

          <Flex vertical>
            <p>Comentarios</p>
            <em className="descriptionDocument">
              *{isMandatory?.commentary ? "Obligatorio" : "Opcional"}
            </em>
          </Flex>
          <textarea
            value={commentary || ""}
            onChange={handleOnChangeTextArea}
            placeholder="Ingresar un comentario"
          />
        </div>

        <FooterButtons
          handleOk={handleAttachEvidence}
          onClose={handleCancel}
          titleConfirm={
            customTexts?.acceptButtonText ? customTexts?.acceptButtonText : "Adjuntar evidencia"
          }
          isConfirmLoading={loading}
          isConfirmDisabled={confirmDisabled}
        />
      </div>
    );
  };

  if (noModal) {
    return renderView();
  }

  return (
    <Modal
      className="ModalAttachEvidence"
      onCancel={handleCancel}
      width={"55%"}
      open={isOpen}
      footer={null}
      closable={false}
      destroyOnClose={true}
    >
      {renderView()}
    </Modal>
  );
};

export default ModalAttachEvidence;
