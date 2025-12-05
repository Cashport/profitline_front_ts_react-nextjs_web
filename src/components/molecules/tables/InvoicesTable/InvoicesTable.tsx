import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Table, TableProps, Tooltip, Typography } from "antd";
import { CheckCircle, Eye, Handshake, Warning, WarningCircle } from "phosphor-react";
import dayjs from "dayjs";

import { useAppStore } from "@/lib/store/store";
import { calculateDaysDifference, daysLeft, formatDate } from "@/utils/utils";

import { IInvoice, InvoicesData } from "@/types/invoices/IInvoices";

const { Text } = Typography;
import "./invoicestable.scss";

interface PropsInvoicesTable {
  stateId: number;
  dataInvoiceByStatus: InvoicesData;
  setSelectedRows: Dispatch<SetStateAction<IInvoice[] | undefined>>;
  // eslint-disable-next-line no-unused-vars
  openInvoiceDetail: (invoice: IInvoice) => void;
  // eslint-disable-next-line no-unused-vars
  fetchData?: (newPage: number) => void;

  selectedRows?: IInvoice[];
}

export const InvoicesTable = ({
  stateId,
  dataInvoiceByStatus: data,
  setSelectedRows,
  fetchData,
  selectedRows,
  openInvoiceDetail
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

  const handleOpenDetail = (invoice: IInvoice) => {
    openInvoiceDetail(invoice);
  };

  // const handleTableChange = (page: number) => {
  //   fetchData(page);
  // };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      // set the selected Rows but adding to the previous selected rows
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          //check if the new selected rows are already in the selected rows
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow: IInvoice) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );

          //filters the unselected rows but only the ones that have the status_id equal to stateId
          const unCheckedRows = prevSelectedRows?.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              prevSelectedRow.status_id === stateId
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
    if (newSelectedRowKeys.length === 0) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          return prevSelectedRows.filter(
            (prevSelectedRow) => prevSelectedRow.status_id !== stateId
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IInvoice>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <Text onClick={() => handleOpenDetail(record)} className="invoicesTable__id">
          {record.id_erp}
        </Text>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false
    },
    {
      title: "Emisión",
      dataIndex: "financial_record_date",
      key: "financial_record_date",
      render: (text) => <Text className="cell -alignRight">{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.financial_record_date) - Date.parse(b.financial_record_date),
      showSorterTooltip: false,
      align: "right",
      width: 120
    },
    {
      title: "Pronto pago",
      key: "earlypay_date",
      dataIndex: "earlypay_date",
      render: (date) => <Text className="cell -alignRight">{date ? formatDate(date) : "-"}</Text>,
      sorter: (a, b) => Date.parse(a.earlypay_date) - Date.parse(b.earlypay_date),
      showSorterTooltip: false,
      align: "right",
      width: 150
    },
    {
      title: "Vence",
      key: "expiration_date",
      dataIndex: "expiration_date",
      render: (text, record) => (
        <Tooltip
          title={
            <div className="toolTip -expirationDate">
              <p>Fecha de vencimiento</p>
              <strong>{formatDate(text)}</strong>
              <p>
                Condición de pago{" "}
                <strong>
                  {calculateDaysDifference(
                    new Date(record?.financial_record_date),
                    new Date(record?.expiration_date)
                  )}{" "}
                  días
                </strong>
              </p>
            </div>
          }
          color={"#f7f7f7"}
          key={record.id}
        >
          <Text className="expirationText cell -alignRight">
            {daysLeft(text)} días <WarningCircle size={16} />
          </Text>
        </Tooltip>
      ),
      sorter: (a, b) => Date.parse(a.expiration_date) - Date.parse(b.expiration_date),
      showSorterTooltip: false,
      align: "right",
      width: 140
    },
    {
      title: "Detalle",
      dataIndex: "comments",
      key: "comments",
      render: (text) => <p className="cell -alignRight">{text ? text : "-"}</p>,
      sorter: (a, b) => a.comments.localeCompare(b.comments),
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Monto inicial",
      key: "initial_value",
      dataIndex: "initial_value",
      render: (amount) => <p className="cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.initial_value - b.initial_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Ajustes",
      key: "ajust_value",
      dataIndex: "ajust_value",
      render: (amount) =>
        amount === 0 ? null : amount > 0 ? (
          <p className="cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>
        ) : (
          <p className="negativeAdjustment cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>
        ),
      sorter: (a, b) => a.ajust_value - b.ajust_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Pendiente",
      key: "current_value",
      dataIndex: "current_value",
      render: (amount) => <p className="cell -alignRight fontMonoSpace">{formatMoney(amount)}</p>,
      sorter: (a, b) => a.current_value - b.current_value,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "",
      className: "logosWrapper",
      render: (_, record) => (
        <div className="logos">
          {record?.agreement_info?.Fecha && (
            <Tooltip
              title={
                <div className="toolTip -paymentAgreement">
                  <p>Acuerdo de pago</p>
                  <p>
                    Fecha <strong>{record?.agreement_info?.Fecha}</strong>
                  </p>
                  <p>
                    Monto <strong>{formatMoney(record?.agreement_info?.Monto)}</strong>
                  </p>
                </div>
              }
              color={"#f7f7f7"}
              key={`A${record.id}`}
            >
              <Button
                icon={
                  <Handshake
                    size={"1.2rem"}
                    color={
                      dayjs(record?.agreement_info?.Fecha).isBefore(dayjs(), "day")
                        ? "red"
                        : "currentColor"
                    }
                  />
                }
              />
            </Tooltip>
          )}
          {record.novelty_info?.incidentType && (
            <Tooltip
              title={
                <div className="toolTip -priceDifference">
                  <p>Diferencia en precios</p>
                  <p>
                    Monto{" "}
                    <strong>{formatMoney(record?.novelty_info?.incidentAmount ?? "0")}</strong>
                  </p>
                  <p>{record?.novelty_info?.incidentType}</p>
                  <p></p>
                </div>
              }
              color={"#f7f7f7"}
              key={`B${record.id}`}
            >
              <Button icon={<Warning size={"1.2rem"} />} />
            </Tooltip>
          )}
          {record?.acceptance_info?.accept_date && (
            <Tooltip
              title={
                <div className="toolTip -clientAccept">
                  <p>Aceptación cliente</p>
                  <p>{record?.acceptance_info?.radication_type}</p>
                  <strong>{record?.acceptance_info?.accept_date ?? " DD-MM-YYYY"}</strong>
                </div>
              }
              color={"#f7f7f7"}
              key={`C${record.id}`}
            >
              <Button icon={<CheckCircle size={"1.2rem"} />} />
            </Tooltip>
          )}

          <Button onClick={() => handleOpenDetail(record)} icon={<Eye size={"1.2rem"} />} />
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
    <>
      <Table
        className="invoicesTable customSticky"
        columns={columns}
        dataSource={data.invoices.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
        pagination={
          //   {
          //   current: data.page.actualPage,
          //   pageSize: data.page.rowsPerPage,
          //   total: data.page.totalRows,
          //   onChange: handleTableChange,
          //   showSizeChanger: false
          // }
          {
            pageSize: 25,
            showSizeChanger: false
          }
        }
        size="small"
        sticky={
          {
            offsetHeader: 160
          } as any
        }
      />
    </>
  );
};
