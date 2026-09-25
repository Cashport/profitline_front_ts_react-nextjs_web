import { useMemo, useState } from "react";
import { Button, Flex, Modal, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircle,
  MapPin,
  Package,
  Receipt,
  ShoppingCartSimple,
  Storefront
} from "@phosphor-icons/react";

import { formatCurrencyMoney } from "@/utils/utils";
import {
  IUploadedPurchaseOrder,
  IUploadPurchaseOrdersData
} from "@/services/commerce/commerce";

import "./upload-purchase-orders-summary-modal.scss";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  data: IUploadPurchaseOrdersData | null;
  onClose: () => void;
}

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

const SummaryTile = ({ icon, label, value, highlight }: SummaryTileProps) => (
  <div className={`uploadPurchaseOrdersSummaryModal__tile${highlight ? "--highlight" : ""}`}>
    <div className="uploadPurchaseOrdersSummaryModal__tileIcon">{icon}</div>
    <div className="uploadPurchaseOrdersSummaryModal__tileContent">
      <Text type="secondary" className="uploadPurchaseOrdersSummaryModal__tileLabel">
        {label}
      </Text>
      <Text strong className="uploadPurchaseOrdersSummaryModal__tileValue">
        {value}
      </Text>
    </div>
  </div>
);

export const UploadPurchaseOrdersSummaryModal = ({ isOpen, data, onClose }: Props) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const orders = data?.orders ?? [];

  const columns: ColumnsType<IUploadedPurchaseOrder> = useMemo(
    () => [
      {
        title: "# Orden",
        dataIndex: "orderId",
        key: "orderId",
        width: 110,
        render: (value: number) => <span className="uploadPurchaseOrdersSummaryModal__mono">{value}</span>
      },
      {
        title: "Código Iscala",
        dataIndex: "codigoIscala",
        key: "codigoIscala",
        width: 150,
        render: (value: string) => <span className="uploadPurchaseOrdersSummaryModal__mono">{value}</span>
      },
      {
        title: "Dirección",
        dataIndex: "direccion",
        key: "direccion",
        render: (value: string) => (
          <Flex align="center" gap="0.4rem">
            <MapPin size={14} weight="duotone" />
            <Text className="uploadPurchaseOrdersSummaryModal__address">{value}</Text>
          </Flex>
        )
      },
      {
        title: "Ciudad",
        dataIndex: "ciudad",
        key: "ciudad",
        width: 140
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        width: 160,
        align: "right",
        render: (value: number) => (
          <span className="uploadPurchaseOrdersSummaryModal__mono">
            {formatCurrencyMoney(value)}
          </span>
        )
      }
    ],
    []
  );

  return (
    <Modal
      className="uploadPurchaseOrdersSummaryModal"
      open={isOpen}
      onCancel={onClose}
      footer={
        <Flex justify="flex-end" gap="0.5rem">
          <Button type="primary" onClick={onClose} className="uploadPurchaseOrdersSummaryModal__ok">
            Aceptar
          </Button>
        </Flex>
      }
      width={920}
      centered
      destroyOnClose
      title={
        <Flex align="center" gap="0.6rem">
          <CheckCircle size={26} weight="fill" className="uploadPurchaseOrdersSummaryModal__titleIcon" />
          <Title level={4} style={{ margin: 0 }}>
            Órdenes de compra procesadas
          </Title>
        </Flex>
      }
    >
      {data && (
        <Flex vertical gap="1.25rem">
          <div className="uploadPurchaseOrdersSummaryModal__successBanner">
            <CheckCircle size={20} weight="fill" />
            <Text strong>OC procesadas correctamente</Text>
          </div>

          <div className="uploadPurchaseOrdersSummaryModal__tiles">
            <SummaryTile
              icon={<Package size={22} weight="duotone" />}
              label="Paquete"
              value={`#${data.packageId}`}
            />
            <SummaryTile
              icon={<Receipt size={22} weight="duotone" />}
              label="Borrador"
              value={`#${data.draftId}`}
            />
            <SummaryTile
              icon={<ShoppingCartSimple size={22} weight="duotone" />}
              label="Órdenes creadas"
              value={data.summary.ordersCreated}
              highlight
            />
            <SummaryTile
              icon={<Storefront size={22} weight="duotone" />}
              label="SKUs procesados"
              value={data.summary.skusProcessed}
            />
            <SummaryTile
              icon={<Receipt size={22} weight="duotone" />}
              label="Monto total"
              value={formatCurrencyMoney(data.summary.totalAmount)}
              highlight
            />
          </div>

          <div className="uploadPurchaseOrdersSummaryModal__tableWrapper">
            <Flex
              align="center"
              justify="space-between"
              className="uploadPurchaseOrdersSummaryModal__tableHeader"
            >
              <Text strong>Detalle de órdenes ({orders.length})</Text>
              <Text type="secondary" className="uploadPurchaseOrdersSummaryModal__tableHint">
                Mostrando {Math.min(pageSize, orders.length)} de {orders.length}
              </Text>
            </Flex>
            <Table<IUploadedPurchaseOrder>
              size="small"
              rowKey="orderId"
              columns={columns}
              dataSource={orders}
              pagination={{
                current: page,
                pageSize,
                total: orders.length,
                showSizeChanger: false,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                }
              }}
              scroll={{ x: 720 }}
            />
          </div>
        </Flex>
      )}
    </Modal>
  );
};
