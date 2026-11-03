import React from "react";
import { Button, Typography, Flex } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { FileArrowUp, FileArrowDown } from "@phosphor-icons/react";

const { Text } = Typography;

interface FileObject {
  docReference: string; // Referencia única del documento
  name?: string; // Nombre del archivo
  uploadedAt?: string; // Fecha de subida
  url?: string; // URL del archivo (si está en el servidor)
  file?: File; // Objeto File (si está cargado localmente)
}

interface DocumentCardProps {
  doc?: FileObject; // Documento actual (puede ser undefined)
  handleDelete: (index: number) => void; // Función para eliminar el archivo
  handleUpload: () => void; // Función para agregar un nuevo archivo
  index: number;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, handleDelete, handleUpload, index }) => {
  const handleClick = () => {
    if (!doc) {
      handleUpload(); // Si no hay documento, permite subir uno
    } else if (doc.url) {
      window.open(doc.url, "_blank"); // Abre el archivo en una nueva pestaña
    } else if (doc.file) {
      // Descarga el archivo localmente
      const link = document.createElement("a");
      link.href = URL.createObjectURL(doc.file);
      link.download = doc.name || "document";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <Button
      onClick={handleClick}
      style={{
        backgroundColor: "#F9F9F9",
        border: "1px solid #EAEAEA",
        borderRadius: 8,
        padding: "8px 16px",
        textAlign: "left",
        width: "100%"
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          {doc ? <FileArrowUp size={16} /> : <FileArrowDown size={16} color="#7B7B7B" />}
          <Flex vertical>
            <Text>{doc?.name || "Seleccionar archivo"}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {doc?.uploadedAt || "PDF, Word, PNG. (Tamaño max 30MB)"}
            </Text>
          </Flex>
        </Flex>
        {doc && (
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Evita que se dispare el click en el botón principal
              handleDelete(index);
            }}
            style={{ color: "#FF4D4F" }}
          />
        )}
      </Flex>
    </Button>
  );
};

export default DocumentCard;
