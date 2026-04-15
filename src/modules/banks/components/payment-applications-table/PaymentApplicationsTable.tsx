import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Flex, Table, TableProps, Typography } from "antd";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";

import "./payment-applications-table.scss";
import { Eye } from "phosphor-react";

const { Text } = Typography;

interface applicationByStatus extends IPaymentApplication {
  status_id: number;
}

interface PropsPaymentApplicationsTable {
  applicationsByStatus: applicationByStatus[];
  selectedRows: IPaymentApplication[] | undefined;
  setSelectedRows: Dispatch<SetStateAction<IPaymentApplication[] | undefined>>;
  // eslint-disable-next-line no-unused-vars
  handleOpenDetail?: (paymentId: number) => void;
  statusId: number;
  clearSelected: boolean;
}

export const PaymentApplicationsTable = ({
  applicationsByStatus,
  selectedRows,
  setSelectedRows,
  handleOpenDetail,
  statusId,
  clearSelected
}: PropsPaymentApplicationsTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [clearSelected]);

  useEffect(() => {
    setSelectedRowKeys(selectedRows?.map((row) => row.id) ?? []);
  }, [selectedRows]);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    newSelectedRows: applicationByStatus[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );

          const unCheckedRows = prevSelectedRows?.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              (prevSelectedRow as applicationByStatus).status_id === statusId
          );
          if (unCheckedRows.length > 0) {
            const filteredPrevSelectedRows = prevSelectedRows.filter(
              (prevSelectedRow) => !unCheckedRows.includes(prevSelectedRow)
            );
            return filteredPrevSelectedRows;
          }

          return [...prevSelectedRows, ...filteredSelectedRows];
        } else {
          return newSelectedRows;
        }
      });
    }
    if (newSelectedRowKeys.length === 0) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          return prevSelectedRows.filter(
            (prevSelectedRow) => (prevSelectedRow as applicationByStatus).status_id !== statusId
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<applicationByStatus>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text className="idText">{id}</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 110
    },
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => <Text>{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
      showSorterTooltip: false,
      width: 115
    },
    {
      title: "Recaudo",
      key: "amount",
      dataIndex: "amount",
      align: "right",
      render: (text) => (
        <p className="fontMonoSpace money">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
      showSorterTooltip: false,
      width: 150
    },
    {
      title: "Id Pago",
      key: "payment_ids",
      dataIndex: "payment_ids",
      render: (ids: number[]) =>
        ids?.length ? (
          <span>
            {ids.map((paymentId, index) => (
              <span key={`${paymentId}-${index}`}>
                <Text
                  className="paymentIdsText"
                  onClick={() => handleOpenDetail && handleOpenDetail(paymentId)}
                >
                  {paymentId}
                </Text>
                {index < ids.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        ) : (
          <Text>-</Text>
        ),
      width: 130
    },
    {
      title: "Usuario",
      key: "userName",
      dataIndex: "userName",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      showSorterTooltip: false,
      width: 160
    },
    {
      title: "",
      key: "seeDetail",
      width: 60,
      dataIndex: "",
      render: (_, record) => (
        <Flex gap={"0.5rem"} justify="end">
          <Button className="buttonSeeClient" icon={<Eye size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  return (
    <Table
      className="paymentApplicationsTable customSticky"
      loading={false}
      columns={columns}
      rowSelection={rowSelection}
      dataSource={applicationsByStatus.map((data) => ({
        ...data,
        key: data.id
      }))}
      pagination={{
        pageSize: 15,
        showSizeChanger: false
      }}
      sticky={
        {
          offsetHeader: 120,
          offsetScroll: 0
        } as TableProps<applicationByStatus>["sticky"]
      }
    />
  );
};

export default PaymentApplicationsTable;
