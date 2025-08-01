import { FC, Key, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Flex, MenuProps } from "antd";

import { useAppStore } from "@/lib/store/store";
import { deleteOrders, getAllOrders } from "@/services/commerce/commerce";
import { useMessageApi } from "@/context/MessageContext";
import UiSearchInput from "@/components/ui/search-input";
import FilterDiscounts from "@/components/atoms/Filters/FilterDiscounts/FilterDiscounts";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import LabelCollapse from "@/components/ui/label-collapse";
import Collapse from "@/components/ui/collapse";
import OrdersViewTable from "../../components/orders-view-table/orders-view-table";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import { OrdersGenerateActionModal } from "../../components/orders-generate-action-modal/orders-generate-action-modal";

import { IOrder } from "@/types/commerce/ICommerce";

import styles from "./orders-view.module.scss";
import { useDebounce } from "@/hooks/useSearch";

interface IOrdersByCategory {
  status: string;
  color: string;
  count: number;
  orders: IOrder[];
}

export const OrdersView: FC = () => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [ordersByCategory, setOrdersByCategory] = useState<IOrdersByCategory[]>();
  const [filteredOrdersByCategory, setFilteredOrdersByCategory] = useState<IOrdersByCategory[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isOpenModalRemove, setIsOpenModalRemove] = useState<boolean>(false);
  const [isGenerateActionModalOpen, setIsGenerateActionModalOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IOrder[] | undefined>([]);
  const [fetchMutate, setFetchMutate] = useState<boolean>(false);

  const { showMessage } = useMessageApi();

  const fetchOrders = async () => {
    const response = await getAllOrders(projectId);
    if (response.status === 200) {
      setOrdersByCategory(response.data);
      setFilteredOrdersByCategory(response.data);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchOrders();
  }, [projectId, fetchMutate]);

  useEffect(() => {
    if (!ordersByCategory) return;

    if (!debouncedSearchTerm) {
      setFilteredOrdersByCategory(ordersByCategory);
      return;
    }

    const searchTermLower = debouncedSearchTerm.toLowerCase();
    const filtered = ordersByCategory.map((category) => ({
      ...category,
      orders: category.orders.filter((order) => {
        // Add more fields to search through as needed
        return (
          order.id?.toString().toLowerCase().includes(searchTermLower) ||
          order.client_name?.toLowerCase().includes(searchTermLower)
        );
      }),
      count: category.orders.filter((order) => {
        return (
          order.id?.toString().toLowerCase().includes(searchTermLower) ||
          order.client_name?.toLowerCase().includes(searchTermLower)
        );
      }).length
    }));

    setFilteredOrdersByCategory(filtered);
  }, [debouncedSearchTerm, ordersByCategory]);

  const handleDeleteOrders = async () => {
    const selectedOrdersIds = selectedRows?.map((order) => order.id);
    if (!selectedOrdersIds) return;
    await deleteOrders(selectedOrdersIds, showMessage);
    setIsOpenModalRemove(false);
    fetchOrders();
  };

  const handleisGenerateActionOpen = () => {
    if (selectedRows && selectedRows?.length > 0) {
      setIsGenerateActionModalOpen(!isGenerateActionModalOpen);
      return;
    }
    showMessage("error", "Selecciona al menos un pedido");
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={() => setIsOpenModalRemove(true)}>
          Eliminar
        </Button>
      )
    },
    {
      key: "2",
      label: (
        <Button className="buttonOutlined" onClick={handleisGenerateActionOpen}>
          Generar acción
        </Button>
      )
    }
  ];

  return (
    <div className={styles.ordersView}>
      <Flex className={styles.FlexContainer} vertical>
        <Flex className={styles.header}>
          <UiSearchInput
            placeholder="Buscar"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <FilterDiscounts />
          <DotsDropdown items={items} />
          <Link href="/comercio/pedido" className={styles.ctaButton}>
            <PrincipalButton>Crear orden</PrincipalButton>
          </Link>
        </Flex>
        <Collapse
          items={filteredOrdersByCategory?.map((order) => ({
            key: order.status,
            label: (
              <LabelCollapse
                status={order.status}
                quantity={order.count}
                color={order.color}
                removeIcons
              />
            ),
            children: (
              <OrdersViewTable
                dataSingleOrder={order.orders}
                setSelectedRows={setSelectedRows}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                orderStatus={order.status}
                setFetchMutate={setFetchMutate}
              />
            )
          }))}
          defaultActiveKey="Pedidos creados"
        />
      </Flex>
      <ModalRemove
        isMassiveAction={true}
        name="pedidos"
        isOpen={isOpenModalRemove}
        onClose={() => setIsOpenModalRemove(false)}
        onRemove={handleDeleteOrders}
      />
      <OrdersGenerateActionModal
        isOpen={isGenerateActionModalOpen}
        onClose={() => setIsGenerateActionModalOpen((prev) => !prev)}
        ordersId={selectedRows?.map((order) => order.id) || []}
        setFetchMutate={setFetchMutate}
        setSelectedRows={setSelectedRows}
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </div>
  );
};

export default OrdersView;
