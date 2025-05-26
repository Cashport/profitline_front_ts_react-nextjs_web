import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Table, TableProps, Typography } from "antd";
import { Eye } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";

import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import "./accounting-adjustments-table.scss";

const { Text } = Typography;

interface PropsInvoicesTable {
  dataAdjustmentsByStatus: FinancialDiscount[];
  setSelectedRows: Dispatch<SetStateAction<FinancialDiscount[] | undefined>>;
  // eslint-disable-next-line no-unused-vars
  openAdjustmentDetail: (adjustment: FinancialDiscount) => void;
  financialStatusId: number;
  legalized?: boolean;
  selectedRows?: FinancialDiscount[];
}

const AccountingAdjustmentsTable = ({
  dataAdjustmentsByStatus: data,
  setSelectedRows,
  openAdjustmentDetail,
  financialStatusId,
  legalized,
  selectedRows
}: PropsInvoicesTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  useEffect(() => {
    if (selectedRows) {
      const updatedKeys = selectedRowKeys.filter((key) =>
        selectedRows.some((row) => row.id === key)
      );
      const selectedKeys = selectedRows.map((row) => row.id);
      setSelectedRowKeys(Array.from(new Set([...updatedKeys, ...selectedKeys])));
    } else {
      setSelectedRowKeys([]);
    }
  }, [selectedRows]);

  const handleOpenDetail = (adjustment: FinancialDiscount) => {
    openAdjustmentDetail({ ...adjustment, legalized: legalized });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      // set the selected Rows but adding to the previous selected rows
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          //check if the new selected rows are already in the selected rows
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow: FinancialDiscount) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );

          //filters the unselected rows but only the ones that have the status_id equal to financialStatusId
          const unCheckedRows = prevSelectedRows?.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              prevSelectedRow.financial_status_id === financialStatusId
          );

          if (unCheckedRows.length > 0) {
            // remove form the prevState the ones present in the unCheckedRows
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
    //traverse the alreadySelectedRows and remove the ones that have the status_id of the financialStatusId
    if (newSelectedRowKeys.length === 0) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          return prevSelectedRows.filter(
            (prevSelectedRow) => prevSelectedRow.financial_status_id !== financialStatusId
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<FinancialDiscount>["columns"] = [
    {
      title: "ID ERP",
      dataIndex: "erp_id",
      key: "erp_id",
      render: (erp_id, record) => (
        <p onClick={() => handleOpenDetail(record)} className="adjustmentsTable__id">
          {erp_id}
        </p>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Creación",
      dataIndex: "create_at",
      key: "create_at",
      render: (text) => <Text className="cell -alignRight">{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.create_at) - Date.parse(b.create_at),
      align: "center",
      width: 120,
      showSorterTooltip: false
    },
    {
      title: "Tipo de ajuste",
      dataIndex: "motive_name",
      key: "motive_name"
    },
    {
      title: "Detalle",
      dataIndex: "comments",
      key: "comments"
    },
    {
      title: "Monto Inicial",
      key: "initial_value",
      dataIndex: "initial_value",
      render: (text) => <p className="cell -alignRight fontMonoSpace">{formatMoney(text)}</p>,
      align: "right",
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Monto aplicado",
      key: "missing",
      dataIndex: "missing",
      render: (text) => <Text className="cell -alignRight fontMonoSpace">{text}</Text>,
      align: "right",
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false
    },
    {
      title: "Monto disponible",
      key: "current_value",
      dataIndex: "current_value",
      render: (amount) => <p className="cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>,
      align: "right",
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false
    },
    {
      title: "",
      render: (_, record) => (
        <Button onClick={() => handleOpenDetail(record)} icon={<Eye size={"1.2rem"} />} />
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
        className="adjustmentsTable customSticky"
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

export default AccountingAdjustmentsTable;
