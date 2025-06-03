"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Modal, Select, Table, TableProps, Typography } from "antd";
import { Trash } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import InputMoney from "@/components/atoms/inputs/InputMoney/InputMoney";

import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import "./modalEditAdjustments.scss";

const { Title } = Typography;

export interface IFinancialDiscountForm {
  id: number;
  adjustmentId: string;
  requirementType?: {
    value: string | number;
    label: string;
  };
  commentary?: string;
  amount?: string | number;
}

interface IEditAdjustment {
  rows: IFinancialDiscountForm[];
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows?: FinancialDiscount[] | undefined;
}

const ModalEditAdjustments = ({ isOpen, onClose, selectedRows }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSelectedRows, setLocalSelectedRows] = useState<IFinancialDiscountForm[]>([]);
  const height = useScreenHeight();
  const { data: motives } = useFinancialDiscountMotives();

  const { showMessage } = useMessageApi();

  const { control, handleSubmit, reset } = useForm<IEditAdjustment>();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedRows) {
      const defaultRows = selectedRows.map((row) => ({
        id: row.id,
        adjustmentId: row.erp_id?.toString() || "",
        requirementType: {
          value: String(row.motive_id) || "",
          label: row.motive_name || ""
        },
        commentary: row.comments || "",
        amount: String(row.current_value) || ""
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

  const onSubmit = async (data: IEditAdjustment) => {
    setIsSubmitting(true);

    try {
      console.info("Submitting audit data:", data.rows);
      showMessage("success", "Ajustes editados correctamente");
      // onClose();
    } catch (error) {
      showMessage("error", "Error al editar ajustes");
    }
    setIsSubmitting(false);
  };

  const columns: TableProps<IFinancialDiscountForm>["columns"] = [
    {
      title: "Ajuste contable",
      dataIndex: "adjustmentId",
      key: "adjustmentId",
      width: 130
    },
    {
      title: "Motivo",
      dataIndex: "requirementType",
      key: "requirementType",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.requirementType`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder=" - "
              options={motives?.map((motive) => ({ value: motive.id, label: motive.name })) || []}
              className="selectEditAdjustments"
            />
          )}
        />
      )
    },
    {
      title: "Comentario",
      dataIndex: "commentary",
      key: "commentary",
      render: (_: any, record: any, index: number) => {
        return (
          <Controller
            control={control}
            name={`rows.${index}.commentary`}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                placeholder="Agrega un comentario"
                className={
                  fieldState.invalid
                    ? "inputEditAdjustments inputEditAdjustments__error"
                    : "inputEditAdjustments"
                }
              />
            )}
          />
        );
      },
      width: 300
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: any, index: number) => (
        <InputMoney
          hiddenTitle
          name={`rows.${index}.amount`}
          control={control}
          titleInput="Valor"
          placeholder="Valor"
          validationRules={{
            required: "Valor es obligatorio",
            validate: (value) => parseFloat(value) != 0 || "El valor debe ser distinto a 0"
          }}
          allowNegative={true}
          // error={errors?.rows?.[index]?.amount}
          fixedDecimalScale={true}
          customClassName="inputEditAdjustments"
        />
      ),
      width: 200
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: () => {
        return <IconButton icon={<Trash size={26} className="icon" />} className="iconDocument" />;
      },
      width: 60
    }
  ];

  const tableData = useMemo(() => {
    if (!selectedRows) return [];

    return selectedRows.map((row) => ({
      id: row.id,
      adjustmentId: row.erp_id?.toString() || "",
      requirementType: {
        value: row.motive_id ?? "",
        label: row.motive_name || ""
      },
      commentary: row.comments || "",
      amount: row.current_value ?? ""
    }));
  }, [selectedRows]);

  return (
    <Modal
      className="modalEditAdjustments"
      width="80%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>Edición de ajustes</Title>

      <Table
        className="modalEditAdjustments__adjustmentsTable"
        columns={columns}
        dataSource={tableData.map((item) => ({ ...item, key: item.id }))}
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ y: height - 400 }}
      />

      <div className="modalEditAdjustments__footer">
        <FooterButtons
          className="modalEditAdjustments__footerButtons"
          titleCancel="Volver"
          onClose={() => onClose(true)}
          handleOk={handleSubmit(onSubmit)}
          titleConfirm="Guardar"
          isConfirmLoading={isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default ModalEditAdjustments;
