import { Button, Select, Table, TableProps, Tooltip, Typography } from "antd";
import { useState } from "react";
import { CheckCircle, Eye } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate, formatDateBars } from "@/utils/utils";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";

import { IInvoiceConcilation } from "@/types/concilation/concilation";

const { Text } = Typography;
import "./concilationTable.scss";

interface PropsInvoicesTable {
  dataSingleInvoice: IInvoiceConcilation[];
  // eslint-disable-next-line no-unused-vars
  setShowInvoiceDetailModal: (params: { isOpen: boolean; invoiceId: number }) => void;
  // eslint-disable-next-line no-unused-vars
  setIderp: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  addSelectMotive: (invoiceId: number, motiveId: number) => void;
  // eslint-disable-next-line no-unused-vars
  onRowSelection: (selectedRowKeys: React.Key[], selectedRows: IInvoiceConcilation[]) => void;
  selectedRowKeys: React.Key[];
}

export const ConcilationTable = ({
  setIderp,
  dataSingleInvoice: data,
  addSelectMotive,
  setShowInvoiceDetailModal,
  onRowSelection,
  selectedRowKeys
}: PropsInvoicesTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const openInvoiceDetail = (invoiceId: number, id_erp?: string) => {
    setIderp(id_erp || "");
    setShowInvoiceDetailModal({ isOpen: true, invoiceId });
  };

  // Preparar los datos con las keys
  const dataWithKeys = data.map((item) => ({ ...item, key: item.id }));

  const rowSelection = {
    selectedRowKeys,
    onSelect: (record: IInvoiceConcilation, selected: boolean) => {
      if (selected) {
        const newKeys = [...selectedRowKeys, record.id];
        onRowSelection(
          newKeys,
          data.filter((item) => newKeys.includes(item.id))
        );
      } else {
        const newKeys = selectedRowKeys.filter((key) => key !== record.id);
        onRowSelection(
          newKeys,
          data.filter((item) => newKeys.includes(item.id))
        );
      }
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        const allKeys = dataWithKeys.map((item) => item.key);

        onRowSelection(allKeys, dataWithKeys);
      } else {
        onRowSelection([], []);
      }
    },
    preserveSelectedRowKeys: true
  };

  const { data: motives, isLoading } = useInvoiceIncidentMotives();
  const columns: TableProps<IInvoiceConcilation>["columns"] = [
    {
      title: "Factura",
      dataIndex: "id_erp",
      key: "id_erp",
      render: (invoiceId, record) => (
        <Text
          onClick={() => openInvoiceDetail(invoiceId, record.id_erp)}
          className="invoicesTable__id"
        >
          {record.id_erp}
        </Text>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "create_at",
      key: "create_at",
      render: (text, record) => (
        <Text className="cell -alignRight">
          {formatDate(record?.financialRecordDate?.toString())}
        </Text>
      ),
      sorter: (a, b) => {
        const dateA = new Date(a.financialRecordDate);
        const dateB = new Date(b.financialRecordDate);
        return dateA.getTime() - dateB.getTime();
      },
      showSorterTooltip: false,
      align: "right",
      width: 120
    },
    {
      title: "Pronto pago",
      key: "earlypay_date",
      dataIndex: "earlypay_date",
      showSorterTooltip: false,
      align: "right",
      width: 150
    },
    {
      title: "Monto cp",
      key: "current_value",
      dataIndex: "current_value",
      render: (amount) => <p className="cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "right",
      width: 150
    },
    {
      title: "Observación",
      key: "observation",
      dataIndex: "observation",
      render: (text) => <Text className="cell -alignRight">{text}</Text>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "left"
    },
    {
      title: "Diferencia",
      key: "difference_amount",
      dataIndex: "difference_amount",
      render: (amount) => (
        <p className="text__red__concilation fontMonoSpace">{formatMoney(amount)}</p>
      ),
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Acción",
      key: "motive_id",
      render: (_, record) => (
        <div className="actionWrapper">
          <Select
            placeholder="Seleccionar acción"
            loading={isLoading}
            options={motives?.map((motive) => ({ value: motive?.name, label: motive?.name })) || []}
            onChange={(value) =>
              addSelectMotive(record.id, motives?.find((motive) => motive.name === value)?.id || 0)
            }
            value={motives?.find((motive) => motive.id === record.motive_id)?.name}
            style={{ width: "100%", height: "34px", maxWidth: "300px" }}
            popupMatchSelectWidth={false}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      ),
      width: "17%",
      align: "center"
    },
    {
      title: "Detalle",
      className: "logosWrapper",
      render: (_, record) => (
        <div className="logos">
          {record.accept_date ? (
            <Tooltip
              title={
                <div className="toolTip -clientAccept">
                  <p>Aceptación cliente</p>
                  <strong>{formatDateBars(record.accept_date?.toString() || "0")}</strong>
                </div>
              }
              color={"#f7f7f7"}
              key={`C${record.id}`}
            >
              <Button icon={<CheckCircle size={"1.2rem"} />} />
            </Tooltip>
          ) : null}

          <Button
            onClick={() => openInvoiceDetail(record.id, record.id_erp)}
            icon={<Eye size={"1.2rem"} />}
          />
        </div>
      ),
      width: 100,
      onCell: () => ({
        style: {
          flex: 2
        }
      })
    }
  ];

  return (
    <Table
      className="concilationTable"
      columns={columns}
      pagination={
        data.length > pageSize
          ? {
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              pageSize: pageSize,
              showSizeChanger: false,
              total: data.length
            }
          : false
      }
      rowSelection={rowSelection}
      dataSource={dataWithKeys}
    />
  );
};
