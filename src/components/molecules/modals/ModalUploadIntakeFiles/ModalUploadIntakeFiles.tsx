import { useState } from "react";
import { message, Modal, Typography } from "antd";
import type { UploadFile } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { uploadIntakeFile } from "@/services/dataQuality/dataQuality";

import "./modalUploadIntakeFiles.scss";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  archiveId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalUploadIntakeFiles = ({ isOpen, archiveId, onClose, onSuccess }: Props) => {
  const t = useTranslations("modals.uploadIntakeFiles");
  const tCommon = useTranslations("common");
  const tShared = useTranslations("modals.shared");
  const [ingestaFile, setIngestaFile] = useState<File | undefined>();
  const [pruebaFile, setPruebaFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setIngestaFile(undefined);
    setPruebaFile(undefined);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetState();
    onClose();
  };

  const extractFile = (info: UploadChangeParam<UploadFile<any>>): File | undefined => {
    const raw = info.file as unknown as File & { originFileObj?: File };
    return raw?.originFileObj ?? raw;
  };

  const handleChange =
    (setter: (file: File | undefined) => void) => (info: UploadChangeParam<UploadFile<any>>) => {
      const file = extractFile(info);
      if (!file) return;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 100) {
        message.error(t("fileTooLarge"));
        return;
      }
      setter(file);
    };

  const handleDelete =
    (setter: (file: File | undefined) => void) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setter(undefined);
    };

  const handleSubmit = async () => {
    if (!ingestaFile || archiveId === null) return;
    setIsLoading(true);
    const hide = message.open({
      type: "loading",
      content: t("uploading"),
      duration: 0
    });
    try {
      await uploadIntakeFile(archiveId, ingestaFile, pruebaFile);
      message.success(t("success"));
      onSuccess?.();
      resetState();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("error"));
    } finally {
      hide();
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>{t("title")}</Title>}
      className="modalUploadIntakeFiles"
      width={600}
      footer={
        <FooterButtons
          titleConfirm={tCommon("actions.send")}
          titleCancel={tCommon("actions.cancel")}
          onClose={handleClose}
          handleOk={handleSubmit}
          isConfirmDisabled={!ingestaFile}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <div className="fileRow">
        <Text className="label">{t("intake")}</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title={t("intake")}
            fileName={ingestaFile?.name}
            fileSize={ingestaFile?.size}
            handleOnChange={handleChange(setIngestaFile)}
            handleOnDelete={handleDelete(setIngestaFile)}
          />
        </div>
      </div>
      <div className="fileRow">
        <div className="label">
          <Text>{t("test")}</Text>
          <em className="opt">{tShared("optional")}</em>
        </div>
        <div className="documentButtonWrapper">
          <DocumentButton
            title={t("test")}
            fileName={pruebaFile?.name}
            fileSize={pruebaFile?.size}
            handleOnChange={handleChange(setPruebaFile)}
            handleOnDelete={handleDelete(setPruebaFile)}
          />
        </div>
      </div>
    </Modal>
  );
};
