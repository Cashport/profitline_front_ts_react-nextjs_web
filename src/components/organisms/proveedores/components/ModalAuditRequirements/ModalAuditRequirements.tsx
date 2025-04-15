"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Modal, Select, Table, TableProps, Typography } from "antd";
import { DownloadSimple, Sparkle } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";

import { Document } from "../../Form/types";

import "./modalAuditRequirements.scss";
const { Title } = Typography;

interface IAuditTableRow {
  id: number;
  requrementType: string;
  requirementsState: string;
  audit?: string;
  commentary?: string;
  document?: any;
}

interface IAuditFormValues {
  rows: IAuditTableRow[];
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows: Document[] | undefined;
}

const ModalAuditRequirements = ({ isOpen, onClose, selectedRows }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSelectedRows, setLocalSelectedRows] = useState<Document[]>([]);

  const { showMessage } = useMessageApi();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid }
  } = useForm<IAuditFormValues>();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedRows) {
      const defaultRows = selectedRows.map((doc) => ({
        id: doc.id,
        requrementType: doc.name,
        requirementsState: doc.statusName,
        audit: undefined,
        commentary: undefined
      }));

      reset({ rows: defaultRows });
    }
  }, [selectedRows, reset]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setLocalSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys: localSelectedRows.map((item) => item.id),
    onChange: onSelectChange
  };

  const onSubmit = async (data: any) => {
    console.log("data", data);
    showMessage("info", "Asignando cliente a los requerimientos seleccionados");
  };

  const columns: TableProps<IAuditTableRow>["columns"] = [
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
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.audit`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder=" - "
              options={[
                { value: "Aprobado", label: "Aprobado" },
                { value: "En revision", label: "En revision" }
              ]}
              className="selectAuditRequirements"
            />
          )}
        />
      ),
      width: 200
    },
    {
      title: "Comentario",
      dataIndex: "commentary",
      key: "commentary",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.commentary`}
          rules={{ required: true }}
          render={({ field }) => (
            <Input {...field} placeholder="Comentario" className="inputAuditRequirements" />
          )}
        />
      )
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

  const tableData: IAuditTableRow[] = useMemo(() => {
    if (!selectedRows) return [];

    return selectedRows.map((doc) => ({
      id: doc.id,
      requrementType: doc.name,
      requirementsState: doc.statusName
    }));
  }, [selectedRows]);

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
        dataSource={tableData.map((item) => ({ ...item, key: item.id }))}
        rowSelection={rowSelection}
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
