import { Dispatch, Key, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, Table, TableProps, Typography } from "antd";
import { Eye } from "phosphor-react";
import { WarningDiamond } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { formatDateDMY, formatTimeAgo } from "@/utils/utils";

import OrderTrackingModal from "@/components/molecules/modals/OrderTrackingModal";
import { ChangeWarehouseModal } from "@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal";
// import { getTagColor } from "@/components/organisms/proveedores/utils/utils";
// import { Tag } from "@/components/atoms/Tag/Tag";

import { IOrder } from "@/types/commerce/ICommerce";

import "./orders-view-table.scss";
const { Text } = Typography;

interface PropsOrdersViewTable {
  dataSingleOrder: any[];
  setSelectedRows: Dispatch<SetStateAction<IOrder[] | undefined>>;
  setSelectedRowKeys: Dispatch<SetStateAction<Key[]>>;
  selectedRowKeys: Key[];
  orderStatus: string;
  setFetchMutate: () => void;
  onlyKeyInfo?: boolean;
}

const OrdersViewTable = ({
  dataSingleOrder: data,
  setSelectedRows,
  setSelectedRowKeys,
  selectedRowKeys,
  orderStatus,
  setFetchMutate,
  onlyKeyInfo = false
}: PropsOrdersViewTable) => {
  const router = useRouter();
  const setDraftInfo = useAppStore((state) => state.setDraftInfo);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [currentWarehouseId, setCurrentWarehouseId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState<boolean>(false);

  const handleSeeDetail = (order: IOrder) => {
    const { id: orderId, order_status } = order;

    console.log(order);
    if (order_status === "Borrador") {
      const draftInfo = {
        id: orderId,
        client_name: order.client_name
      };
      setDraftInfo(draftInfo);
      router.push("/comercio/pedido");
    } else {
      const url = `/comercio/pedidoConfirmado/${orderId}`;
      router.prefetch(url);
      router.push(url);
    }
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
      render: (amount) => <Text className="cell">{formatMoney(amount)}</Text>,
      sorter: (a, b) => a.total_pronto_pago - b.total_pronto_pago,
      showSorterTooltip: false,
      align: "right"
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      render: (amount) => <Text className="cell">{formatMoney(amount)}</Text>,
      sorter: (a, b) => a.total - b.total,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "buttonOpenModal",
      width: 64,
      dataIndex: "",
      render: (_, row) => (
        <Flex gap={8}>
          <Button
            onClick={() => {
              setSelectedOrder(row.id);
              setCurrentWarehouseId(row.warehouseid);
              setIsModalOpen(true);
            }}
            className="buttonSeeProject"
            icon={<WarningDiamond size={"1.3rem"} />}
          />
          <Button
            onClick={() => handleSeeDetail(row)}
            className="buttonSeeProject"
            icon={<Eye size={"1.3rem"} />}
          />
        </Flex>
      )
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
        dataSource={data.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        pagination={false}
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
