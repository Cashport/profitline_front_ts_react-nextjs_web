import { Dispatch, Key, ReactNode, SetStateAction, useState } from "react";
import { Button, Dropdown, MenuProps, message, Table, TableProps, Tooltip, Typography } from "antd";
import {
  DotsThreeVertical,
  Eye,
  NewspaperClipping,
  Receipt,
  WarningCircle,
  WarningDiamond
} from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";
import { reprocessOrder } from "@/services/commerce/commerce";
import { formatDateDMY, formatTimeAgo } from "@/utils/utils";

import OrderTrackingModal from "@/components/molecules/modals/OrderTrackingModal";
import { ChangeWarehouseModal } from "@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal";
import TablePaginator from "@/components/atoms/tablePaginator/TablePaginator";
// import { getTagColor } from "@/components/organisms/proveedores/utils/utils";
// import { Tag } from "@/components/atoms/Tag/Tag";

import { IDraftOrder, IOrder, IOrderData } from "@/types/commerce/ICommerce";

import "./orders-view-table.scss";
const { Text } = Typography;

interface PropsOrdersViewTable {
  dataSingleOrder: IOrderData | undefined;
  setSelectedRows: Dispatch<SetStateAction<IOrder[] | undefined>>;
  setSelectedRowKeys: Dispatch<SetStateAction<Key[]>>;
  selectedRowKeys: Key[];
  orderStatus: string;
  setFetchMutate: () => void;
  onlyKeyInfo?: boolean;
  onChangePage: (statusId: number, page: number) => void;
  currentPage?: number;
  isLoadingPagination?: boolean;
}

const OrdersViewTable = ({
  dataSingleOrder: data,
  setSelectedRows,
  setSelectedRowKeys,
  selectedRowKeys,
  orderStatus,
  setFetchMutate,
  onlyKeyInfo = false,
  onChangePage,
  currentPage,
  isLoadingPagination = false
}: PropsOrdersViewTable) => {
  const setDraftInfo = useAppStore((state) => state.setDraftInfo);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { openModal } = useModalDetail();
  const { showMessage } = useMessageApi();

  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [currentWarehouseId, setCurrentWarehouseId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState<boolean>(false);

  const REJECTED_STATUS_ID = 6;
  const WALLET_BLOCKED_STATUS_ID = 5;
  const NOVELTY_STATUS_IDS = [WALLET_BLOCKED_STATUS_ID, REJECTED_STATUS_ID];

  const handleResendToBilling = async (orderId: number) => {
    const hide = message.open({
      type: "loading",
      content: "Reenviando a facturación...",
      duration: 0
    });
    try {
      await reprocessOrder(orderId);
      showMessage("success", "Orden reenviada a facturación correctamente");
      setFetchMutate();
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Error al reenviar a facturación"
      );
    } finally {
      hide();
    }
  };

  const handleSeeDetail = (order: IOrder | IDraftOrder) => {
    if ("is_draft" in order) {
      setDraftInfo({
        id: order.id,
        client_name: order.client_name
      });
      window.open("/comercio/pedido", "_blank");
      return;
    }

    const notificationQuery = order.notification_id ? `?notification=${order.notification_id}` : "";
    setDraftInfo({
      id: undefined,
      client_name: undefined
    });
    window.open(`/comercio/pedidoConfirmado/${order.id}${notificationQuery}`, "_blank");
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: IOrder[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length >= 1) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows) {
          const filteredSelectedRows = newSelectedRows.filter(
            (newSelectedRow) =>
              !prevSelectedRows.some((prevSelectedRow) => prevSelectedRow.id === newSelectedRow.id)
          );
          const unCheckedRows = prevSelectedRows.filter(
            (prevSelectedRow) =>
              !newSelectedRowKeys.includes(prevSelectedRow.id) &&
              prevSelectedRow.order_status === orderStatus // Assuming you have an orderStatus variable
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
            (prevSelectedRow) => prevSelectedRow.order_status !== orderStatus
          );
        }
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const allColumns: TableProps<IOrder>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (invoiceId, row) => (
        <div className="ordersViewTable__idCell">
          <Text className="ordersViewTable__id" onClick={() => handleSeeDetail(row)}>
            {row.operation_number}
          </Text>
          {row.marketplace_number && (
            <Text className="ordersViewTable__marketplace">{row.marketplace_number}</Text>
          )}
        </div>
      ),
      sorter: (a, b) => a.operation_number - b.operation_number,
      showSorterTooltip: false
    },
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      title: "Ciudad",
      key: "city",
      dataIndex: "city",
      width: 260,
      render: (_, row) => (
        <Tooltip
          placement="topLeft"
          overlayClassName="locationTooltip"
          title={
            <>
              {row.address && <span>{row.address}</span>}
              {row.city && <span>{row.city}</span>}
              {row.contacto && <span>{row.contacto}</span>}
            </>
          }
        >
          <div className="locationCell">
            <Text className="locationCell__primary">
              {[row.city, row.address].filter(Boolean).join(" - ")}
            </Text>
            <Text className="locationCell__secondary">{row.warehousename}</Text>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => a.city.localeCompare(b.city),
      showSorterTooltip: false
    },
    {
      title: "Unidad de negocio",
      key: "business_unit",
      dataIndex: "business_unit",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => (a.business_unit ?? "").localeCompare(b.business_unit ?? ""),
      showSorterTooltip: false
    },
    {
      title: "Fecha de creación",
      key: "order_date",
      dataIndex: "order_date",
      render: (date) => <Text className="cell">{date ? formatDateDMY(date) : ""}</Text>,
      sorter: (a, b) => new Date(a.order_date)?.getTime() - new Date(b.order_date)?.getTime(),
      showSorterTooltip: false
    },
    {
      title: "Tiempo transcurrido",
      key: "last_datestamp",
      dataIndex: "last_datestamp",
      render: (date: string | null) => (
        <Text className="cell">{`${date ? formatTimeAgo(date) : ""}`}</Text>
      ),
      sorter: (a, b) => {
        const dateA = a.last_datestamp ? new Date(a.last_datestamp).getTime() : 0;
        const dateB = b.last_datestamp ? new Date(b.last_datestamp).getTime() : 0;
        return dateA - dateB;
      },
      showSorterTooltip: false
    },
    {
      title: "Vendedor",
      key: "vendor_name",
      dataIndex: "vendor_name",
      render: (text) => <Text className="cell">{text}</Text>
    },
    // TO DO: Uncomment when the status column is needed
    // {
    //   title: "Estado",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (status: string) => {
    //     if (!status) status = "En tránsito";
    //     const getTagColor = (status: string) => {
    //       let color;
    //       switch (status) {
    //         case "En tránsito":
    //           color = "#0085FF";
    //           break;
    //         case "Entregado":
    //           color = "#00DE16";
    //           break;
    //         case "Rechazado":
    //           color = "#E53261";
    //           break;
    //         case "Alistando":
    //           color = "#FF6A00";
    //           break;
    //         default:
    //           color = "black";
    //       }
    //       return color;
    //     };
    //     const color = getTagColor(status);

    //     return (
    //       <Flex wrap={false}>
    //         <Button onClick={() => setIsOrderTrackingModalOpen(true)}>
    //           <Tag
    //             color={color}
    //             content={status}
    //             style={{ fontSize: 14, fontWeight: 400 }}
    //             icon={
    //               <div
    //                 style={{ backgroundColor: color, width: 6, height: 6, borderRadius: "50%" }}
    //               />
    //             }
    //             iconPosition="left"
    //             withBorder={false}
    //           />
    //         </Button>
    //       </Flex>
    //     );
    //   }
    // },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      render: (amount, row) => (
        <Tooltip
          placement="topRight"
          overlayClassName="prontoPagoTooltip"
          title={
            row.total_pronto_pago != null ? (
              <>
                <span>Pronto pago</span>
                <span className="fontMonoSpace">
                  {formatMoney(row.total_pronto_pago, { hideDecimals: true })}
                </span>
              </>
            ) : null
          }
        >
          <p className="cell fontMonoSpace bold">{formatMoney(amount, { hideDecimals: true })}</p>
        </Tooltip>
      ),
      sorter: (a, b) => a.total - b.total,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "",
      key: "buttonOpenModal",
      width: 64,
      dataIndex: "",
      render: (_, row) => {
        const isBlockedByWallet = row.order_status_id === WALLET_BLOCKED_STATUS_ID;
        const hasNovelty =
          NOVELTY_STATUS_IDS.includes(row.order_status_id) && row.incident_id !== null;

        const items: NonNullable<MenuProps["items"]> = [];

        if (hasNovelty) {
          items.push({
            key: "verNovedad",
            label: (
              <Button
                icon={<WarningCircle size={20} />}
                className="buttonNoBorder"
                onClick={() =>
                  openModal("novelty", {
                    noveltyId: row.incident_id as number,
                    onResolved: setFetchMutate
                  })
                }
              >
                Ver novedad
              </Button>
            )
          });
        }

        if (!isBlockedByWallet) {
          items.push(
            {
              key: "verBodega",
              label: (
                <Button
                  icon={<WarningDiamond size={20} />}
                  className="buttonNoBorder"
                  onClick={() => {
                    setSelectedOrder(row.id);
                    setCurrentWarehouseId(row.warehouseid);
                    setIsModalOpen(true);
                  }}
                >
                  Ver bodega
                </Button>
              )
            },
            {
              key: "detalle",
              label: (
                <Button
                  icon={row.is_draft ? <NewspaperClipping size={20} /> : <Eye size={20} />}
                  className="buttonNoBorder"
                  onClick={() => handleSeeDetail(row)}
                >
                  {row.is_draft ? "Continuar pedido" : "Detalle"}
                </Button>
              )
            }
          );
        }

        if (row.order_status_id === REJECTED_STATUS_ID) {
          items.push({
            key: "resendToBilling",
            label: (
              <Button
                icon={<Receipt size={20} />}
                className="buttonNoBorder"
                onClick={() => handleResendToBilling(row.id)}
              >
                Reenviar a facturación
              </Button>
            )
          });
        }

        const customDropdown = (menu: ReactNode) => (
          <div className="dropdownApplicationTable">{menu}</div>
        );

        return (
          <Dropdown
            dropdownRender={customDropdown}
            menu={{ items }}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <Button className="dotsBtn">
              <DotsThreeVertical size={16} />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  const columns = onlyKeyInfo
    ? allColumns.filter((col) =>
        ["id", "client_name", "total", "buttonOpenModal"].includes(col.key as string)
      )
    : allColumns;

  return (
    <>
      <Table
        className="ordersViewTable"
        columns={columns}
        dataSource={data?.orders?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        pagination={{
          current: currentPage || data?.pagination?.page || 1,
          pageSize: data?.pagination?.limit || 25,
          total: data?.pagination?.total_count || 0,
          showSizeChanger: false,
          position: ["none", "bottomRight"],
          onChange: (page) => onChangePage(data?.status_id || 0, page),
          itemRender: TablePaginator
        }}
        loading={isLoadingPagination}
      />
      <ChangeWarehouseModal
        selectedOrder={selectedOrder ?? 0}
        currentWarehouseId={currentWarehouseId ?? 0}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setFetchMutate={setFetchMutate}
      />
      <OrderTrackingModal
        isOpen={isOrderTrackingModalOpen}
        onClose={() => setIsOrderTrackingModalOpen(false)}
        idInvoice={1}
      />
    </>
  );
};

export default OrdersViewTable;
