import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileArrowDown, Plus } from "phosphor-react";
import { Table, Checkbox, Button, Typography, Flex } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getAvailableDocuments, IDocument } from "@/services/providers/providers";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import { FooterButtons } from "@/components/molecules/FooterButtons/FooterButtons";

const { Text } = Typography;

interface Form {
  key: string;
  formName: string;
  validity: string;
  questions_quantity: number;
}

const mockedForms: Form[] = [
  { key: "1", formName: "Formulario de Registro", validity: "30 días", questions_quantity: 10 },
  { key: "2", formName: "Encuesta de Satisfacción", validity: "1 año", questions_quantity: 5 },
  { key: "3", formName: "Formato de Evaluación", validity: "Sin límite", questions_quantity: 20 }
];

interface Props {
  onClose: () => void;
  selectedClientType: number | null;
  listType: "documents" | "forms";
  addNewDocument: () => void;
}

const DocumentList = ({ onClose, selectedClientType, listType, addNewDocument }: Props) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [documentList, setDocumentList] = useState<IDocument[]>();

  const height = useScreenHeight();

  const fetchAvailDocs = async () => {
    try {
      const response = await getAvailableDocuments(selectedClientType);
      console.log("Documentos disponibles:", response);
      setDocumentList(response);
    } catch (error) {
      console.error("Error al obtener documentos disponibles:", error);
    }
  };

  useEffect(() => {
    if (selectedClientType) {
      fetchAvailDocs();
    }
  }, [selectedClientType]);

  const documentColumns: ColumnsType<IDocument> = [
    {
      title: "Documento",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Checkbox
          checked={selectedRows.includes(record.id.toString())}
          onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
        >
          {text}
        </Checkbox>
      )
    },
    {
      title: "Vigencia",
      dataIndex: "validity",
      key: "validity",
      align: "left",
      render: (text) => <Text>{text ?? "-"}</Text>,
      width: 100
    },
    {
      title: "Plantilla",
      dataIndex: "template_url",
      key: "template_url",
      align: "center",
      render: (template: string) =>
        template ? (
          <Link
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline"
            }}
            href={`/requisitos/plantilla/${template}`}
          >
            Documento <FileArrowDown size={16} />
          </Link>
        ) : (
          <Text>-</Text>
        ),
      width: 100
    }
  ];
  const formColumns: ColumnsType<Form> = [
    {
      title: "Formulario",
      dataIndex: "formName",
      key: "formName",
      render: (text, record) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => handleCheckboxChange(record.key, e.target.checked)}
        >
          {text}
        </Checkbox>
      )
    },
    {
      title: "Vigencia",
      dataIndex: "validity",
      key: "validity"
    },
    {
      title: "Preguntas",
      dataIndex: "questions_quantity",
      key: "questions_quantity"
    }
  ];
  const handleCheckboxChange = (key: string | number, isChecked: boolean) => {
    setSelectedRows((prev) =>
      isChecked ? [...prev, key.toString()] : prev.filter((rowKey) => rowKey !== key.toString())
    );
  };
  const dataSource = listType === "documents" ? documentList : mockedForms;
  const columns = listType === "documents" ? documentColumns : formColumns;
  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };

  // const handleAddDocuments = () => {
  //   console.log("Agregar documentos seleccionados:", selectedRows);
  //   setIsModalVisible(false);
  // };

  return (
    <Flex vertical gap="1rem">
      <Table
        dataSource={dataSource as any}
        columns={columns as any}
        pagination={false}
        rowKey="key"
        size="small"
        scroll={{ y: height - 300 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={columns.length} index={0}>
              <Button
                type="primary"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                  color: "black",
                  padding: "0",
                  fontWeight: "500"
                }}
                onClick={addNewDocument}
                icon={<Plus size={16} />}
              >
                {`Nuevo ${listType === "documents" ? "documento" : "formulario"}`}
              </Button>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <FooterButtons
        backTitle={"Cancelar"}
        nextTitle={`Agregar ${listType === "documents" ? "documentos" : ""}`}
        handleBack={onClose}
        handleNext={() => {}}
        nextDisabled={false}
        isSubmitting={false}
      />
    </Flex>
  );
};

export default DocumentList;
