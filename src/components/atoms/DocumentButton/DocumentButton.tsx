import { Button, Flex, Typography } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import { Upload } from "antd";
import { FileArrowUp, Trash } from "phosphor-react";
import { useTranslations } from "use-intl";
const { Dragger } = Upload;

import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import "./documentbutton.scss";

const { Text } = Typography;

const LEGACY_EMPTY_FILE_NAME = "Seleccionar archivo";

interface Props {
  title?: string;
  fileName?: string;
  fileSize?: any;
  className?: any;
  // eslint-disable-next-line no-unused-vars
  handleOnChange?: (info: UploadChangeParam<UploadFile<any>>) => void;
  handleOnDrop?: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOnDelete?: (_: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  onFileNameClick?: () => void;
}

export const DocumentButton = ({
  title = "file",
  fileName,
  fileSize,
  handleOnChange,
  handleOnDrop,
  handleOnDelete,
  disabled,
  className,
  children,
  onFileNameClick
}: Props) => {
  const t = useTranslations("components.documentButton");
  // Sin archivo: `fileName` vacío o el texto "Seleccionar archivo" que aún pasan algunos llamadores.
  const isEmpty = !fileName || fileName === LEGACY_EMPTY_FILE_NAME;
  const displayName = isEmpty ? t("selectFile") : fileName;
  if (fileSize === undefined) fileSize = t("allowedFiles");
  const props: UploadProps = {
    name: title,
    onChange: handleOnChange,
    onDrop: handleOnDrop,
    accept: FILE_EXTENSIONS.join(", "),
    showUploadList: false,
    customRequest: () => {
      return;
    },
    beforeUpload: (file) => {
      const reader = new FileReader();

      reader.onload = () => {};
      reader.readAsText(file);

      // Prevent upload
      return false;
    },
    disabled,
    onRemove: () => false
  };

  if (typeof fileSize !== "string") {
    const fileSizeMB = fileSize / (1024 * 1024);
    if (fileSizeMB < 1) {
      fileSize = `${(fileSize / 1024).toFixed(2)} KB`;
    } else {
      fileSize = `${fileSizeMB.toFixed(2)} MB`;
    }
  }

  return (
    <Dragger
      className={className ? `documentDragger ${className}` : "documentDragger"}
      {...props}
      openFileDialogOnClick={isEmpty}
    >
      {children ? (
        children
      ) : (
        <Flex justify="space-between" align="center">
          <Flex align="left" vertical>
            <Flex>
              <FileArrowUp size={"25px"} />
              <Text
                onClick={onFileNameClick}
                className={`nameFile ${onFileNameClick ? "clickable" : ""}`}
              >
                {displayName}
              </Text>
            </Flex>
            <Text className="sizeFile">{fileSize}</Text>
          </Flex>
          {!disabled && !isEmpty ? (
            <Button
              onClick={handleOnDelete}
              className="deleteDocButton"
              type="text"
              icon={<Trash size={"20px"} />}
            />
          ) : null}
        </Flex>
      )}
    </Dragger>
  );
};
