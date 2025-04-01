import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Flex, Table, TableProps, Typography } from "antd";
import { Eye, Receipt } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal";
import { ISingleBank } from "@/types/banks/IBanks";

import "./banks-table.scss";

const { Text } = Typography;

interface clientByStatus extends ISingleBank {
  client_status_id: number;
}
interface PropsBanksTable {
  clientsByStatus: clientByStatus[];
  selectedRows: ISingleBank[] | undefined;
  setSelectedRows: Dispatch<SetStateAction<ISingleBank[] | undefined>>;
  // eslint-disable-next-line no-unused-vars
  handleOpenPaymentDetail?: (paymentId: number) => void;
  bankStatusId: number;
  clearSelected: boolean;
}

export const BanksTable = ({
  clientsByStatus,
  selectedRows,
  setSelectedRows,
  handleOpenPaymentDetail,
  bankStatusId,
  clearSelected
}: PropsBanksTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalFileDetailOpen, setIsModalFileDetailOpen] = useState<boolean>(false);
  const [fileURL, setFileURL] = useState<string>("");

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [clearSelected]);

  useEffect(() => {
    setSelectedRowKeys(selectedRows?.map((row) => row.id) ?? []);
  }, [selectedRows]);

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setFileURL(documentUrl);
      if (isModalFileDetailOpen === false) setIsModalFileDetailOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [clearSelected]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: ISingleBank[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      // set the selected Rows but adding to the previous selected rows
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          //check if the new selected rows are already in the selected rows
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow: ISingleBank) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );

          //filters the unselected rows but only the ones that have the status_id equal to bankStatusId
          const unCheckedRows = prevSelectedRows?.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              prevSelectedRow.id_status === bankStatusId
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
    //traverse the alreadySelectedRows and remove the ones that have the status_id of the bankStatusId
    if (newSelectedRowKeys.length === 0) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          return prevSelectedRows.filter(
            (prevSelectedRow) => prevSelectedRow.id_status !== bankStatusId
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<ISingleBank>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Text
          className="idText"
          onClick={() => handleOpenPaymentDetail && handleOpenPaymentDetail(id)}
        >
          {id}
        </Text>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 100
    },
    {
      title: "Cliente",
      dataIndex: "CLIENT_NAME",
      key: "CLIENT_NAME",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.CLIENT_NAME.localeCompare(b.CLIENT_NAME),
      showSorterTooltip: false,
      width: 190
    },
    {
      title: "Fecha",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => <Text>{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.payment_date) - Date.parse(b.payment_date),
      showSorterTooltip: false,
      width: 115
    },
    {
      title: "Monto",
      key: "current_value",
      dataIndex: "current_value",
      align: "right",
      render: (text) => (
        <p className="fontMonoSpace money">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => (a.current_value ?? 0) - (b.current_value ?? 0),
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Descripción",
      key: "description",
      dataIndex: "description",
      render: (text) => <p className="description">{text}</p>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Cuenta",
      key: "bank_description",
      dataIndex: "bank_description",
      render: (text, record) => (
        <div className="accountBankTextContainer">
          <Text>{record.account_number}</Text>
          <p className="accountBankText">{text}</p>
        </div>
      ),
      width: 110
    },
    {
      title: "",
      key: "seeProject",
      width: 64,
      dataIndex: "",
      render: (_, record) => (
        <Flex gap={"0.5rem"} justify="end">
          {record.evidence_url && (
            <Button
              onClick={() => record.evidence_url && handleDocumentClick(record.evidence_url)}
              className="buttonSeeEvidence"
              icon={<Receipt size={"1.3rem"} />}
            />
          )}

          <Button
            className="buttonSeeClient"
            onClick={() => handleOpenPaymentDetail && handleOpenPaymentDetail(record.id)}
            icon={<Eye size={"1.3rem"} />}
          />
        </Flex>
      )
    }
  ];

  return (
    <>
      <Table
        className="banksTable customSticky"
        loading={false}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={clientsByStatus.map((data) => ({
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
          } as TableProps<ISingleBank>["sticky"]
        }
      />
      <InvoiceDownloadModal
        isModalOpen={isModalFileDetailOpen}
        handleCloseModal={setIsModalFileDetailOpen}
        title="Imagen"
        url={fileURL}
      />
    </>
  );
};

export default BanksTable;
