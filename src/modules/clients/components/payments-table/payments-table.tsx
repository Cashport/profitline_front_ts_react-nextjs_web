import { useEffect, useState } from "react";
import { Button, Table, TableProps, Typography } from "antd";
import { Eye } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import { useSelectedPayments } from "@/context/SelectedPaymentsContext";

import { IClientPayment } from "@/types/clientPayments/IClientPayments";

import "./payments-table.scss";

const { Text } = Typography;

interface PropsInvoicesTable {
  paymentsByStatus: IClientPayment[];
  paymentStatusId: number;
  // eslint-disable-next-line no-unused-vars
  handleOpenPaymentDetail: (paymentId: number) => void;
}

const PaymentsTable = ({
  paymentsByStatus: data,
  paymentStatusId,
  handleOpenPaymentDetail
}: PropsInvoicesTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const { selectedPayments, setSelectedPayments } = useSelectedPayments();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // Update selectedRowKeys based on global selectedPayments
    setSelectedRowKeys(selectedPayments.map((payment) => payment.id));
  }, [selectedPayments]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: IClientPayment[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    setSelectedPayments((prevSelectedPayments) => {
      if (newSelectedRowKeys.length >= 1) {
        // Filter out newly selected rows that aren't already in prevSelectedPayments
        const filteredNewRows = newSelectedRows
          .filter((newRow) => !prevSelectedPayments.some((prevRow) => prevRow.id === newRow.id))
          .map((newRow) => ({ ...newRow, payments_status_id: paymentStatusId }));

        // Filter out unselected rows for this payment status
        const remainingRows = prevSelectedPayments.filter(
          (row) => row.id_status !== paymentStatusId || newSelectedRowKeys.includes(row.id)
        );

        return [...remainingRows, ...filteredNewRows];
      } else {
        // If no rows are selected for this status, remove all rows of this status
        return prevSelectedPayments.filter((row) => row.id_status !== paymentStatusId);
      }
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IClientPayment>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (paymentId) => (
        <p onClick={() => handleOpenPaymentDetail(paymentId)} className="paymentsTable__id">
          {paymentId}
        </p>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Id ERP",
      dataIndex: "ID_ERP",
      key: "ID_ERP",
      render: (erpId) => <p>{erpId || "-"}</p>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Ingreso",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => <Text className="cell">{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.payment_date) - Date.parse(b.payment_date),
      showSorterTooltip: false,
      width: 120
    },
    {
      title: "Identificación",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => <Text className="cell">{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
      showSorterTooltip: false
    },
    {
      title: "Referencia",
      key: "description",
      dataIndex: "description",
      render: (text) => <p className="cell__description">{text}</p>,
      showSorterTooltip: false
    },
    {
      title: "Monto",
      key: "initial_value",
      dataIndex: "initial_value",
      align: "right",
      render: (initial_value) => <p className="cell fontMonoSpace">{formatMoney(initial_value)}</p>,
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Disponible",
      key: "current_value",
      dataIndex: "current_value",
      align: "right",
      render: (current_value) => <p className="cell fontMonoSpace">{formatMoney(current_value)}</p>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false
    },
    {
      title: "",
      render: (_, record) => (
        <Button
          className="logoButton"
          onClick={() => handleOpenPaymentDetail(record.id)}
          icon={<Eye size={"1.2rem"} />}
        />
      ),
      width: 60,
      onCell: () => ({
        style: {
          flex: 2
        }
      })
    }
  ];

  return (
    <>
      <Table
        className="paymentsTable customSticky"
        columns={columns}
        dataSource={data?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
        pagination={false}
        sticky={{ offsetHeader: 160 }}
      />
    </>
  );
};

export default PaymentsTable;
