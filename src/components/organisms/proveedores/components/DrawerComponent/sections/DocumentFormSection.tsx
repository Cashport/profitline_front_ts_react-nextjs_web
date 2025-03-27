import React from "react";
import { Upload, Button, Typography, Flex } from "antd";
import ColumnText from "../../ColumnText/ColumnText";
import { FileArrowUp, Files } from "@phosphor-icons/react";
import { FileArrowDown, Plus, Trash } from "phosphor-react";
import { Control, useFieldArray } from "react-hook-form";
import "./documentsection.scss";
import { SupplierFormValues } from "../../../interfaces/FormData";

const { Link } = Typography;

interface DocumentSectionProps {
  templateUrl?: string; // URL opcional para descargar la plantilla
  name: `requirements.${number}.files`; // Ruta dentro del formulario para los documentos
  control: Control<SupplierFormValues, any>;
}
interface ExtendedFile extends File {
  uid: string;
}
const DocumentSection: React.FC<DocumentSectionProps> = ({ templateUrl, control, name }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  const handleUpload = (file: ExtendedFile) => {
    // console.log("FILE", file);
    const fileData = {
      uid: file.uid,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadedAt: new Date().toISOString(), // Agrega la fecha actual
      file // Guarda la referencia al archivo original
    };
    append(fileData); // Agrega el archivo al arreglo
    return false; // Impide la subida automática para control manual
  };
  const handleDelete = (index: number) => {
    remove(index); // Elimina el archivo del arreglo
  };

  // console.log("fields", fields);
  return (
    <ColumnText
      title="Documento"
      icon={<Files size={16} color="#7B7B7B" />}
      content={
        <Flex vertical style={{ width: "100%", alignItems: "flex-end" }} gap={12}>
          <Flex vertical gap={12} className={"document-section"}>
            {/* Renderización de documentos cargados */}
            {fields.length > 0 ? (
              fields.map((doc, index) => (
                <Flex
                  key={index}
                  align="center"
                  justify="center"
                  style={{
                    backgroundColor: "#F9F9F9",
                    border: "1px solid #EAEAEA",
                    borderRadius: 8,
                    padding: "16px",
                    textAlign: "center",
                    width: "100%",
                    position: "relative"
                  }}
                >
                  <Flex vertical align="center" gap={4} style={{ width: "100%" }}>
                    <FileArrowUp size={16} />
                    <p style={{ fontSize: 16, fontWeight: 400 }}>
                      {doc.name || "Seleccionar archivo"}
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 300 }}>{doc.uploadedAt}</p>
                  </Flex>
                  <Button
                    type="text"
                    icon={<Trash size={16} />}
                    onClick={() => handleDelete(index)}
                    style={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
                  />
                </Flex>
              ))
            ) : (
              // Estado inicial si no hay documentos
              <Upload beforeUpload={handleUpload} showUploadList={false} style={{ width: "100%" }}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    backgroundColor: "#F9F9F9",
                    border: "1px solid #EAEAEA",
                    borderRadius: 8,
                    padding: "16px",
                    textAlign: "center",
                    width: "100%",
                    cursor: "pointer"
                  }}
                >
                  <Flex vertical align="center" gap={4} style={{ width: "100%" }}>
                    <FileArrowUp size={16} />
                    <p style={{ fontSize: 16, fontWeight: 400 }}>Seleccionar archivo</p>
                    <p style={{ fontSize: 10, fontWeight: 300 }}>
                      PDF, Word, PNG. (Tamaño max 30MB)
                    </p>
                  </Flex>
                </Flex>
              </Upload>
            )}
          </Flex>
          {/* Botón para subir documentos */}
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            style={{ justifySelf: "flex-end" }}
          >
            <Button
              type="text"
              icon={<Plus size={16} />}
              style={{ padding: 0, justifyContent: "flex-end" }}
            >
              Agregar documento
            </Button>
          </Upload>
          {/* Enlace para descargar plantilla */}
          {templateUrl && (
            <Link href={templateUrl} target="_blank" style={{ textDecoration: "underline" }}>
              <Flex align="center" gap={4}>
                <FileArrowDown size={16} color="#1890FF" />
                Descargar plantilla
              </Flex>
            </Link>
          )}
        </Flex>
      }
    />
  );
};

export default DocumentSection;
