import { FC, useEffect, useState } from "react";
import { Flex, Spin, Typography } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ConfirmedOrderItem from "../../components/confirmed-order-item";
import { CheckCircle } from "phosphor-react";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import ConfirmedOrderShippingInfo from "../../components/confirmed-order-shipping-info";
import { extractSingleParam, formatNumber } from "@/utils/utils";

import styles from "./confirmed-order.module.scss";
import { getSingleOrder } from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";
import { DiscountItem, ISingleOrder } from "@/types/commerce/ICommerce";
import ConfirmedOrderModalBlocked from "../../components/confirmed-order-modalBlocked";

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
        setAppliedDiscounts(response.data[0].detail?.discounts?.discountItems);
      setLoading(false);
    };
    fetchOrder();
  }, [params, projectId]);

  const handleGoBack = () => {
    router.push("/comercio/");
  };
  return (
    <>
      {loading ? (
        <Spin size="large" style={{ margin: "auto" }} />
      ) : (
        <>
          {!!order?.block_flag && notificationId !== null && (
            <ConfirmedOrderModalBlocked notificationId={Number(notificationId)} />
          )}
          <div className={styles.confirmedOrderView}>
            <div className={styles.confirmedOrderView__content}>
              <div className={styles.confirmedOrderView__content__header}>
                <p>Pedido #{order?.id}</p>
                <div className={styles.title}>
                  <h2>Tu pedido ha sido solicitado</h2>
                  <CheckCircle className={styles.check} size={90} weight="fill" />
                </div>
              </div>

              <div className={styles.summaryContainer}>
                <div className={styles.summaryContainer__top}>
                  <Flex
                    className={styles.summaryContainer__top__header}
                    align="center"
                    justify="space-between"
                  >
                    <h2 className={styles.mainTitle}>Resumen</h2>
                    <p className={styles.quantity}>SKUs: {order?.detail?.products?.length}</p>
                  </Flex>

                  <div className={styles.categories}>
                    {order?.detail?.products?.map((category) => (
                      <div className={styles.category} key={category.id_category}>
                        <Flex justify="space-between" align="center">
                          <p className={styles.category__header}>{category.category}</p>
                          <p className={styles.category__header}>
                            Skus: {category.products.length}
                          </p>
                        </Flex>
                        <div className={styles.products}>
                          {category.products.map((product) => {
                            const productDiscount = appliedDiscounts?.find(
                              (discount: any) => discount.product_sku === product.product_sku
                            )?.discount;
                            const productDiscountData =
                              productDiscount && productDiscount.subtotalDiscount > 0
                                ? {
                                    discountPercentage:
                                      productDiscount.primary?.discount_applied?.discount,
                                    subtotal: productDiscount.primary?.new_price
                                  }
                                : undefined;
                            return (
                              <ConfirmedOrderItem
                                key={product.product_sku}
                                product={product}
                                productDiscount={productDiscountData}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.shippingData}>
                    <h2>Datos de envío</h2>
                    <ConfirmedOrderShippingInfo
                      title="Direcciones"
                      data={order?.shipping_info.address}
                      customStyles={{ gridColumn: "1 / span 2" }}
                    />
                    <ConfirmedOrderShippingInfo title="Ciudad" data={order?.shipping_info?.city} />
                    <ConfirmedOrderShippingInfo
                      title="Dirección de despacho"
                      data={order?.shipping_info?.dispatch_address}
                    />
                    <ConfirmedOrderShippingInfo title="Email" data={order?.shipping_info?.email} />
                    <ConfirmedOrderShippingInfo
                      title="Teléfono contacto"
                      data={order?.shipping_info?.phone_number}
                    />
                    <ConfirmedOrderShippingInfo
                      title="Observaciones"
                      data={order?.shipping_info?.comments}
                      customStyles={{ gridColumn: "1 / span 2" }}
                    />
                  </div>

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
                      Descuentos de la orden
                    </Text>
                    <Text className={styles.footer__discountExplanation}>
                      -${formatNumber(order?.detail?.discounts?.totalOrderDiscount ?? 0)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
                    <strong>Total</strong>
                    <strong>${formatNumber(order?.total ?? 0)}</strong>
                  </Flex>
                  <Flex justify="space-between">
                    <p>IVA 19%</p>
                    <p>${formatNumber(order?.detail?.taxes ?? 0)}</p>
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
