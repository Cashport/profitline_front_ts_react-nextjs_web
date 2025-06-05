"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Input, message, Modal, Select, Table, TableProps } from "antd";
import { Controller, useForm } from "react-hook-form";
import { Trash } from "phosphor-react";

import {
  getAvailableAdjustmentsForSelect,
  getFinancialRecordsToLegalize,
  IAdjustmentsForSelect,
  IAdjustmentsToLegalize,
  IFinancialRecordAsociate
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
  financialDiscountIdBalance: number;
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

  const [adjustmentsToLegalize, setAdjustmentsToLegalize] = useState<IAdjustmentsToLegalize[]>([]);
  const [selectAdjustments, setSelectAdjustments] = useState<IAdjustmentsForSelect[]>([]);

  const { control, handleSubmit, reset, watch } = useForm<IBalanceLegalizationFormValues>();
  const closeModal = () => {
    onClose();
  };

  useEffect(() => {
    const fetchFinancialRecords = async () => {
      if (!selectedAdjustments?.length) return;
      try {
        const res = await getFinancialRecordsToLegalize(selectedAdjustments.map((item) => item.id));
        setAdjustmentsToLegalize(res || []);
      } catch (error) {
        message.error("Error al cargar ajustes a legalizar");
        setAdjustmentsToLegalize(fakeAdjustments);
      }
    };
    const fetchSelectAdjustments = async () => {
      try {
        const res = await getAvailableAdjustmentsForSelect(clientId);
        setSelectAdjustments(res || []);
      } catch (error) {
        message.error("Error al cargar ajustes disponibles");
        setSelectAdjustments(mockSelectAdjustments);
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
          financialDiscountIdBalance: item.id, // O ajústalo si es distinto
          observation: ""
        };
      });

      reset({ rows: defaultRows });
    }
  }, [adjustmentsToLegalize, selectedAdjustments, reset]);
  const handleDeleteBalance = () => {
    message.success("Funcionalidad en desarrollo");
  };

  const onSubmit = (data: IBalanceLegalizationFormValues) => {
    console.info("Form data submitted:", data);
    message.success("Datos enviados correctamente");
  };

  const columns: TableProps<IAdjustmentsToLegalize>["columns"] = [
    {
      title: "Ajuste Cashport",
      dataIndex: "id",
      key: "id",
      render: (_, row) => {
        return (
          <Flex vertical className="modalBalanceLegalization__adjustmentInfo">
            <p className="modalBalanceLegalization__adjustmentInfo__ncId">{row.id}</p>
            <p className="modalBalanceLegalization__adjustmentInfo__devId">{row.comments}</p>
          </Flex>
        );
      },
      width: 150
    },
    {
      title: "Monto",
      dataIndex: "ammount",
      key: "ammount",
      render: (ammount) => {
        return <span className="modalBalanceLegalization__amount">{formatMoney(ammount)}</span>;
      },
      align: "right"
    },
    {
      title: "Factura Asociada",
      dataIndex: "financialRecordsAsociate",
      key: "financialRecordsAsociate",
      render: (financialRecordsAsociate: IFinancialRecordAsociate[]) => {
        return (
          <>
            {financialRecordsAsociate.map((record) => (
              <p key={record.id} className="modalBalanceLegalization__invoiceId">
                {record.idErp ? record.idErp : " - "}
              </p>
            ))}
          </>
        );
      },
      width: 100
    },
    {
      title: "Ajuste ERP",
      dataIndex: "adjustment",
      key: "adjustment",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.financialRecords`}
          rules={{ required: true }}
          render={({ field }) => (
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
              options={options}
              optionRender={(option) => option.label}
              className="modalBalanceLegalization__selectAdjustment"
              onChange={(option) => {
                const originalItem = option.title ? JSON.parse(option.title) : undefined;
                const newOption = {
                  ...option,
                  fullOption: originalItem // Guardamos el objeto original para poder usarlo después
                };
                field.onChange(newOption);
              }}
              placeholder=" - "
              popupMatchSelectWidth={false}
            />
          )}
        />
      ),
      width: 145
    },
    {
      title: "Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: (_: any, __: any, index: number) => {
        const watchedRow = watch(`rows.${index}.financialRecords`);
        const currentAdjustmentAmount = adjustmentsToLegalize[index].ammount;

        const currentValueSelect = watchedRow?.fullOption?.current_value || 0;

        return <span>{formatMoney(currentAdjustmentAmount - currentValueSelect)} </span>;
      },
      align: "right"
    },
    {
      title: "Observación",
      dataIndex: "observation",
      key: "observation",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.observation`}
          rules={{ required: false }}
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
      render: () => {
        return (
          <span className="modalBalanceLegalization__iconActions">
            <IconButton
              onClick={handleDeleteBalance}
              icon={<Trash size={16} className="icon" />}
              className="iconDocument"
            />
          </span>
        );
      },
      width: 60
    }
  ];

  const options = selectAdjustments.map((item) => ({
    value: item.id,
    label: (
      <Flex justify="space-between" gap={"6rem"}>
        <Flex vertical>
          <p className="modalBalanceLegalization__selectDropText">{item.erp_id}</p>
          <p className="modalBalanceLegalization__selectDropText -small">{item.comments}</p>
        </Flex>
        <p className="modalBalanceLegalization__selectDropText">{item.current_value}</p>
      </Flex>
    ),
    title: JSON.stringify(item) // Guardamos los datos originales en title porque label inValue los borra
  }));

  return (
    <Modal
      className="modalBalanceLegalization"
      width={1050}
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
        dataSource={adjustmentsToLegalize.map((item) => ({ ...item, key: item.id }))}
        pagination={false}
        scroll={{ y: height - 400 }}
      />

      <FooterButtons
        className="modalAuditRequirements__footerButtons"
        onClose={() => onClose(true)}
        handleOk={handleSubmit(onSubmit)}
        isConfirmLoading={false}
      />
    </Modal>
  );
};

export default ModalBalanceLegalization;

const fakeAdjustments: IAdjustmentsToLegalize[] = [
  {
    id: 101,
    comments: "Ajuste por nota de débito",
    documentType: "Nota débito",
    documentName: "ND-101",
    ammount: 1250000,
    financialRecordsAsociate: [
      {
        id: 201,
        idErp: "INV-0001"
      },
      {
        id: 202,
        idErp: "INV-0002"
      }
    ]
  },
  {
    id: 102,
    comments: "Revisión de saldo pendiente",
    documentType: "Nota crédito",
    documentName: "NC-102",
    ammount: 2395000,
    financialRecordsAsociate: [
      {
        id: 203,
        idErp: "INV-0003"
      }
    ]
  }
];

const mockSelectAdjustments: IAdjustmentsForSelect[] = [
  {
    id: 1,
    erp_id: "ERP-001",
    initial_value: 1000.5,
    current_value: 950.25,
    document_type_name: "Factura",
    comments: "Ajuste por diferencia de inventario"
  },
  {
    id: 2,
    erp_id: "ERP-002",
    initial_value: 2500.75,
    current_value: 2600.0,
    document_type_name: "Nota de crédito",
    comments: "Ajuste por error en precio unitario"
  }
];
