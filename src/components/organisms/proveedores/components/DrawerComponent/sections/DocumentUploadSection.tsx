import React, { useState } from "react";
import { Upload, Button, Typography, Flex, message } from "antd";
import { FileArrowDown, Plus, Trash } from "phosphor-react";
import { FileArrowUp, Files } from "@phosphor-icons/react";

import { uploadDocument, deleteDocument } from "@/services/documents/documents";

import ColumnText from "../../ColumnText/ColumnText";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IDocument } from "@/interfaces/Document";

import "./documentsection.scss";

const { Link } = Typography;

interface DocumentSectionProps {
  templateUrl?: string;
  documents: IDocument[];
  subjectId: string;
  documentId: number;
  mutate: () => void;
  mutateSupplierInfo: () => void;
}

const DocumentUploadSection: React.FC<DocumentSectionProps> = ({
  templateUrl,
  documents,
  subjectId,
  documentId,
  mutate,
  mutateSupplierInfo
}) => {
  const [docToDelete, setDocToDelete] = useState<{
    openConfirmation: boolean;
    id: number;
    loadingRemove?: boolean;
  }>();
  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(subjectId, documentId, file);
      message.success("Documento subido exitosamente");
      mutate();
      mutateSupplierInfo();
    } catch (error) {
      message.error("Error al subir el documento");
      console.error("Error uploading document:", error);
    }
    return false;
  };

  const handleDeleteIcon = (id: number) => {
    setDocToDelete({
      openConfirmation: true,
      id
    });
  };

  const handleDelete = async () => {
    setDocToDelete((prev) => ({
      ...prev,
      loadingRemove: true,
      openConfirmation: prev?.openConfirmation ?? false,
      id: prev?.id ?? 0
    }));
    try {
      await deleteDocument(subjectId, documentId, docToDelete?.id || 0);
      message.success("Documento eliminado exitosamente");
      mutate();
      mutateSupplierInfo();
      setDocToDelete({
        openConfirmation: false,
        id: 0,
        loadingRemove: false
      });
    } catch (error) {
      message.error("Error al eliminar el documento");
      console.error("Error deleting document:", error);
    }
  };

  // Filter out documents with null values
  const validDocuments = documents.filter(
    (doc) => doc.id !== null && doc.url !== null && doc.name !== null
  );

  const showEmptyState = validDocuments.length === 0;

  return (
    <>
      <ColumnText
        title="Documento"
        icon={<Files size={16} color="#7B7B7B" />}
        content={
          <Flex vertical style={{ width: "100%", alignItems: "flex-end" }} gap={12}>
            <Flex vertical gap={12} className={"document-section"}>
              {!showEmptyState ? (
                validDocuments.map((doc) => (
                  <Flex
                    key={doc.id}
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
                      <Link href={doc.url} target="_blank">
                        <p style={{ fontSize: 16, fontWeight: 400 }}>{doc.name}</p>
                      </Link>
                    </Flex>
                    <Button
                      type="text"
                      icon={<Trash size={16} />}
                      onClick={() => handleDeleteIcon(doc.id)}
                      style={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
                    />
                  </Flex>
                ))
              ) : (
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  style={{ width: "100%" }}
                >
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
      <ModalConfirmAction
        isOpen={docToDelete?.openConfirmation || false}
        onClose={() => {
          setDocToDelete({
            openConfirmation: false,
            id: 0,
            loadingRemove: false
          });
        }}
        onOk={handleDelete}
        title="¿Está seguro de eliminar el documento?"
        okText="Eliminar"
        okLoading={docToDelete?.loadingRemove || false}
      />
    </>
  );
};

export default DocumentUploadSection;
