"use client";
import { useEffect, useState } from "react";
import { Flex, message, Modal, Select, Table, TableProps } from "antd";
import { Controller, useForm } from "react-hook-form";
import { Trash } from "phosphor-react";

import {
  getFinancialRecordsToLegalize,
  IAdjustmentsToLegalize,
  IFinancialRecordAsociate
} from "@/services/accountingAdjustment/accountingAdjustment";
import { useAppStore } from "@/lib/store/store";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import IconButton from "@/components/atoms/IconButton/IconButton";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import "./modalBalanceLegalization.scss";

interface IBalanceLegalizationFormValues {
  rows: any[];
}
interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedAdjustments?: FinancialDiscount[];
}

const ModalBalanceLegalization = ({ isOpen, onClose, selectedAdjustments }: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();

  const [adjustmentsToLegalize, setAdjustmentsToLegalize] = useState<IAdjustmentsToLegalize[]>([]);

  const { control, handleSubmit } = useForm<IBalanceLegalizationFormValues>();
  const closeModal = () => {
    onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAdjustments?.length) return;
      try {
        const res = await getFinancialRecordsToLegalize(selectedAdjustments.map((item) => item.id));
        setAdjustmentsToLegalize(res || []);
      } catch (error) {
        message.error("Error al cargar ajustes a legalizar");
        setAdjustmentsToLegalize(fakeAdjustments);
      }
    };

    fetchData();
  }, [selectedAdjustments]);

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
      }
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
      }
    },
    {
      title: "Ajuste ERP",
      dataIndex: "adjustment",
      key: "adjustment",
      render: (_: any, record: any, index: number) => (
        <Controller
          control={control}
          name={`rows.${index}.adjustment`}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              {...field}
              labelInValue
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        mockSelect.find((item) => item.nc_id === field.value)?.nc_id || field.value
                    }
                  : undefined
              }
              options={options}
              optionRender={(option) => option.label}
              className="modalBalanceLegalization__selectAdjustment"
              onChange={(option) => {
                field.onChange(option.value); // Guardas solo el nc_id
              }}
              placeholder=" - "
              popupMatchSelectWidth={false}
            />
          )}
        />
      ),
      width: 200
    },
    {
      title: "Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: () => {
        return <span>{formatMoney(999999)}</span>;
      },
      align: "right"
    },
    {
      title: "Observación",
      dataIndex: "observation",
      key: "observation"
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

  return (
    <Modal
      className="modalBalanceLegalization"
      width={1020}
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

const mockSelect = [
  {
    nc_id: "NC1234567",
    dev_id: "4324234234",
    amount: "$4.850.000"
  },
  {
    nc_id: "NC8727829",
    dev_id: "7654315151351",
    amount: "$1.000.000"
  },
  {
    nc_id: "NC9876543",
    dev_id: "765431543534",
    amount: "$5.000.000"
  }
];

const options = mockSelect.map((item) => ({
  value: item.nc_id,
  label: (
    <Flex justify="space-between" gap={"6rem"}>
      <Flex vertical>
        <p className="modalBalanceLegalization__selectDropText">{item.nc_id}</p>
        <p className="modalBalanceLegalization__selectDropText -small">{item.dev_id}</p>
      </Flex>
      <p className="modalBalanceLegalization__selectDropText">{item.amount}</p>
    </Flex>
  ),
  data: item // Guardamos los datos originales por si los necesitas luego
}));
