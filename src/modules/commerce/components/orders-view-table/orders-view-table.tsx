import { Dispatch, Key, ReactNode, SetStateAction, useState } from "react";
import { Button, Dropdown, Table, TableProps, Typography } from "antd";
import { DotsThreeVertical, Eye, WarningCircle, WarningDiamond } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
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

  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [currentWarehouseId, setCurrentWarehouseId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState<boolean>(false);

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
      title: "TR",
      dataIndex: "id",
      key: "id",
      render: (invoiceId, row) => (
        <Text className="ordersViewTable__id" onClick={() => handleSeeDetail(row)}>
          {row.operation_number}
        </Text>
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
      title: "Fecha de creación",
      key: "order_date",
      dataIndex: "order_date",
      render: (date) => <Text className="cell">{date ? formatDateDMY(date) : ""}</Text>,
      sorter: (a, b) => new Date(a.order_date)?.getTime() - new Date(b.order_date)?.getTime(),
      showSorterTooltip: false
    },
    {
      title: "Ciudad",
      key: "city",
      dataIndex: "city",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.city.localeCompare(b.city),
      showSorterTooltip: false
    },
    {
      title: "Bodega",
      key: "warehousename",
      dataIndex: "warehousename",
      render: (warehousename) => <Text className="cell">{warehousename}</Text>,
      sorter: (a, b) => a.warehousename.localeCompare(b.warehousename),
      showSorterTooltip: false
    },
    {
      title: "Contacto",
      key: "contacto",
      dataIndex: "contacto",
      render: (text) => <Text className="cell">{text}</Text>
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
      title: "Total pronto pago",
      key: "total_pronto_pago",
      dataIndex: "total_pronto_pago",
      render: (amount) => (
        <p className="cell fontMonoSpace">{formatMoney(amount, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => a.total_pronto_pago - b.total_pronto_pago,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      render: (amount) => (
        <p className="cell fontMonoSpace bold">{formatMoney(amount, { hideDecimals: true })}</p>
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
        const items = [
          {
            key: "verBodega",
            label: (
              <Button
                disabled={row.order_status === "Pedidos en proceso"}
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
                icon={<Eye size={20} />}
                className="buttonNoBorder"
                onClick={() => handleSeeDetail(row)}
              >
                Detalle
              </Button>
            )
          }
        ];

        if (row.incident_id !== null && row.order_status_id == 5) {
          items.push({
            key: "verNovedad",
            label: (
              <Button
                icon={<WarningCircle size={20} />}
                className="buttonNoBorder"
                onClick={() => openModal("novelty", { noveltyId: row.incident_id as number })}
              >
                Ver novedad
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
    ? allColumns.filter((col) => ["id", "client_name", "total"].includes(col.key as string))
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
