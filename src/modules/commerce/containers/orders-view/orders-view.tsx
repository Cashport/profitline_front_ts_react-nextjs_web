import { FC, Key, useState, useMemo } from "react";
import Link from "next/link";
import { Button, Flex, message, Spin } from "antd";
import { DotsThree, Plus, PresentationChart } from "@phosphor-icons/react";

import { deleteOrders } from "@/services/commerce/commerce";
import { useMessageApi } from "@/context/MessageContext";

import useScreenWidth from "@/components/hooks/useScreenWidth";
import { useDebounce } from "@/hooks/useSearch";
import { useOrders } from "../../hooks/orders-view/useOrders";

import UiSearchInput from "@/components/ui/search-input";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import LabelCollapse from "@/components/ui/label-collapse";
import Collapse from "@/components/ui/collapse";
import OrdersViewTable from "../../components/orders-view-table/orders-view-table";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import { OrdersGenerateActionModal } from "../../components/orders-generate-action-modal/orders-generate-action-modal";
import {
  FilterMarketplaceOrders,
  IMarketplaceOrderFilters
} from "@/components/atoms/Filters/FilterMarketplaceOrders/FilterMarketplaceOrders";
import { SendInviteModal } from "../../components/send-invite-modal/send-invite-modal";

import { IOrder } from "@/types/commerce/ICommerce";

import styles from "./orders-view.module.scss";

export const OrdersView: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isOpenModalRemove, setIsOpenModalRemove] = useState<boolean>(false);
  const [isGenerateActionModalOpen, setIsGenerateActionModalOpen] = useState<boolean>(false);
  const [isSendInviteModalOpen, setIsSendInviteModalOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IOrder[] | undefined>([]);
  const [selectedFilters, setSelectedFilters] = useState<IMarketplaceOrderFilters>({
    sellers: []
  });

  // Usar el nuevo hook useOrders
  const { ordersByCategory, isLoading, mutate } = useOrders({
    selectedFilters
  });

  const { showMessage } = useMessageApi();
  const width = useScreenWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 900;

  // Filtrar las órdenes basándose en el término de búsqueda
  const filteredOrdersByCategory = useMemo(() => {
    if (!ordersByCategory) return undefined;

    if (!debouncedSearchTerm) {
      return ordersByCategory;
    }

    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return ordersByCategory.map((category) => {
      const filteredOrders = category.orders.filter((order) => {
        // Add more fields to search through as needed
        return (
          order.client_name?.toLowerCase().includes(searchTermLower) ||
          order.operation_number?.toString().toLowerCase().includes(searchTermLower)
        );
      });

      return {
        ...category,
        orders: filteredOrders,
        count: filteredOrders.length
      };
    });
  }, [debouncedSearchTerm, ordersByCategory]);

  const handleDeleteOrders = async () => {
    const selectedOrdersIds = selectedRows?.map((order) => order.id);
    if (!selectedOrdersIds) return;

    await deleteOrders(selectedOrdersIds, showMessage);
    setIsOpenModalRemove(false);

    // Revalidar los datos después de eliminar
    mutate();

    // Limpiar la selección
    setSelectedRows([]);
    setSelectedRowKeys([]);
  };

  const handleIsGenerateActionOpen = () => {
    setIsGenerateActionModalOpen(!isGenerateActionModalOpen);
  };

  return (
    <div className={styles.ordersView}>
      <Flex className={styles.FlexContainer} vertical>
        <Flex className={styles.header}>
          <UiSearchInput
            placeholder="Buscar"
            className={styles.searchInput}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button
            className={styles.generateActionButton}
            size="large"
            icon={<DotsThree size={"1.5rem"} />}
            disabled={false}
            onClick={handleIsGenerateActionOpen}
          >
            {isMobile || isTablet ? null : "Generar acción"}
          </Button>
          <FilterMarketplaceOrders setSelectedFilters={setSelectedFilters} isMobile={isMobile} />
          <Link href="/comercio/dashboard">
            <Button className={styles.generateActionButton} size="large">
              {isMobile || isTablet ? <PresentationChart size={24} /> : "Dashboard"}
            </Button>
          </Link>
          <Link href="/comercio/pedido" className={styles.ctaButton}>
            <PrincipalButton
              className={styles.ctaButton}
              customStyles={{ padding: isMobile ? "7px 12px" : undefined }}
            >
              {isMobile ? <Plus size={24} /> : "Crear orden"}
            </PrincipalButton>
          </Link>
        </Flex>
        {isLoading ? (
          <Spin style={{ margin: "2rem 0" }} />
        ) : (
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
                  setFetchMutate={mutate}
                  onlyKeyInfo={width < 900}
                />
              )
            }))}
            defaultActiveKey="Pedidos creados"
          />
        )}
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
        setFetchMutate={mutate}
        setSelectedRows={setSelectedRows}
        setSelectedRowKeys={setSelectedRowKeys}
        handleDeleteRows={() => {
          if (selectedRows?.length === 0) return message.error("No hay órdenes seleccionadas");
          setIsGenerateActionModalOpen(false);
          setIsOpenModalRemove(true);
        }}
        handleSendInvite={() => {
          setIsGenerateActionModalOpen(false);
          setIsSendInviteModalOpen(true);
        }}
      />
      <SendInviteModal
        isOpen={isSendInviteModalOpen}
        onClose={() => setIsSendInviteModalOpen(false)}
      />
    </div>
  );
};

export default OrdersView;
