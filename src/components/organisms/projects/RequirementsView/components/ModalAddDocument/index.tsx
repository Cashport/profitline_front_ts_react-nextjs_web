import React, { useState } from "react";
import { Modal, Table, Checkbox, Button, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileArrowDown, Plus } from "phosphor-react";
import Link from "next/link";
import { FooterButtons } from "@/components/molecules/FooterButtons/FooterButtons";
const { Text } = Typography;

interface Document {
  key: string;
  documentName: string;
  validity: string;
  template: string | null;
}

const mockedData: Document[] = [
  { key: "1", documentName: "RUT", validity: "30 días", template: null },
  { key: "2", documentName: "Referencia comercial", validity: "1 año", template: null },
  {
    key: "3",
    documentName: "Referencia bancaria no mayor a 30 días",
    validity: "30 días",
    template: null
  },
  { key: "4", documentName: "Cédula representante legal", validity: "-", template: null },
  {
    key: "5",
    documentName: "Formato selección, actualización de proveedores",
    validity: "2 años",
    template: "Documento"
  },
  {
    key: "6",
    documentName: "Formato selección, actualización de proveedores",
    validity: "2 años",
    template: "Documento"
  },
  {
    key: "7",
    documentName: "Formato selección, actualización de proveedores",
    validity: "1 año",
    template: "Documento"
  },
  { key: "8", documentName: "Certificado de antecedentes", validity: "2 años", template: null }
];
interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedClientType: number | null;
}

const DocumentModal = ({ isOpen, onClose }: Props) => {
  // const [isModalVisible, setIsModalVisible] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const columns: ColumnsType<Document> = [
    {
      title: "Documento",
      dataIndex: "documentName",
      key: "documentName",
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
      title: "Plantilla",
      dataIndex: "template",
      key: "template",
      render: (template: string) => {
        if (template?.length > 0) {
          return (
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
          );
        } else return <Text>-</Text>;
      }
    }
  ];

  const handleCheckboxChange = (key: string, isChecked: boolean) => {
    setSelectedRows((prev) =>
      isChecked ? [...prev, key] : prev.filter((rowKey) => rowKey !== key)
    );
  };

  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };

  // const handleAddDocuments = () => {
  //   console.log("Agregar documentos seleccionados:", selectedRows);
  //   setIsModalVisible(false);
  // };

  return (
    <Modal
      title="Documentos"
      open={isOpen}
      width={"53rem"}
      onCancel={onClose}
      // footer={[
      //   <Button key="cancel" onClick={onClose}>
      //     Cancelar
      //   </Button>,
      //   <Button key="submit" type="primary" onClick={() => {}} disabled={selectedRows.length === 0}>
      //     Agregar documentos
      //   </Button>
      // ]}
      footer={
        <FooterButtons
          backTitle={"Cancelar"}
          nextTitle={"Agregar documentos"}
          handleBack={onClose}
          handleNext={() => {}}
          nextDisabled={false}
          isSubmitting={false}
        />
      }
    >
      <Table
        dataSource={mockedData}
        columns={columns}
        pagination={false}
        rowKey="key"
        size="small"
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
                onClick={() => {}}
                icon={<Plus size={16} />}
              >
                Nuevo documento
              </Button>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Modal>
  );
};

export default DocumentModal;
