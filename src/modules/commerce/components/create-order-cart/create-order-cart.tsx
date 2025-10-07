import { FC, useContext, useEffect, useMemo, useState } from "react";
import { Flex, Typography } from "antd";
import { AxiosError } from "axios";
import { BagSimple } from "phosphor-react";
import { formatNumber } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";
import { confirmOrder } from "@/services/commerce/commerce";

import { OrderViewContext } from "../../containers/create-order/create-order";
import CreateOrderItem from "../create-order-cart-item";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import CreateOrderDiscountsModal from "../create-order-discounts-modal";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { ISelectType } from "@/types/clients/IClients";

import styles from "./create-order-cart.module.scss";
export interface selectClientForm {
  client: ISelectType;
}

const { Text } = Typography;

const CreateOrderCart: FC = ({}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const [openDiscountsModal, setOpenDiscountsModal] = useState(false);
  const [insufficientStockProducts, setInsufficientStockProducts] = useState<string[]>([]);
  const [appliedDiscounts, setAppliedDiscounts] = useState<any>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCanulasModal, setShowCanulasModal] = useState(false);

  const {
    selectedCategories,
    setSelectedCategories,
    checkingOut,
    setCheckingOut,
    client,
    confirmOrderData,
    setConfirmOrderData,
    selectedDiscount,
    categories,
    setCategories
  } = useContext(OrderViewContext);
  const numberOfSelectedProducts = selectedCategories.reduce(
    (acc, category) => acc + category.products.length,
    0
  );

  const handleOpenDiscountsModal = () => {
    setOpenDiscountsModal(true);
  };

  const MINIMUM_ORDER_AMOUNT = 1600000;
  const isTotalLessThanMinimum = useMemo(
    () => confirmOrderData?.total && confirmOrderData.total < MINIMUM_ORDER_AMOUNT,
    [confirmOrderData]
  );

  const hasNoCanulasOrAgua = useMemo(() => {
    return !selectedCategories.some((category) =>
      category.products.some(
        (product) =>
          product.name?.toLowerCase().includes("canula") ||
          product.name?.toLowerCase().includes("agua")
      )
    );
  }, [selectedCategories]);

  const handleContinuePurchase = () => {
    if (isTotalLessThanMinimum) {
      setShowConfirmModal(true);
    } else if (hasNoCanulasOrAgua) {
      setShowCanulasModal(true);
    } else {
      setCheckingOut(true);
    }
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    if (hasNoCanulasOrAgua) {
      setShowCanulasModal(true);
    } else {
      setCheckingOut(true);
    }
  };

  const handleConfirmCanulas = () => {
    setShowCanulasModal(false);
    setCheckingOut(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const handleCloseCanulasModal = () => {
    setShowCanulasModal(false);
  };

  useEffect(() => {
    const fetchTotalValues = async () => {
      if (selectedCategories.length > 0) {
        const products = selectedCategories
          .flatMap((category) => category.products)
          .map((product) => ({
            product_sku: product.SKU,
            quantity: product.quantity
          }));
        const confirmOrderData = {
          discount_package: selectedDiscount,
          order_summary: products
        };
        try {
          const response = await confirmOrder(projectId, client.id, confirmOrderData);
          if (response.status === 200) {
            setConfirmOrderData(response.data);
            setInsufficientStockProducts(response.data.insufficientStockProducts);
            if (response.data.discounts?.discountItems?.length > 0)
              setAppliedDiscounts(response.data.discounts?.discountItems);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            console.error("Error confirmando orden", error.message);
          } else {
            console.error("Unexpected error", error);
          }
        }
      }
    };

    const timeOut = setTimeout(() => {
      fetchTotalValues();
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [selectedCategories, selectedDiscount]);

  useEffect(() => {
    const newState = selectedCategories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        stock: !insufficientStockProducts.includes(product.SKU)
      }))
    }));
    setSelectedCategories(newState);

    const updatedCategories = categories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        stock: !insufficientStockProducts.includes(product.SKU)
      }))
    }));
    setCategories(updatedCategories);
  }, [insufficientStockProducts]);

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartContainer__top}>
        <Flex className={styles.header} justify="space-between">
          <h3>Resumen de la orden</h3>
          <p>SKUs: {numberOfSelectedProducts}</p>
        </Flex>

        {selectedCategories.length === 0 && (
          <div className={styles.emptyCart}>
            <BagSimple className={styles.bagLogo} size={82} />
            <p>Aún no has agregado productos</p>
            <button
              className={styles.discountsButton}
              data-info="Ver todos los descuentos"
              onClick={handleOpenDiscountsModal}
            ></button>
          </div>
        )}
        <div className={styles.products}>
          {selectedCategories.map((category) => (
            <div key={category.category_id}>
              <Flex className={styles.products__header} justify="space-between">
                <p>{category.products[0].category_name}</p>
                <p>SKUs: {category.products.length}</p>
              </Flex>
              {category.products.map((product) => {
                const productDiscount = appliedDiscounts?.find(
                  (discount: any) => discount.product_sku === product.SKU
                )?.discount;
                const productDiscountData =
                  productDiscount && productDiscount.subtotalDiscount > 0
                    ? {
                        discountPercentage: productDiscount.primary?.discount_applied?.discount,
                        subtotal: productDiscount.primary?.new_price
                      }
                    : undefined;
                return (
                  <CreateOrderItem
                    key={`${product.id}-${product.SKU}`}
                    product={product}
                    categoryName={category.category}
                    productDiscount={productDiscountData}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className={styles.cartContainer__footer}>
          {!checkingOut && (
            <>
              <button
                className={styles.discountsButton}
                data-info="Ver todos los descuentos"
                onClick={handleOpenDiscountsModal}
              ></button>
              <hr className={styles.separator} />
            </>
          )}

          <Flex vertical gap={"0.25rem"}>
            <Flex justify="space-between">
              <p>Subtotal</p>
              <p>${formatNumber(confirmOrderData?.subtotal)}</p>
            </Flex>
            <Flex justify="space-between" gap={"0.25rem"}>
              <p>Descuentos ({selectedDiscount?.name})</p>
              {confirmOrderData.discounts ? (
                <p>-${formatNumber(confirmOrderData.discounts?.totalDiscount)}</p>
              ) : (
                <p>-$0</p>
              )}
            </Flex>
            <Flex justify="space-between" style={{ marginTop: "0.2rem" }}>
              <p className={styles.cartContainer__footer__discountExplanation}>
                Descuentos de la orden
              </p>
              {confirmOrderData.discounts ? (
                <Text className={styles.cartContainer__footer__discountExplanation}>
                  -${formatNumber(confirmOrderData.discounts?.totalOrderDiscount)}
                </Text>
              ) : (
                <Text className={styles.cartContainer__footer__discountExplanation}>-$0</Text>
              )}
            </Flex>
            <Flex justify="space-between" style={{ marginTop: "0.2rem" }}>
              <p className={styles.cartContainer__footer__discountExplanation}>
                Descuentos de productos
              </p>
              {confirmOrderData.discounts ? (
                <Text className={styles.cartContainer__footer__discountExplanation}>
                  -${formatNumber(confirmOrderData.discounts?.totalProductDiscount)}
                </Text>
              ) : (
                <Text className={styles.cartContainer__footer__discountExplanation}>-$0</Text>
              )}
            </Flex>
            <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
              <strong>Total</strong>
              <strong>${formatNumber(confirmOrderData?.total)}</strong>
            </Flex>
            <Flex justify="space-between">
              <p>IVA</p>
              <p>${formatNumber(confirmOrderData?.taxes)}</p>
            </Flex>
            <Flex justify="space-between">
              <p>Total con pronto pago</p>
              <p>${formatNumber(confirmOrderData?.total_pronto_pago)}</p>
            </Flex>
          </Flex>

          {!checkingOut && (
            <PrincipalButton onClick={handleContinuePurchase}>Continuar compra</PrincipalButton>
          )}
        </div>
      )}

      {openDiscountsModal && (
        <CreateOrderDiscountsModal setOpenDiscountsModal={setOpenDiscountsModal} />
      )}

      <ModalConfirmAction
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onOk={handleConfirmPurchase}
        title="¿Está seguro que desea continuar?"
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>
              El pedido es inferior a {formatMoney(MINIMUM_ORDER_AMOUNT)}
            </p>
            <p>Te sugerimos que incrementes la compra</p>
          </Flex>
        }
        okText="Confirmar"
        cancelText="Cancelar"
      />

      <ModalConfirmAction
        isOpen={showCanulasModal}
        onClose={handleCloseCanulasModal}
        onOk={handleConfirmCanulas}
        title="¿Está seguro que desea continuar?"
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>
              No has seleccionado Canulas y/o Agua estéril
            </p>
            <p>Te recomendamos revisar la orden</p>
          </Flex>
        }
        okText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default CreateOrderCart;
