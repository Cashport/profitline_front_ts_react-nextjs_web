"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Input, message, Modal, Select, Table, TableProps, Tooltip } from "antd";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Trash } from "phosphor-react";

import {
  balanceLegalization,
  getAvailableAdjustmentsForSelect,
  getFinancialRecordsToLegalize,
  IAdjustmentsForSelect,
  IAdjustmentToLegalize
} from "@/services/accountingAdjustment/accountingAdjustment";
import { extractSingleParam } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import "./modalBalanceLegalization.scss";

interface IAdjustmentRow {
  financialDiscountId: number;
  difference?: number;
  financialRecords?: {
    id: number;
    erp_id: string;
    current_value: number;
    fullOption?: IAdjustmentsForSelect; // Para guardar el objeto completo
    title: string;
  };
  observation?: string;
}

interface IBalanceLegalizationFormValues {
  rows: IAdjustmentRow[];
}
interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedAdjustments?: FinancialDiscount[];
}

const ModalBalanceLegalization = ({ isOpen, onClose, selectedAdjustments }: Props) => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const clientId = clientIdParam || "";

  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();

  const [adjustmentsToLegalize, setAdjustmentsToLegalize] = useState<IAdjustmentToLegalize[]>([]);
  const [selectAdjustments, setSelectAdjustments] = useState<IAdjustmentsForSelect[]>([]);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<IBalanceLegalizationFormValues>();

  const { fields, remove } = useFieldArray({
    control,
    name: "rows"
  });

  const closeModal = () => {
    onClose();
  };

  useEffect(() => {
    const fetchFinancialRecords = async () => {
      if (!selectedAdjustments?.length) return;
      try {
        const res = await getFinancialRecordsToLegalize(selectedAdjustments.map((item) => item.id));
        setAdjustmentsToLegalize(res);

        if (res.length === 0) {
          message.warning("No hay ajustes disponibles para legalizar");
        }
      } catch (error) {
        message.error("Error al cargar ajustes a legalizar");
      }
    };
    const fetchSelectAdjustments = async () => {
      try {
        const res = await getAvailableAdjustmentsForSelect(clientId);
        setSelectAdjustments(res);

        if (res.length === 0) {
          message.warning("No hay ajustes disponibles para el select");
        }
      } catch (error) {
        message.error("Error al cargar ajustes disponibles");
      }
    };

    fetchFinancialRecords();
    fetchSelectAdjustments();
  }, [selectedAdjustments]);

  useEffect(() => {
    if (adjustmentsToLegalize.length > 0 && selectedAdjustments?.length) {
      const defaultRows: IAdjustmentRow[] = adjustmentsToLegalize.map((item) => {
        return {
          financialDiscountId: item.id,
          observation: ""
        };
      });

      reset({ rows: defaultRows });
    }
  }, [adjustmentsToLegalize, selectedAdjustments, reset]);

  const onSubmit = async (data: IBalanceLegalizationFormValues) => {
    setLoadingRequest(true);

    try {
      const balances = data.rows.map((row) => ({
        financialDiscountId: row.financialDiscountId,
        financialDiscountIdBalance: row.financialRecords?.fullOption?.id || 0,
        observation: row.observation || "",
        financialRecordIds:
          adjustmentsToLegalize
            .find((item) => item.id === row.financialDiscountId)
            ?.financialRecordsAsociate.map((record) => record.id) || []
      }));

      await balanceLegalization(balances);
      message.success("Saldos legalizados correctamente");
      onClose();
    } catch (error) {
      message.error(
        `Error al legalizar los saldos: ${error instanceof Error ? error.message : "desconocido"}`
      );
    }
    setLoadingRequest(false);
  };

  const columns: TableProps<IAdjustmentRow>["columns"] = [
    {
      title: "Ajuste Cashport",
      dataIndex: "financialDiscountId",
      key: "financialDiscountId",
      render: (_: any, row) => {
        // Find the matching adjustment for display info
        const adjustment = adjustmentsToLegalize.find((a) => a.id === row.financialDiscountId);
        return (
          <Flex vertical className="modalBalanceLegalization__adjustmentInfo">
            <p className="modalBalanceLegalization__adjustmentInfo__id">{adjustment?.id}</p>
            <Tooltip title={adjustment?.comments}>
              <p className="modalBalanceLegalization__adjustmentInfo__comment">
                {adjustment?.comments}
              </p>
            </Tooltip>
          </Flex>
        );
      },
      width: 147
    },
    {
      title: "Monto",
      dataIndex: "ammount",
      key: "ammount",
      render: (_: any, row) => {
        const adjustment = adjustmentsToLegalize.find((a) => a.id === row.financialDiscountId);
        return (
          <span className="modalBalanceLegalization__amount fontMonoSpace">
            {formatMoney(adjustment?.ammount ?? 0)}
          </span>
        );
      },
      align: "right"
    },
    {
      title: "Factura Asociada",
      dataIndex: "financialDiscountId",
      key: "financialRecordsAsociate",
      render: (_: any, row) => {
        const adjustment = adjustmentsToLegalize.find((a) => a.id === row.financialDiscountId);
        return (
          <>
            {adjustment?.financialRecordsAsociate?.map((record) => (
              <p key={record.id} className="modalBalanceLegalization__invoiceId">
                {record.idErp ? record.idErp : " - "}
              </p>
            ))}
          </>
        );
      }
    },
    {
      title: "Ajuste ERP",
      dataIndex: "adjustment",
      key: "adjustment",
      render: (_: any, __: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.financialRecords`}
          rules={{ required: true }}
          render={({ field }) => {
            const allSelectedIds = watch("rows")
              .map((row, i) => (i !== index ? row.financialRecords?.fullOption?.id : undefined))
              .filter((id) => id !== undefined && id !== null);

            const filteredOptions = selectAdjustments.map((item) => ({
              value: item.id,
              label: (
                <Flex justify="space-between" gap={"6rem"}>
                  <Flex vertical>
                    <p className="modalBalanceLegalization__selectDropText">{item.erp_id}</p>
                    <p className="modalBalanceLegalization__selectDropText -small">
                      {item.comments}
                    </p>
                  </Flex>
                  <p className="modalBalanceLegalization__selectDropText fontMonoSpace">
                    {formatMoney(item.current_value)}
                  </p>
                </Flex>
              ),
              title: JSON.stringify(item),
              disabled: allSelectedIds.includes(item.id)
            }));

            return (
              <Select
                {...field}
                labelInValue
                value={
                  field.value
                    ? {
                        ...field.value,
                        label:
                          selectAdjustments.find((item) => item.id === field.value?.id)?.erp_id ||
                          field.value.fullOption?.erp_id
                      }
                    : undefined
                }
                options={filteredOptions}
                optionRender={(option) => option.label}
                className="modalBalanceLegalization__selectAdjustment"
                onChange={(option) => {
                  const originalItem = option.title ? JSON.parse(option.title) : undefined;
                  const newOption = {
                    ...option,
                    fullOption: originalItem
                  };
                  field.onChange(newOption);
                }}
                placeholder=" - "
                popupMatchSelectWidth={false}
              />
            );
          }}
        />
      ),
      width: 145
    },
    {
      title: "Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: (_: any, row, index) => {
        const watchedRow = watch(`rows.${index}.financialRecords`);
        const adjustment = adjustmentsToLegalize.find((a) => a.id === row.financialDiscountId);
        const currentAdjustmentAmount = adjustment?.ammount ?? 0;
        const currentValueSelect = watchedRow?.fullOption?.current_value || 0;
        return (
          <span className="fontMonoSpace">
            {formatMoney(currentAdjustmentAmount - currentValueSelect)}{" "}
          </span>
        );
      },
      align: "right"
    },
    {
      title: "Observación",
      dataIndex: "observation",
      key: "observation",
      render: (_: any, row, index) => (
        <Controller
          control={control}
          name={`rows.${index}.observation`}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              placeholder="Agrega un comentario"
              className={fieldState.invalid ? "inputText inputText__error" : "inputText"}
            />
          )}
        />
      ),
      width: 300
    },
    {
      title: "",
      dataIndex: "",
      key: "actions",
      render: (_: any, __, index) => {
        return (
          <span className="modalBalanceLegalization__iconActions">
            <IconButton
              onClick={() => remove(index)}
              icon={<Trash size={16} className="icon" />}
              className="iconDocument"
            />
          </span>
        );
      },
      width: 60
    }
  ];

  return (
    <Modal
      className="modalBalanceLegalization"
      width={1080}
      footer={null}
      open={isOpen}
      onCancel={closeModal}
      destroyOnClose
    >
      <h3 className="modalBalanceLegalization__title">Legalización de Saldos</h3>
      <p className="modalBalanceLegalization__description">
        Selecciona la Nota crédito generada para la Legalización del saldo.
      </p>

      <Table
        className="modalBalanceLegalization__documentsTable"
        columns={columns}
        dataSource={fields.map((item) => ({ ...item, key: item.id }))}
        pagination={false}
        scroll={{ y: height - 400 }}
      />

      <FooterButtons
        className="modalAuditRequirements__footerButtons"
        onClose={() => onClose(true)}
        handleOk={handleSubmit(onSubmit)}
        isConfirmLoading={loadingRequest}
      />
    </Modal>
  );
};

export default ModalBalanceLegalization;
