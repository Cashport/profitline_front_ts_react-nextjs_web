import { useEffect, useState } from "react";
import { Button, Flex, Modal, Select, Typography } from "antd";
import { Plus } from "phosphor-react";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { uploadBalanceFile } from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";
import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import styles from "./modalUploadBalanceFile.module.scss";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";

const { Title } = Typography;

const MAX_FILE_MB = 30;

interface ModalUploadBalanceFileProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
  onUploaded?: () => void;
}

export function ModalUploadBalanceFile({
  isOpen,
  onClose,
  record,
  onUploaded
}: ModalUploadBalanceFileProps) {
  const t = useTranslations("balances.upload");
  const { showMessage } = useMessageApi();
  const [tipoNovedadId, setTipoNovedadId] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [observation, setObservation] = useState("");
  const [clientDocuments, setClientDocuments] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: motives, isLoading: motivesLoading } = useFinancialDiscountMotives();

  // Reset local state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setTipoNovedadId(null);
      setFiles([]);
      setObservation("");
      setClientDocuments("");
    }
  }, [isOpen]);

  const isValidSize = (file: File) => {
    if (file.size / (1024 * 1024) > MAX_FILE_MB) {
      showMessage("error", t("tooLarge", { max: MAX_FILE_MB }));
      return false;
    }
    return true;
  };

  const addFiles = (incoming: File[]) => {
    const accepted = incoming.filter((file) => {
      if (!isValidSize(file)) return false;
      if (files.some((existing) => existing.name === file.name)) {
        showMessage("error", t("duplicate"));
        return false;
      }
      return true;
    });
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
  };

  // Dragger change on the first DocumentButton
  const handleOnChangeDocument = (info: any) => {
    const uploaded = info?.file as File | undefined;
    if (uploaded) addFiles([uploaded]);
  };

  // Hidden input behind the "Cargar otro documento" button
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = ""; // allow re-selecting the same file name later
  };

  const handleRemoveFile = (fileName: string) =>
    setFiles((prev) => prev.filter((file) => file.name !== fileName));

  const handleOk = async () => {
    if (files.length === 0 || !tipoNovedadId || !observation.trim() || !clientDocuments.trim())
      return;

    setIsLoading(true);
    try {
      await uploadBalanceFile(record.id, {
        financialDiscountMotiveId: tipoNovedadId,
        observation: observation.trim(),
        file: files[0],
        clientDocuments: clientDocuments.trim() || undefined
      });
      showMessage("success", t("success"));
      onUploaded?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");
      showMessage("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={onClose}
      title={<Title level={4}>{t("title")}</Title>}
      footer={
        <FooterButtons
          titleConfirm={t("title")}
          onClose={onClose}
          handleOk={handleOk}
          isConfirmDisabled={
            files.length === 0 || !tipoNovedadId || !observation.trim() || !clientDocuments.trim()
          }
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="1rem" style={{ marginBottom: "1rem" }}>
        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">{t("type")}</h4>
          <Select
            placeholder={t("typePlaceholder")}
            style={{ width: "100%", height: 38 }}
            options={motives?.map((motive) => ({ value: motive.id, label: motive.name })) || []}
            loading={motivesLoading}
            value={tipoNovedadId}
            onChange={(value) => setTipoNovedadId(value)}
          />
        </Flex>

        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">{t("support")}</h4>

          <div className={styles.documents}>
            {/* first slot: empty -> opens picker; filled -> shows file + delete */}
            <DocumentButton
              title={files[0]?.name}
              fileName={files[0]?.name}
              fileSize={files[0]?.size}
              handleOnChange={handleOnChangeDocument}
              handleOnDelete={() => handleRemoveFile(files[0]?.name)}
            />
            {/* {files.slice(1).map((file) => (
              <DocumentButton
                key={file.name}
                title={file.name}
                fileName={file.name}
                fileSize={file.size}
                handleOnChange={handleOnChangeDocument}
                handleOnDelete={() => handleRemoveFile(file.name)}
              />
            ))} */}
          </div>
          {/* 
          {files.length > 0 && (
            <>
              <Button
                type="text"
                className={styles.addDocument}
                icon={<Plus size={16} />}
                onClick={() => document.getElementById("balanceFileInput")?.click()}
              >
                Cargar otro documento
              </Button>
              <input
                type="file"
                id="balanceFileInput"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept={FILE_EXTENSIONS.join(", ")}
              />
            </>
          )} */}
        </Flex>

        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">{t("observation")}</h4>
          <textarea
            className={styles.textarea}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder={t("observationPlaceholder")}
            rows={2}
          />
        </Flex>
        <Flex vertical gap="0.25rem">
          <h4 className="inputTitle">{t("clientDocument")}</h4>
          <textarea
            className={styles.textarea}
            value={clientDocuments}
            onChange={(e) => setClientDocuments(e.target.value)}
            rows={1}
          />
        </Flex>
      </Flex>
    </Modal>
  );
}
