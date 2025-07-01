"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Input, Modal, Select, Table, TableProps, Typography } from "antd";
import { Trash } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { editAccountingAdjustments } from "@/services/accountingAdjustment/accountingAdjustment";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import InputMoney from "@/components/atoms/inputs/InputMoney/InputMoney";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

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
  applicationId?: number;
}

interface IEditAdjustment {
  rows: IFinancialDiscountForm[];
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows?: IApplyTabRecord[] | undefined;
  // eslint-disable-next-line no-unused-vars
  handleDeleteRow?: (id: number) => void;
}

const ModalEditAdjustments = ({ isOpen, onClose, selectedRows, handleDeleteRow }: Props) => {
  const height = useScreenHeight();
  const { showMessage } = useMessageApi();
  const { data: motives } = useFinancialDiscountMotives();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRow, setActiveRow] = useState<IFinancialDiscountForm>();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<IEditAdjustment>();

  const { fields, remove } = useFieldArray({
    control,
    name: "rows"
  });

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedRows) {
      const defaultRows = selectedRows.map((row) => ({
        id: row.financial_discount_id || 0,
        adjustmentId: row.erp_id?.toString() || "",
        requirementType: {
          value: row.motive_id || 0,
          label: row.motive_description || ""
        },
        commentary: row.entity_description || "",
        amount: String(row.current_value) || "",
        applicationId: row.id
      }));

      reset({ rows: defaultRows });
    }
  }, [selectedRows, reset]);

  const onSubmit = async (data: IEditAdjustment) => {
    setIsSubmitting(true);
    const rows = data.rows.map((row) => ({
      ...row,
      amount:
        Number(
          typeof row.amount === "string"
            ? row.amount.replaceAll(".", "").replaceAll(",", ".")
            : row.amount?.toString().replaceAll(".", "").replaceAll(",", ".")
        ) || 0
    }));

    try {
      await editAccountingAdjustments(rows);
      showMessage("success", "Ajustes editados correctamente");
      onClose();
    } catch (error) {
      showMessage("error", "Error al editar ajustes");
    }
    setIsSubmitting(false);
  };

  const handleRemove = () => {
    try {
      handleDeleteRow && activeRow && handleDeleteRow(activeRow.applicationId || 0);
      remove(fields.findIndex((field) => field.id === activeRow?.id));
      setActiveRow(undefined);
      setIsRemoveModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar ajuste:", error);
    }
  };

  const columns: TableProps<IFinancialDiscountForm>["columns"] = [
    {
      title: "Ajuste contable",
      dataIndex: "adjustmentId",
      key: "adjustmentId",
      width: 150
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
              labelInValue
            />
          )}
        />
      ),
      width: 250
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
      }
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
      render: (_: any, row) => (
        <IconButton
          icon={<Trash size={20} className="icon" />}
          className="iconDocument"
          onClick={() => {
            setActiveRow(row);
            setIsRemoveModalOpen(true);
          }}
        />
      ),
      width: 50
    }
  ];

  return (
    <>
      <Modal
        className="modalEditAdjustments"
        width="80%"
        footer={null}
        open={isOpen && !isRemoveModalOpen}
        closable={false}
        destroyOnClose
      >
        <Title level={4}>Edición de ajustes</Title>

        <Table
          className="modalEditAdjustments__adjustmentsTable"
          columns={columns}
          dataSource={fields.map((item, index) => ({
            ...item,
            key: item.id || item.adjustmentId || index
          }))}
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

      <ModalRemove
        name="ajuste"
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setActiveRow(undefined);
          setIsRemoveModalOpen(false);
        }}
        onRemove={handleRemove}
      />
    </>
  );
};

export default ModalEditAdjustments;
