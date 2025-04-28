import { useState } from "react";
import { Button, Flex, Popconfirm, Spin, Table, TableProps, Typography, message } from "antd";
import { Eye, Plus, Trash } from "phosphor-react";

import { ModalShipTo } from "../../modals/ModalShipTo/ModalShipTo";
import { ISelectType } from "@/types/clients/IClients";
import { useShipTos } from "@/hooks/useShipTo";

import "./shiptoprojecttable.scss";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
const { Text, Link, Title } = Typography;

interface Props {
  clientId: string;
  projectId: number;
  getClientValues: () => {
    billingPeriod: string;
    radicationType: ISelectType;
    conditionPayment: ISelectType;
  };
  clientBillingPeriod: IBillingPeriodForm | undefined;
}

export const ShipToProjectTable = ({ clientId, getClientValues, clientBillingPeriod }: Props) => {
  const [isShipToModalOpen, setIsShipToModalOpen] = useState<{
    open: boolean;
    accounting_code: string | undefined;
  }>({
    open: false,
    accounting_code: undefined
  });
  const { data, isLoading, createShipTo, getShipTo, deleteShipTo, editShipTo } =
    useShipTos(clientId);

  const shipTosData = data?.map((shipTo) => ({
    ...shipTo,
    key: shipTo?.accounting_code,
    channels: shipTo?.channels?.reduce((acc, channel) => `${acc} ${channel.description},`, ""),
    lines_info: shipTo?.lines_info?.reduce((acc, line) => `${acc} ${line.description},`, ""),
    sub_lines: shipTo?.sub_lines?.reduce((acc, subline) => `${acc} ${subline.description},`, ""),
    zones: shipTo?.zones?.reduce((acc, zone) => `${acc} ${zone.description},`, "")
  }));

  const [messageApi, contextHolder] = message.useMessage();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<any>["columns"] = [
    {
      width: 110,
      title: "ID Ship To",
      dataIndex: "accounting_code",
      key: "accounting_code",
      render: (text) => <Link underline>{text}</Link>
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Canal",
      key: "channels",
      dataIndex: "channels",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Linea",
      key: "lines_info",
      dataIndex: "lines_info",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Sublinea",
      key: "sub_lines",
      dataIndex: "sub_lines",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Zona",
      key: "zones",
      dataIndex: "zones",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Hereda parámetros",
      key: "dependecy_client",
      dataIndex: "dependecy_client",
      render: (text) => <Text>{Boolean(text) ? "Sí" : "No"}</Text>
    },
    {
      title: "",
      key: "seeProject",
      width: "40px",
      dataIndex: "",
      render: (_, { accounting_code }) => (
        <Flex gap={"0.5rem"}>
          <Popconfirm
            placement="topRight"
            title="¿Eliminar Ship To?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => deleteShipTo(accounting_code, messageApi)}
          >
            <Button icon={<Trash size={"1.25rem"} />} />
          </Popconfirm>

          <Button
            onClick={() => setIsShipToModalOpen({ open: true, accounting_code })}
            icon={<Eye size={"1.3rem"} />}
          />
        </Flex>
      )
    }
  ];
  return (
    <>
      {contextHolder}
      <div className="ShipToProjectTable">
        <Flex justify="space-between" className="ShipToProjectTable__header">
          <Title level={4}>Ship To</Title>
          <Flex gap={"1rem"}>
            <Button
              type="primary"
              className="buttonOutlined"
              size="large"
              icon={<Plus weight="bold" size={15} />}
            >
              Descargar plantilla
            </Button>
            <Button
              type="primary"
              className="buttonOutlined"
              size="large"
              icon={<Plus weight="bold" size={15} />}
            >
              Cargar excel
            </Button>
          </Flex>
        </Flex>
        {isLoading ? (
          <Flex style={{ height: "30%" }} align="center" justify="center">
            <Spin size="default" />
          </Flex>
        ) : (
          <>
            <Table
              className="ShipToProjectTable__table"
              pagination={{ pageSize: 20 }}
              columns={columns}
              dataSource={shipTosData?.map((shipTo) => ({
                ...shipTo,
                key: shipTo.accounting_code
              }))}
              rowSelection={rowSelection}
              rowClassName={(record) =>
                selectedRowKeys.includes(record.accounting_code) ? "selectedRow" : "regularRow"
              }
            />
            <Button
              size="large"
              type="text"
              className="buttonCreateShipTo"
              onClick={() => {
                setIsShipToModalOpen({ open: true, accounting_code: undefined });
              }}
              icon={<Plus weight="bold" size={15} />}
            >
              Crear Ship To
            </Button>
          </>
        )}
      </div>

      <ModalShipTo
        setIsShipToModalOpen={setIsShipToModalOpen}
        isShipToModalOpen={isShipToModalOpen}
        getClientValues={getClientValues}
        clientBillingPeriod={clientBillingPeriod}
        messageApi={messageApi}
        createShipTo={createShipTo}
        getShipTo={getShipTo}
        editShipTo={editShipTo}
      />
    </>
  );
};
