import { Flex, Typography } from "antd";
import { DocumentButton } from "../DocumentButton/DocumentButton";
const { Text } = Typography;
import "./uploaddocumentbutton.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslations } from "use-intl";

export interface FileObject {
  docReference: string;
  file: File | undefined;
}
interface infoObject {
  file: File;
  fileList: File[];
}
interface DocumentProps {
  title: string;
  isMandatory: boolean;
  setFiles: Dispatch<SetStateAction<FileObject[]>>;
  containerClassName?: string;
  draggerClassname?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const UploadDocumentButton = ({
  title,
  isMandatory,
  setFiles,
  containerClassName,
  draggerClassname,
  disabled,
  children
}: DocumentProps) => {
  const t = useTranslations("components.uploadDocumentButton");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (children) setUploadedFile(null);
  }, [children]);

  const handleOnChange: any = (info: infoObject) => {
    const { file: rawFile } = info;

    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);

      if (fileSizeInMB > 30) {
        alert(t("fileTooLarge"));
        return;
      }

      setUploadedFile(rawFile);

      const fileObject = { docReference: title, file: rawFile };
      updateFiles(fileObject);
    }
  };

  const handleOnDrop: any = (e: any) => {
    const rawFile = e.dataTransfer.files;

    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);

      if (fileSizeInMB > 30) {
        alert(t("fileTooLarge"));
        return;
      }
      setUploadedFile(rawFile);

      const fileObject = { docReference: title, file: rawFile };
      updateFiles(fileObject);
    }
  };

  const handleOnDelete = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setUploadedFile(null);
    const fileObject = { docReference: title, file: undefined };

    setFiles((prevState: FileObject[]) => {
      const existingFileIndex = prevState.findIndex(
        (file) => file.docReference === fileObject.docReference
      );

      if (existingFileIndex !== -1) {
        prevState.splice(existingFileIndex, 1);
      }

      return prevState;
    });
  };

  const updateFiles = (newFile: FileObject) => {
    setFiles((prevState: FileObject[]) => {
      // Busca si ya existe un archivo con la misma docReference
      const existingFileIndex = prevState.findIndex(
        (file) => file.docReference === newFile.docReference
      );

      if (existingFileIndex !== -1) {
        // Si el archivo ya existe, crea una copia del estado actual
        const updatedFiles = [...prevState];
        // Reemplaza el archivo existente con el nuevo archivo
        updatedFiles[existingFileIndex] = newFile;
        return updatedFiles;
      } else {
        // Si el archivo no existe, simplemente añade el nuevo archivo al estado
        return [...prevState, newFile];
      }
    });
  };

  return (
    <div className={`uploaddocumentbutton ${containerClassName}`}>
      <Flex vertical justify="center">
        <Text className="titleDocument">{title}</Text>
        <Text className="descriptionDocument">*{isMandatory ? t("required") : t("optional")}</Text>
      </Flex>
      <DocumentButton
        title={title}
        handleOnChange={handleOnChange}
        handleOnDrop={handleOnDrop}
        handleOnDelete={handleOnDelete}
        fileName={uploadedFile?.name}
        fileSize={uploadedFile?.size}
        disabled={disabled}
        className={draggerClassname}
      >
        {children}
      </DocumentButton>
    </div>
  );
};
