import { FC, useEffect, useState } from "react";
import { Flex, Spin, Typography } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "phosphor-react";

import { extractSingleParam, formatNumber, generateShortUuid } from "@/utils/utils";
import { getSingleOrder } from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";

import ProductsTable, { ProductsTableCategory } from "@/modules/commerce/components/products-table";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import ConfirmedOrderShippingInfo from "../../components/confirmed-order-shipping-info";
import ConfirmedOrderModalBlocked from "../../components/confirmed-order-modalBlocked";

import { GALDERMA_PROJECT_ID } from "@/utils/constants/globalConstants";
import { DiscountItem, ISingleOrder } from "@/types/commerce/ICommerce";

import styles from "./confirmed-order.module.scss";

const { Text } = Typography;

export const ConfirmedOrderView: FC = () => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = extractSingleParam(params.orderId);
  const [order, setOrder] = useState<ISingleOrder>();
  const [loading, setLoading] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountItem[]>([]);

  // TO DO: Refactor to use a more robust state management solution if needed
  // notificationIdIsNeeded for sendingNovelty with evidence
  const notificationId = searchParams.get("notification");

  useEffect(() => {
    if (!orderIdParam || !projectId) return;
    const fetchOrder = async () => {
      setLoading(true);
      const response = await getSingleOrder(projectId, parseInt(orderIdParam));
      setOrder(response?.data[0]);
      if (response.data[0].detail?.discounts?.discountItems?.length > 0)
        setAppliedDiscounts(
          response.data[0].detail?.discounts?.discountItems?.map((item) => ({
            ...item,
            item_uuid: item.item_uuid ?? generateShortUuid()
          }))
        );
      setLoading(false);
    };
    fetchOrder();
  }, [params, projectId]);

  const handleGoBack = () => {
    router.push("/comercio/");
  };

  const tableCategories: ProductsTableCategory[] = (order?.detail?.products ?? []).map(
    (category) => ({
      key: category.id_category,
      name: category.category,
      rows: category.products.map((product) => {
        const discountData = appliedDiscounts.find((d) =>
          product.item_uuid
            ? d.item_uuid === product.item_uuid
            : d.product_sku === product.product_sku
        )?.discount;
        const primary =
          discountData && discountData.subtotalDiscount > 0 ? discountData.primary : undefined;
        return {
          key: `${product.id}-${product.product_sku}`,
          description: product.product_name,
          sku: product.product_sku,
          originalPrice: product.price,
          finalPrice: primary?.new_price ?? product.price,
          quantity: product.quantity,
          discountPct: primary?.discount_applied?.discount ?? 0
        };
      })
    })
  );

  const totalCantidad = tableCategories.reduce(
    (sum, category) => sum + category.rows.reduce((s, r) => s + r.quantity, 0),
    0
  );
  const totalMonto = tableCategories.reduce(
    (sum, category) => sum + category.rows.reduce((s, r) => s + r.finalPrice * r.quantity, 0),
    0
  );

  return (
    <>
      {loading ? (
        <Spin size="large" style={{ margin: "auto" }} />
      ) : (
        <>
          {!!order?.block_flag && notificationId !== null && projectId === GALDERMA_PROJECT_ID && (
            <ConfirmedOrderModalBlocked notificationId={Number(notificationId)} />
          )}
          <div className={styles.confirmedOrderView}>
            <div className={styles.confirmedOrderView__content}>
              <div className={styles.confirmedOrderView__content__header}>
                <p>Pedido #{order?.operation_number}</p>
                <div className={styles.title}>
                  <h2>Tu pedido ha sido solicitado</h2>
                  <CheckCircle className={styles.check} size={90} weight="fill" />
                </div>
              </div>

              <div className={styles.summaryContainer}>
                <div className={styles.summaryContainer__top}>
                  <h2>Datos de envío</h2>
                  <div className={styles.shippingData}>
                    <ConfirmedOrderShippingInfo title="Cliente" data={order?.client_name} />
                    <ConfirmedOrderShippingInfo title="Nit" data={order?.client_id} />
                    <ConfirmedOrderShippingInfo
                      title="Dirección de despacho"
                      data={order?.shipping_info?.dispatch_address}
                    />
                    <ConfirmedOrderShippingInfo title="Ciudad" data={order?.shipping_info?.city} />
                    <ConfirmedOrderShippingInfo title="Email" data={order?.shipping_info?.email} />
                    <ConfirmedOrderShippingInfo
                      title="Contacto"
                      data={order?.shipping_info?.phone_number}
                    />
                    <ConfirmedOrderShippingInfo title="Vendedor" data={order?.vendor_name} />
                    <ConfirmedOrderShippingInfo
                      title="Observaciones"
                      data={order?.shipping_info?.comments}
                    />
                  </div>

                  <Flex
                    className={styles.summaryContainer__top__header}
                    align="center"
                    justify="space-between"
                  >
                    <h2>Resumen</h2>
                    <Flex align="end" gap="0.5rem" vertical>
                      <p className={styles.quantity}>SKUs: {order?.detail?.products?.length}</p>
                      <p className={styles.quantity}>
                        Total Productos:{" "}
                        {order?.detail?.products?.length &&
                          order?.detail?.products.reduce(
                            (acc, category) =>
                              acc +
                              category.products.reduce((acc, product) => acc + product.quantity, 0),
                            0
                          )}
                      </p>
                    </Flex>
                  </Flex>

                  <ProductsTable
                    categories={tableCategories}
                    totalCantidad={totalCantidad}
                    totalMonto={totalMonto}
                  />

                  {order?.detail.discount_package_id ? (
                    <div className={styles.discountsContainer}>
                      <h2 className={styles.discountsContainer__title}>Descuento aplicado</h2>
                      <div className={styles.discountsContainer__discounts}>
                        <p key={order?.detail?.discount_package_id}>
                          {order?.detail?.discount_name ?? ""}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.footer}>
                <Flex vertical gap={"0.25rem"}>
                  <Flex justify="space-between">
                    <p>Subtotal</p>
                    <p>${formatNumber(order?.detail?.subtotal ?? 0)}</p>
                  </Flex>
                  <Flex justify="space-between">
                    <p>Descuentos</p>
                    <p>-${formatNumber(order?.detail?.discounts?.totalDiscount ?? 0)}</p>
                  </Flex>
                  <Flex justify="space-between">
                    <Text className={styles.footer__discountExplanation}>
                      Descuentos de productos
                    </Text>
                    <Text className={styles.footer__discountExplanation}>
                      -${formatNumber(order?.detail?.discounts?.totalProductDiscount ?? 0)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text className={styles.footer__discountExplanation}>
                      Descuentos de la orden (Cross selling)
                    </Text>
                    <Text className={styles.footer__discountExplanation}>
                      -${formatNumber(order?.detail?.discounts?.totalOrderDiscount ?? 0)}
                    </Text>
                  </Flex>
                  <div className={styles.footer__separator} />
                  <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
                    <p>Total sin IVA</p>
                    <p>${formatNumber(order?.total_without_taxes ?? 0)}</p>
                  </Flex>
                  <Flex justify="space-between">
                    <p>IVA 19%</p>
                    <p>${formatNumber(order?.detail?.taxes ?? 0)}</p>
                  </Flex>
                  <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
                    <strong>Total</strong>
                    <strong>${formatNumber(order?.total ?? 0)}</strong>
                  </Flex>
                  <Flex className={styles.footer__earlyPaymentTotal} justify="space-between">
                    <p>Total con pronto pago</p>
                    <p>${formatNumber(order?.total_pronto_pago ?? 0)}</p>
                  </Flex>
                </Flex>
                <PrincipalButton onClick={handleGoBack}>Salir</PrincipalButton>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ConfirmedOrderView;
