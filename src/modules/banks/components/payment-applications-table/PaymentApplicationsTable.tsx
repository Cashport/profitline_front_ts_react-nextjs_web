import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Flex,
  Grid,
  MenuProps,
  Table,
  TableProps,
  Typography,
  message
} from "antd";
import {
  ArrowCounterClockwise,
  DotsThreeVertical,
  DownloadSimple,
  FileArrowUp
} from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";
import {
  ReprocessExcel,
  UploadFinalFile
} from "@/services/paymentApplications/paymentApplications";

import "./payment-applications-table.scss";

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
  statusName: string;
  clearSelected: boolean;
  mutate: () => void;
}

export const PaymentApplicationsTable = ({
  applicationsByStatus,
  selectedRows,
  setSelectedRows,
  handleOpenDetail,
  statusId,
  statusName,
  clearSelected,
  mutate
}: PropsPaymentApplicationsTable) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const screens = Grid.useBreakpoint();
  const isXXL = !!screens.xxl;

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

  const handleDownload = (url?: string | null) => {
    if (!url) {
      message.error("No hay archivo disponible para descargar");
      return;
    }
    window.open(url, "_blank");
  };

  const handleUploadFile = (applicationId: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const hide = message.open({
        type: "loading",
        content: "Cargando archivo...",
        duration: 0
      });
      try {
        await UploadFinalFile(String(applicationId), file);
        message.success("Archivo cargado exitosamente");
        mutate();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Error al cargar el archivo");
      } finally {
        hide();
      }
    };
    input.click();
  };

  const handleRegenerate = async (applicationId: number) => {
    const hide = message.open({
      type: "loading",
      content: "Regenerando archivo...",
      duration: 0
    });
    try {
      const data = await ReprocessExcel(applicationId);
      hide();
      handleDownload(data.excel_url);
    } catch (error) {
      hide();
      message.error(error instanceof Error ? error.message : "Error al regenerar el archivo");
    }
  };

  const columns: TableProps<applicationByStatus>["columns"] = [
    {
      title: "Id. Aplicación",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text className="idText">{id}</Text>,
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 130
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
      title: "Id. Pago Cashport",
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
      width: isXXL ? "auto" : 130
    },
    {
      title: "Id. Pago ERP",
      key: "id_erps",
      dataIndex: "id_erps",
      render: (ids: string[]) =>
        ids?.length ? (
          <span>
            {ids.map((erpId, index) => (
              <span key={`${erpId}-${index}`}>
                <Text>{erpId}</Text>
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
      title: "",
      key: "seeDetail",
      align: "right",
      dataIndex: "",
      width: 50,
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            key: "pdf",
            label: (
              <Button
                icon={<DownloadSimple size={20} />}
                className="buttonNoBorder"
                onClick={() => handleDownload(record.pdf_url)}
              >
                PDF
              </Button>
            )
          },
          {
            key: "template",
            label: (
              <Button
                icon={<DownloadSimple size={20} />}
                className="buttonNoBorder"
                onClick={() => handleDownload(record.excel_url)}
              >
                Template
              </Button>
            )
          },
          {
            key: "regenerate",
            label: (
              <Button
                icon={<ArrowCounterClockwise size={20} />}
                className="buttonNoBorder"
                onClick={() => handleRegenerate(record.id)}
              >
                Regenerar
              </Button>
            )
          },
          ...(statusName === "Por revisar"
            ? [
                {
                  key: "upload-template",
                  label: (
                    <Button
                      icon={<FileArrowUp size={20} />}
                      className="buttonNoBorder"
                      onClick={() => handleUploadFile(record.id)}
                    >
                      Cargar Template
                    </Button>
                  )
                }
              ]
            : [])
        ];

        const customDropdown = (menu: ReactNode) => (
          <div className="dropdownApplicationTable">{menu}</div>
        );

        return (
          <Flex justify="end">
            <Dropdown
              dropdownRender={customDropdown}
              menu={{ items }}
              placement="bottomLeft"
              trigger={["click"]}
            >
              <Button className="dotsBtn" icon={<DotsThreeVertical size={20} />} />
            </Dropdown>
          </Flex>
        );
      }
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
