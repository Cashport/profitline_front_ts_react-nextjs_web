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
  ArrowUUpLeft,
  CheckCircle,
  DotsThreeVertical,
  DownloadSimple,
  FileArrowUp
} from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { formatDate } from "@/utils/utils";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";
import {
  changeStatusToApplied,
  reprocessExcel,
  reprocessPDF,
  reversePaymentApplication,
  uploadFinalFile
} from "@/services/paymentApplications/paymentApplications";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import "./payment-applications-table.scss";
import { ApiError } from "@/utils/api/api";

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
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [applicationToReverse, setApplicationToReverse] = useState<IPaymentApplication | null>(
    null
  );
  const [isReversing, setIsReversing] = useState(false);

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
        await uploadFinalFile(String(applicationId), file);
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

  const handleRegenerateExcel = async (applicationId: number) => {
    const hide = message.open({
      type: "loading",
      content: "Regenerando archivo...",
      duration: 0
    });
    try {
      const data = await reprocessExcel(applicationId);
      hide();
      handleDownload(data.excel_url);
    } catch (error) {
      hide();
      message.error(error instanceof Error ? error.message : "Error al regenerar el archivo");
    }
  };

  const handleRegeneratePDF = async (applicationId: number) => {
    const hide = message.open({
      type: "loading",
      content: "Regenerando archivo...",
      duration: 0
    });
    try {
      const data = await reprocessPDF(applicationId);
      hide();
      handleDownload(data.pdf_url);
    } catch (error) {
      hide();
      message.error(error instanceof Error ? error.message : "Error al regenerar el archivo");
    }
  };

  const handleOpenReverseModal = (record: IPaymentApplication) => {
    setApplicationToReverse(record);
    setReverseModalOpen(true);
  };

  const handleCloseReverseModal = () => {
    if (isReversing) return;
    setReverseModalOpen(false);
    setApplicationToReverse(null);
  };

  const handleConfirmReverse = async () => {
    if (!applicationToReverse || isReversing) return;
    setIsReversing(true);
    try {
      await reversePaymentApplication(applicationToReverse.id);
      message.success("Aplicación reversada correctamente");
      setReverseModalOpen(false);
      setApplicationToReverse(null);
      mutate();
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : "";
      if (error instanceof ApiError && error.message) {
        errorMessage = error.message;
      }
      const normalizedMessage = errorMessage.toLowerCase();

      if (normalizedMessage) {
        message.error(normalizedMessage);
      } else {
        message.error("No se pudo reversar, intenta de nuevo");
      }
    } finally {
      setIsReversing(false);
    }
  };

  const handleChangeStatusToApplied = async (applicationId: number) => {
    const hide = message.open({
      type: "loading",
      content: "Legalizando...",
      duration: 0
    });
    try {
      await changeStatusToApplied(applicationId);
      message.success("Estado actualizado a Aplicado");
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al legalizar");
    } finally {
      hide();
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
                onClick={() => handleRegenerateExcel(record.id)}
              >
                Regenerar Excel
              </Button>
            )
          },
          {
            key: "regenerate",
            label: (
              <Button
                icon={<ArrowCounterClockwise size={20} />}
                className="buttonNoBorder"
                onClick={() => handleRegeneratePDF(record.id)}
              >
                Regenerar PDF
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
            : []),
          ...(statusName !== "Reversada"
            ? [
                {
                  key: "reverse-application",
                  label: (
                    <Button
                      icon={<ArrowUUpLeft size={20} />}
                      className="buttonNoBorder"
                      onClick={() => handleOpenReverseModal(record)}
                    >
                      Reversar aplicación
                    </Button>
                  )
                }
              ]
            : []),
          ...(statusName === "Legalización"
            ? [
                {
                  key: "change-to-applied",
                  label: (
                    <Button
                      icon={<CheckCircle size={20} />}
                      className="buttonNoBorder"
                      onClick={() => handleChangeStatusToApplied(record.id)}
                    >
                      Legalizar
                    </Button>
                  )
                }
              ]
            : []),
          ...(["Enviado al ERP", "Aplicado ERP", "Anulado"].includes(statusName) &&
          record.final_file_url
            ? [
                {
                  key: "download-final-file",
                  label: (
                    <Button
                      icon={<DownloadSimple size={20} />}
                      className="buttonNoBorder"
                      onClick={() => handleDownload(record.final_file_url)}
                    >
                      Descargar archivo final
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
    <>
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
      <ModalConfirmAction
        isOpen={reverseModalOpen}
        onClose={handleCloseReverseModal}
        onOk={handleConfirmReverse}
        title="Reversar aplicación de pago"
        okText="Confirmar reversión"
        cancelText="Cancelar"
        okLoading={isReversing}
        content={
          applicationToReverse ? (
            <div>
              <p>¿Estás seguro de que deseas reversar esta aplicación de pago?</p>
              <p style={{ marginTop: "0.5rem" }}>
                <strong>Id. Aplicación:</strong> {applicationToReverse.id}
              </p>
              <p>
                <strong>Cliente:</strong> {applicationToReverse.client_name}
              </p>
              <p>
                <strong>Recaudo:</strong>{" "}
                {formatMoney(applicationToReverse.amount, { hideDecimals: true })}
              </p>
              <p>
                <strong>Id. Pago Cashport:</strong>{" "}
                {applicationToReverse.payment_ids?.length
                  ? applicationToReverse.payment_ids.join(", ")
                  : "-"}
              </p>
              <p style={{ marginTop: "0.5rem", color: "#888" }}>
                Esta acción no se puede deshacer. Las facturas vinculadas volverán a estar
                disponibles y los pagos quedarán sin aplicar.
              </p>
            </div>
          ) : null
        }
      />
    </>
  );
};

export default PaymentApplicationsTable;
