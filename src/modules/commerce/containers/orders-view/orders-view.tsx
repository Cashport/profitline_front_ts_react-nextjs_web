import { FC, Key, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Flex } from "antd";
import { DotsThree } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { deleteOrders, getAllOrders } from "@/services/commerce/commerce";
import { useMessageApi } from "@/context/MessageContext";

import useScreenWidth from "@/components/hooks/useScreenWidth";
import { useDebounce } from "@/hooks/useSearch";

import UiSearchInput from "@/components/ui/search-input";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import LabelCollapse from "@/components/ui/label-collapse";
import Collapse from "@/components/ui/collapse";
import OrdersViewTable from "../../components/orders-view-table/orders-view-table";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import { OrdersGenerateActionModal } from "../../components/orders-generate-action-modal/orders-generate-action-modal";

import { IOrder } from "@/types/commerce/ICommerce";

import styles from "./orders-view.module.scss";

interface IOrdersByCategory {
  status: string;
  color: string;
  count: number;
  orders: IOrder[];
  total: number;
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
  const width = useScreenWidth();

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

  const handleIsGenerateActionOpen = () => {
    if (selectedRows && selectedRows?.length > 0) {
      setIsGenerateActionModalOpen(!isGenerateActionModalOpen);
      return;
    }
    showMessage("error", "Selecciona al menos un pedido");
  };

  return (
    <div className={styles.ordersView}>
      <Flex className={styles.FlexContainer} vertical>
        <Flex className={styles.header}>
          <UiSearchInput
            placeholder="Buscar"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button
            className={styles.generateActionButton}
            size="large"
            icon={<DotsThree size={"1.5rem"} />}
            disabled={false}
            onClick={handleIsGenerateActionOpen}
          >
            Generar acción
          </Button>
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
                total={order.total}
                color={order.color}
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
                onlyKeyInfo={width < 900}
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
        handleDeleteRows={() => {
          setIsGenerateActionModalOpen(false);
          setIsOpenModalRemove(true);
        }}
      />
    </div>
  );
};

export default OrdersView;
