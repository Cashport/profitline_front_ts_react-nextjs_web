import { FC } from "react";
import Image from "next/image";
import { Button, Flex } from "antd";
import { Minus, Plus, Trash } from "phosphor-react";

import { formatNumber } from "@/utils/utils";

import { useHandleProductsItems } from "../../hooks/create-order/handle-products-items.hook";
import SimpleTag from "@/components/atoms/SimpleTag/SimpleTag";

import { ISelectedProduct } from "@/types/commerce/ICommerce";

import styles from "./create-order-cart-item.module.scss";
interface IproductDiscount {
  discountPercentage: number;
  subtotal: number;
}
export interface CreateOrderItemProps {
  product: ISelectedProduct;
  categoryName: string;
  productDiscount?: IproductDiscount;
}

const CreateOrderItem: FC<CreateOrderItemProps> = ({ product, categoryName, productDiscount }) => {
  const {
    alreadySelectedProduct,
    handleDecrementQuantity,
    handleIncrementQuantity,
    handleChangeQuantity
  } = useHandleProductsItems(product, categoryName);

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
      </h4>

      <div className={styles.price}>
        {productDiscount ? (
          <Flex vertical gap={4}>
            <h5 className={styles.oldPrice}>${formatNumber(product.price_taxes ?? 0)}</h5>
            <Flex gap={8} align="baseline">
              <h5 className={styles.price__amount}>
                ${formatNumber(productDiscount.subtotal ?? 0)}
              </h5>
              <p className={styles.discountPercentage}>-{productDiscount.discountPercentage}%</p>
            </Flex>
          </Flex>
        ) : (
          <h5 className={styles.price}>${formatNumber(product.price_taxes ?? 0)}</h5>
        )}
      </div>

      <div className={styles.quantityFooter}>
        <Button
          className={styles.buttonChangeQuantity}
          onClick={() => handleDecrementQuantity(product.id)}
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
        />
        <Button
          className={styles.buttonChangeQuantity}
          onClick={() => handleIncrementQuantity(product.id)}
        >
          <Plus size={14} weight="bold" />
        </Button>
      </div>
    </div>
  );
};

export default CreateOrderItem;
