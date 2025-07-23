import { Button, Flex, Typography } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import { Upload } from "antd";
import { FileArrowUp, Trash } from "phosphor-react";
const { Dragger } = Upload;

import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import "./documentbutton.scss";

const { Text } = Typography;

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
  fileName = "Seleccionar archivo",
  fileSize = "PDF, Word, PNG, XLS, MSG, EML (Tamaño max 30mb)",
  handleOnChange,
  handleOnDrop,
  handleOnDelete,
  disabled,
  className,
  children,
  onFileNameClick
}: Props) => {
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
      openFileDialogOnClick={fileName === "Seleccionar archivo"}
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
                {fileName}
              </Text>
            </Flex>
            <Text className="sizeFile">{fileSize}</Text>
          </Flex>
          {!disabled && fileName !== "Seleccionar archivo" ? (
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
