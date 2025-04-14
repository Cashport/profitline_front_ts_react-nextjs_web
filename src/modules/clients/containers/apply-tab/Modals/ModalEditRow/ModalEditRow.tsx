import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, Modal, Spin, Table, TableProps } from "antd";
import { PencilLine, Plus, Trash } from "phosphor-react";
import { useForm } from "react-hook-form";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { extractSingleParam } from "@/utils/utils";
import { updateInvoiceOrPaymentAmount } from "@/services/applyTabClients/applyTabClients";

import useScreenHeight from "@/components/hooks/useScreenHeight";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

import "./modalEditRow.scss";

interface IApplicationTabRow {
  id: number;
  adjustment: string;
  amount: number;
}

interface IFormValues {
  adjustments: IApplicationTabRow[];
}
interface IModalEditRowProps {
  visible: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (succesfullyApplied?: Boolean) => void;
  row?: IApplyTabRecord;
  editing_type?: "invoice" | "payment" | "discount";
  // eslint-disable-next-line no-unused-vars
  handleCreateAdjustment?: (openedRow: IApplyTabRecord) => void;
}

const ModalEditRow: React.FC<IModalEditRowProps> = ({
  visible,
  onCancel,
  row,
  editing_type,
  handleCreateAdjustment
}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();
  const { showMessage } = useMessageApi();

  const [isEditing, setIsEditing] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm<IFormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setIsEditing(false);
      reset();
    };
  }, [visible]);

  const isLoading = false;
  const columns: TableProps<IApplicationTabRow>["columns"] = [
    {
      title: "Ajuste",
      dataIndex: "adjustment",
      key: "adjustment",
      render: (adjustment) => <p>{adjustment}</p>,
      width: "50%"
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      align: "center" as const,
      render: (amount, _record, index) => {
        if (isEditing) {
          return (
            <Flex className="amountColumn" justify="center" align="center">
              <InputFormMoney
                defaultValue={amount}
                hiddenTitle
                nameInput={`adjustments.${index}.amount`}
                control={control}
                error={
                  errors?.adjustments?.[index]?.amount && {
                    type: "required",
                    message: "Campo requerido"
                  }
                }
                customStyle={{ width: "80%", textAlign: "center" }}
                validationRules={{
                  pattern: {
                    value: /^-?\d+(\.\d+)?$/,
                    message: "Solo se permiten números"
                  }
                }}
              />

              <Button className="delete-btn" type="text">
                <Trash size={14} />
              </Button>
            </Flex>
          );
        } else {
          return <p>{formatMoney(amount)}</p>;
        }
      }
    }
  ];

  const handleEdit = () => {
    if (isEditing) {
      reset();
    }
    setIsEditing((prev) => !prev);
  };

  // Function to determine the title based on editing_type and row data
  const getModalTitle = (
    type: IModalEditRowProps["editing_type"],
    rowData?: IApplyTabRecord,
    onlyTitle?: Boolean
  ) => {
    let title = "";
    let id = "";

    switch (type) {
      case "invoice":
        title = "Factura";
        id = rowData?.id_erp?.toString() || "N/A";
        break;
      case "payment":
        title = "Pago";
        id = rowData?.payment_id?.toString() || "N/A";
        break;
      case "discount":
        title = "Ajuste";
        id = rowData?.financial_discount_id?.toString() || "N/A";
        break;
      default:
        title = "Factura";
        id = "N/A";
    }
    if (onlyTitle) return title;
    return `${title} ${id}`;
  };

  const handleSaveChanges = async (adjustmentsData: IFormValues) => {
    setLoading(true);
    try {
      // Update invoice or payment amount as the first "adjustment" is the invoice or payment amount itself
      await updateInvoiceOrPaymentAmount(
        projectId,
        clientId,
        row?.id ?? 0,
        adjustmentsData.adjustments[0].amount
      );
      showMessage("success", "Cambios guardados correctamente");
      onCancel(true);
    } catch (error) {
      showMessage("error", "Error al guardar los cambios");
    }

    // Merge form input (amount) with original row data (id and adjustment name)
    // Below is an example of how to merge the form data with the original row data for the adjustments if needed
    // const formattedData = row?.adjustments?.map((adjustment, index) => ({
    //   id: adjustment.adjustment_id,
    //   adjustment: adjustment.description,
    //   amount: adjustmentsData.adjustments[index]?.amount
    // }));

    setLoading(false);
  };

  const adjustmentsArray: IApplicationTabRow[] =
    row?.adjustments?.map((adjustment) => ({
      id: adjustment.adjustment_id,
      adjustment: adjustment.description,
      amount: adjustment.amount
    })) ?? [];

  const facturaObject: IApplicationTabRow = {
    id: row?.id ?? 0,
    adjustment: getModalTitle(editing_type, row, true),
    amount: row?.amount ?? 0
  };

  adjustmentsArray.unshift(facturaObject);

  return (
    <Modal
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      width={650}
      className="modalEditRow"
    >
      <div className="header">
        <h2>{getModalTitle(editing_type, row)}</h2>
        <Button
          className="header__editBtn"
          onClick={handleEdit}
          icon={<PencilLine size={20} weight="light" />}
        >
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {isLoading ? (
        <Flex justify="center" style={{ width: "100%", margin: "2rem 0" }}>
          <Spin />
        </Flex>
      ) : (
        <Table
          className="EditRowTable"
          columns={columns}
          dataSource={adjustmentsArray}
          pagination={false}
          rowClassName="TestRow"
          bordered
          scroll={{ y: height - 400, x: 100 }}
        />
      )}

      {editing_type === "invoice" && (
        <div className="create-adjustment">
          <button
            className="create-adjustment-btn"
            onClick={() => row && handleCreateAdjustment && handleCreateAdjustment(row)}
          >
            <Plus size={20} />
            Agregar ajuste
          </button>
        </div>
      )}

      <div className="modal-footer">
        <SecondaryButton fullWidth onClick={() => onCancel()}>
          Cancelar
        </SecondaryButton>
        <PrincipalButton
          disabled={!isEditing}
          fullWidth
          loading={loading}
          onClick={handleSubmit(handleSaveChanges)}
        >
          Guardar cambios
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalEditRow;
