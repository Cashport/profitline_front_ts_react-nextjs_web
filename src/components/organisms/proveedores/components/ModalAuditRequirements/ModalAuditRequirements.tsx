"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Modal, Select, Table, TableProps, Typography } from "antd";
import { DownloadSimple, Sparkle } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";

import { Document } from "../../Form/types";

import "./modalAuditRequirements.scss";
const { Title } = Typography;

interface ISelect {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows: Document[] | undefined;
}

const ModalAuditRequirements = ({ isOpen, onClose, selectedRows }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("selectedRows", selectedRows);

  const { showMessage } = useMessageApi();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<any>();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    console.log("data", data);
    showMessage("info", "Asignando cliente a los requerimientos seleccionados");
  };

  const columns: TableProps<{
    requrementType: string;
    requirementsState: string;
    audit: undefined;
    commentary: undefined;
    document: undefined;
  }>["columns"] = [
    {
      title: "Tipo de requerimiento",
      dataIndex: "requrementType",
      key: "requrementType"
    },
    {
      title: "Estado",
      dataIndex: "requirementsState",
      key: "requirementsState"
    },
    {
      title: "Auditar",
      dataIndex: "audit",
      key: "audit",
      render: (text: any) => {
        return (
          <Select
            placeholder=" - "
            options={[
              {
                value: "Aprobado",
                label: "Aprobado"
              },
              {
                value: "En revision",
                label: "En revision"
              }
            ]}
            labelInValue
            className="selectAuditRequirements"
          />
        );
      },
      width: 200
    },
    {
      title: "Comentario",
      dataIndex: "commentary",
      key: "commentary",
      render: () => {
        return (
          <Input
            placeholder="Comentario"
            className="inputAuditRequirements"
            onChange={(e) => {
              setValue("commentary", e.target.value);
            }}
          />
        );
      }
    },
    {
      title: "",
      dataIndex: "document",
      key: "document",
      render: () => {
        return (
          <IconButton
            icon={<DownloadSimple size={26} className="icon" />}
            className="iconDocument"
          />
        );
      }
    }
  ];

  return (
    <Modal
      className="modalAuditRequirements"
      width="80%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>Auditar Requerimientos</Title>

      <Table
        className="modalAuditRequirements__documentsTable"
        columns={columns}
        dataSource={mockColumns}
        // rowSelection={rowSelection}
        pagination={false}
      />

      <div className="modalAuditRequirements__footer">
        <Button>
          <Sparkle size={24} color="#5b5252" />
          Analizar con Cashport IA
        </Button>
        <FooterButtons
          className="modalAuditRequirements__footerButtons"
          titleCancel="Volver"
          onClose={() => onClose(true)}
          handleOk={handleSubmit(onSubmit)}
          titleConfirm="Guardar"
          isConfirmLoading={isSubmitting}
          isConfirmDisabled={!isValid}
        />
      </div>
    </Modal>
  );
};

export default ModalAuditRequirements;

const mockColumns: {
  requrementType: string;
  requirementsState: string;
  audit: undefined;
  commentary: undefined;
  document: undefined;
}[] = [
  {
    requrementType: "RUT",
    requirementsState: "En revision",
    audit: undefined,
    commentary: undefined,
    document: undefined
  },
  {
    requrementType: "Referencia Comercial",
    requirementsState: "En revision",
    audit: undefined,
    commentary: undefined,
    document: undefined
  },
  {
    requrementType: "Referencia bancaria no mayor a 30 dias",
    requirementsState: "Aprobado IA",
    audit: undefined,
    commentary: undefined,
    document: undefined
  }
];
