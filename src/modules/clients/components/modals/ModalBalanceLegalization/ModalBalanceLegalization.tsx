"use client";
import { Flex, message, Modal, Select, Table, TableProps } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalBalanceLegalization.scss";
import { Controller, useForm } from "react-hook-form";
import { Trash } from "phosphor-react";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";

interface IBalanceLegalizationFormValues {
  rows: any[];
}
interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
}

const ModalBalanceLegalization = ({ isOpen, onClose }: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();

  const { control, handleSubmit } = useForm<IBalanceLegalizationFormValues>();
  const closeModal = () => {
    onClose();
  };
  const handleDeleteBalance = () => {
    message.success("Funcionalidad en desarrollo");
  };

  const onSubmit = (data: IBalanceLegalizationFormValues) => {
    console.info("Form data submitted:", data);
    message.success("Datos enviados correctamente");
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "Ajuste Cashport",
      dataIndex: "adjustmentInfo",
      key: "adjustmentInfo",
      render: (adjustmentInfo) => {
        return (
          <Flex vertical className="modalBalanceLegalization__adjustmentInfo">
            <p className="modalBalanceLegalization__adjustmentInfo__ncId">{adjustmentInfo.NC_id}</p>
            <p className="modalBalanceLegalization__adjustmentInfo__devId">
              {adjustmentInfo.dev_id}
            </p>
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
      dataIndex: "commentary",
      key: "commentary",
      render: (invoiceId: any) => {
        return (
          <p className="modalBalanceLegalization__invoiceId">{invoiceId ? invoiceId : " - "}</p>
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
      render: (difference) => {
        return <span>{formatMoney(difference)}</span>;
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
        dataSource={mockData.map((item) => ({ ...item, key: item.id }))}
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

const mockData = [
  {
    id: 1,
    adjustmentInfo: {
      NC_id: "NC-12345",
      dev_id: "DEV-67890"
    },
    ammount: 102230,
    commentary: "Factura 1",
    audit: "Aprobar",
    difference: 10000,
    observation: "Observación 1"
  },
  {
    id: 2,
    adjustmentInfo: {
      NC_id: "NC-54321",
      dev_id: "DEV-09876"
    },
    ammount: 20421240,
    commentary: "Factura 2",
    audit: "Rechazar",
    difference: 1234,
    observation: "Observación 2"
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
