import { FC } from "react";
import Image from "next/image";
import { Button, Flex } from "antd";
import { Minus, Plus, Trash } from "phosphor-react";

import { formatNumber } from "@/utils/utils";

import { useHandleProductsItems } from "../../hooks/create-order/handle-products-items.hook";
import SimpleTag from "@/components/atoms/SimpleTag/SimpleTag";

import { Discount, DiscountItem, ISelectedProduct } from "@/types/commerce/ICommerce";

import styles from "./create-order-cart-item.module.scss";
import { useAppStore } from "@/lib/store/store";
export interface CreateOrderItemProps {
  product: ISelectedProduct;
  categoryName: string;
  productsDiscount?: DiscountItem[];
}

const CreateOrderItem: FC<CreateOrderItemProps> = ({ product, categoryName, productsDiscount }) => {
  const {
    alreadySelectedProduct,
    handleDecrementQuantity,
    handleIncrementQuantity,
    handleChangeQuantity
  } = useHandleProductsItems(product, categoryName);
  const { config } = useAppStore((state) => ({ config: state.config }));

  const calculateDiscount: (
    discount: DiscountItem[]
  ) => { discountPercentage: number; subtotal: number; qty: number }[] = (
    discount: DiscountItem[]
  ) => {
    const discountData = [];
    for (const productDiscountItem of discount ?? []) {
      const productDiscount = productDiscountItem.discount;
      const discountSource = productDiscount?.primary;
      const subtotal = config?.include_iva
        ? discountSource?.new_price_taxes ||
          discountSource?.new_price ||
          productDiscountItem.price_taxes ||
          productDiscountItem.price
        : discountSource?.new_price || productDiscountItem.price;
      const productDiscountData = productDiscount
        ? {
            discountPercentage: discountSource?.discount_applied?.discount,
            subtotal,
            qty: productDiscountItem.quantity
          }
        : undefined;
      if (productDiscountData) {
        discountData.push(productDiscountData);
      }
    }
    return discountData;
  };

  const discounts = calculateDiscount(productsDiscount || []);

  // Determinar el precio a mostrar según la configuración de IVA
  const price = config?.include_iva ? product.price_taxes || product.price : product.price;

  const isLocked = product.autoAssigned === true;
  const lockedTitle = "Cantidad calculada automáticamente";

  return (
    <div className={styles.cartItemCard}>
      <div className={styles.imageContainer}>
        <Image
          className={styles.imageContainer__img}
          src={product.image || "/images/watermark.svg"}
          alt="product image"
          width={100}
          height={100}
        />
      </div>

      <h4 className={styles.name}>
        {product.name}{" "}
        {product.shipment_unit > 1 && (alreadySelectedProduct?.quantity ?? 0) > 0 && (
          <span className={styles.name__uds}>
            ({product.shipment_unit * (alreadySelectedProduct?.quantity ?? 0)} und)
          </span>
        )}
        {!product.stock && (
          <SimpleTag
            text="Stock insuficiente"
            colorTag="#ff350d"
            colorText="#ffffff"
            fontSize="0.75rem"
          />
        )}
        {isLocked && (
          <SimpleTag text="Auto" colorTag="#CBE71E" colorText="#000000" fontSize="0.75rem" />
        )}
      </h4>

      <div className={styles.price}>
        {discounts.length ? (
          <Flex vertical gap={4}>
            <h5 className={styles.oldPrice}>${formatNumber(price ?? 0)}</h5>
            {discounts.map((d, index) => (
              <Flex key={index} gap={8} align="baseline">
                <h5 className={styles.price__amount}>
                  {discounts.length > 1 && <span className={styles.price__qty}>{d.qty} x </span>}$
                  {formatNumber(d.subtotal ?? 0)}
                </h5>
                <p className={styles.discountPercentage}>-{String(d.discountPercentage || 0)}%</p>
              </Flex>
            ))}
          </Flex>
        ) : (
          <h5 className={styles.price}>${formatNumber(price ?? 0)}</h5>
        )}
      </div>

      <div className={styles.quantityFooter}>
        <Button
          className={styles.buttonChangeQuantity}
          onClick={() => handleDecrementQuantity(product.id)}
          title={isLocked ? lockedTitle : undefined}
        >
          {alreadySelectedProduct?.quantity === 1 ? (
            <Trash size={14} weight="bold" />
          ) : (
            <Minus size={14} weight="bold" />
          )}
        </Button>
        <input
          key={alreadySelectedProduct ? alreadySelectedProduct.quantity : "default"}
          type="number"
          className={styles.quantityInput}
          defaultValue={alreadySelectedProduct ? alreadySelectedProduct.quantity : undefined}
          onBlur={(e) => handleChangeQuantity(e, product.id, product.category_id)}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
              return e.preventDefault();
            }
          }}
          title={isLocked ? lockedTitle : undefined}
        />
        <Button
          className={styles.buttonChangeQuantity}
          onClick={() => handleIncrementQuantity(product.id)}
          title={isLocked ? lockedTitle : undefined}
        >
          <Plus size={14} weight="bold" />
        </Button>
      </div>
    </div>
  );
};

export default CreateOrderItem;
