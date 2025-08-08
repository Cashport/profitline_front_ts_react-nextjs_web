import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, Typography, Button, Table, Flex, Radio, message } from "antd";
import { CaretLeft, Eye } from "phosphor-react";
import { ColumnsType } from "antd/es/table";
import { useAppStore } from "@/lib/store/store";
import {
  getInventoriesWarehouse,
  getWarehouseProducts,
  updateWarehouse
} from "@/services/commerce/commerce";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  selectedOrder: number;
  currentWarehouseId: number;
  onClose: () => void;
  setFetchMutate: Dispatch<SetStateAction<boolean>>;
}
export interface InventoriesByWarehouse {
  id: number;
  warehouse: string;
  availability: boolean;
  availability_msg: string;
}

export interface WarehouseProductsStock {
  sku: string;
  quantity: number;
  requested: number;
  inWarehouse: number;
}

export const ChangeWarehouseModal: React.FC<Props> = ({
  selectedOrder,
  currentWarehouseId,
  isOpen,
  onClose,
  setFetchMutate
}) => {
  const [view, setView] = useState<"change-warehouse" | "warehouse-detail">("change-warehouse");
  const [warehouseSelected, setWarehouseSelected] = useState<number | null>(currentWarehouseId);
  const [viewWarehouseDetails, setViewWarehouseDetails] = useState<InventoriesByWarehouse | null>(
    null
  );
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [inventoriesByWarehouse, setInventoriesByWarehouse] = useState<InventoriesByWarehouse[]>(
    []
  );
  const [warehouseProductsStock, setWarehouseProductsStock] = useState<WarehouseProductsStock[]>(
    []
  );
  useEffect(() => {
    if (isOpen) {
      setWarehouseSelected(currentWarehouseId);
    }
  }, [currentWarehouseId, isOpen]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true);
      const response = await getInventoriesWarehouse(projectId, [selectedOrder ?? 0]);
      setInventoriesByWarehouse(response);
      setLoading(false);
    };
    isOpen && fetchWarehouses();
  }, [selectedOrder]);

  useEffect(() => {
    const fetchWarehouseStock = async () => {
      setLoading(true);
      if (viewWarehouseDetails?.id) {
        const response = await getWarehouseProducts(
          projectId,
          viewWarehouseDetails?.id,
          selectedOrder
        );
        setWarehouseProductsStock(response);
      }
      setLoading(false);
    };
    isOpen && fetchWarehouseStock();
  }, [viewWarehouseDetails?.id]);

  const columns: ColumnsType<InventoriesByWarehouse> = [
    {
      title: "Bodega",
      dataIndex: "warehouse",
      key: "warehouse",
      render: (warehouse, record) => (
        <Flex gap={12}>
          <Radio
            checked={warehouseSelected === record.id}
            onChange={() => setWarehouseSelected(record.id)}
          />
          <Text>{warehouse}</Text>
        </Flex>
      )
    },
    {
      title: "Inventario",
      dataIndex: "availability",
      key: "availability",
      render: (availability: boolean) => (
        <Text {...(availability && { type: "success" })}>
          {availability ? "Stock disponible" : "No hay stock"}
        </Text>
      )
    },
    {
      title: "Detalle",
      key: "buttonSeeDetail",
      dataIndex: "",
      render: (_, row) => (
        <Button
          onClick={() => {
            setView("warehouse-detail");
            setViewWarehouseDetails(row);
          }}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];
  const columnsDetails: ColumnsType<WarehouseProductsStock> = [
    {
      title: "Producto",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Pedido",
      dataIndex: "requested",
      key: "requested"
    },
    {
      title: "Stock",
      dataIndex: "inWarehouse",
      key: "inWarehouse",
      render: (inWarehouse: number, record: WarehouseProductsStock) => (
        <Text {...(inWarehouse < record.requested && { type: "danger" })}>{inWarehouse}</Text>
      )
    }
  ];

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      const orderIds = [selectedOrder];
      await updateWarehouse(orderIds, warehouseSelected as number);
      message.success("Bodega actualizada", 2, onClose);
      setFetchMutate((prev) => !prev);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al actualizar la bodega",
        3,
        onClose
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const renderView = () => {
    const viewMap = {
      "change-warehouse": (
        <Table
          dataSource={inventoriesByWarehouse}
          columns={columns}
          pagination={false}
          rowKey={"id"}
        />
      ),
      "warehouse-detail": (
        <Table
          dataSource={warehouseProductsStock}
          columns={columnsDetails}
          pagination={false}
          rowKey={"sku"}
        />
      )
    };

    return viewMap[view] || viewMap["change-warehouse"];
  };

  return (
    <Modal
      centered
      width={686}
      open={isOpen}
      title={
        <Flex gap={8} align="center" style={{ alignItems: "center" }}>
          <Button
            type="text"
            onClick={() => {
              if (view === "change-warehouse") {
                onClose();
              } else {
                setView("change-warehouse");
                setViewWarehouseDetails(null);
              }
            }}
            icon={<CaretLeft size={"1.3rem"} />}
          />
          <Title level={4} style={{ marginBottom: 0 }}>
            {view === "change-warehouse"
              ? "Cambiar bodega"
              : `Bodega ${viewWarehouseDetails?.warehouse}`}
          </Title>
        </Flex>
      }
      styles={{ body: { maxHeight: "30rem", overflowY: "auto", paddingRight: "0.5rem" } }}
      footer={
        view === "change-warehouse" && (
          <FooterButtons
            titleConfirm="Guardar bodega"
            onClose={onClose}
            handleOk={onSubmit}
            isConfirmDisabled={warehouseSelected === currentWarehouseId}
            isConfirmLoading={loadingSubmit}
          />
        )
      }
      onCancel={onClose}
      className="agreement-detail-modal"
      closeIcon={null}
      loading={loading}
    >
      {renderView()}
    </Modal>
  );
};
