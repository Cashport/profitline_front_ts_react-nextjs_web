import { Dispatch, SetStateAction, useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import "./modaluploaddocument.scss";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import useModalUploadDocument from "@/hooks/useModalUploadDocument";
import { ISelectType } from "@/types/clients/IClients";

interface Props {
  isOpen: boolean;
  clientTypeId?: ISelectType;
  setIsOpenUpload: Dispatch<SetStateAction<boolean>>;
  setClientDocuments: Dispatch<SetStateAction<File[]>>;
  editing?: boolean;
}

interface FileObject {
  docReference: string;
  file: File | undefined;
}

const { Title, Text } = Typography;

export const ModalUploadDocument = ({
  isOpen,
  clientTypeId,
  setIsOpenUpload,
  setClientDocuments,
  editing
}: Props) => {
  // Hay un estado de files en el modal para poder dejar la posibilidad de verificacion
  // El estado de clientDocuments ya deberia contener todos los documentos necesarios
  const t = useTranslations("modals.uploadDocument");
  const tCommon = useTranslations("common");
  const [files, setFiles] = useState<FileObject[] | any[]>([]);
  const { data } = useModalUploadDocument(clientTypeId?.value);
  const handleOnSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const justDocuments = files.map((file) => file.file);
    setClientDocuments(justDocuments);
    setIsOpenUpload(false);
  };

  const handleOnCancel = () => {
    setIsOpenUpload(false);
    setFiles([]);
  };

  const _data = data?.data?.map(({ id, document_name, required }) => {
    return { id, title: document_name, isMandatory: required };
  });
  return (
    <Modal
      width={"40%"}
      open={isOpen}
      okButtonProps={{ className: "buttonOk" }}
      cancelButtonProps={{
        className: "buttonCancel"
      }}
      okText={editing ? t("okReplace") : t("okAttach")}
      cancelText={tCommon("actions.cancel")}
      title={<Title level={4}>{editing ? t("titleEdit") : t("titleUpload")}</Title>}
      className="modaluploaddocument"
      onCancel={handleOnCancel}
      onOk={handleOnSubmit}
    >
      <Text className="description">{editing ? t("descriptionEdit") : t("descriptionUpload")}</Text>
      <Flex vertical className="mainUploadDocuments">
        {_data &&
          _data?.map((file) => (
            <UploadDocumentButton
              key={file.id}
              title={file.title}
              isMandatory={file.isMandatory === 1}
              setFiles={setFiles}
            />
          ))}
      </Flex>
    </Modal>
  );
};
