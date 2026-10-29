import React from "react";
import { Upload, Button, Typography, Flex, Card } from "antd";
import { FileArrowUp, Trash } from "phosphor-react";
import "./index.scss";
const { Text, Title } = Typography;

interface UploadButtonProps {
  onUpload: (file: File) => boolean | Promise<void>;
  handleRemoveFile: () => void;
  file?: File | null;
  accept?: string;
  buttonText?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onUpload,
  handleRemoveFile,
  file,
  accept = ".pdf,.docx,.xlsx",
  buttonText = "Cargar plantilla"
}) => {
  return (
    <div style={{ width: "100%" }}>
      <Upload
        beforeUpload={(file) => {
          onUpload(file);
          return false; // Evita la carga automática
        }}
        showUploadList={false}
        accept={accept}
        style={{ width: "100%" }}
        className="upload-button"
      >
        {file ? (
          <Card
            style={{
              background: "#f5f5f5",
              borderRadius: "8px",
              display: "relative",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Flex vertical gap={4} align="center">
              <FileArrowUp size={16} />
              <Title level={5} style={{ fontWeight: 400, marginBottom: 0 }}>
                {file.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 300 }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Flex>
            <Button
              type="text"
              icon={<Trash size={16} />}
              style={{ position: "absolute", top: 4, right: 4 }}
              onClick={handleRemoveFile}
            />
          </Card>
        ) : (
          <Button
            type="dashed"
            style={{
              width: "100%",
              height: 46,
              fontSize: 14,
              fontWeight: 300,
              borderStyle: "solid"
            }}
            icon={<FileArrowUp size={16} />}
          >
            {file ? "Cambiar archivo" : buttonText}
          </Button>
        )}
      </Upload>
    </div>
  );
};

export default UploadButton;
