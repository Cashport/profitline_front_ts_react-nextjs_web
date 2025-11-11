import { FC } from "react";
import Image from "next/image";
import { formatNumber } from "@/utils/utils";

import styles from "./confirmed-order-item.module.scss";
import { Flex } from "antd";
import { IProductInDetail } from "@/types/commerce/ICommerce";
interface IproductDiscount {
  discountPercentage: number;
  subtotal: number;
}
export interface ConfirmedOrderItemProps {
  product: IProductInDetail;
  productDiscount?: IproductDiscount;
}

const ConfirmedOrderItem: FC<ConfirmedOrderItemProps> = ({ product, productDiscount }) => {
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
      <h4 className={styles.name}>{product.product_name}</h4>

      <div className={styles.price}>
        {productDiscount ? (
          <Flex vertical gap={4}>
            <h5 className={styles.oldPrice}>${formatNumber(product.price ?? 0)}</h5>
            <Flex gap={4} align="baseline">
              <h5 className={styles.price__amount}>
                ${formatNumber(productDiscount.subtotal ?? 0)}
              </h5>
              <p className={styles.discountPercentage}>-{productDiscount.discountPercentage}%</p>
            </Flex>
          </Flex>
        ) : (
          <h5 className={styles.price}>${formatNumber(product.price ?? 0)}</h5>
        )}
      </div>

      <p className={styles.finalQuantity}>{product.quantity} Uds</p>
    </div>
  );
};

export default ConfirmedOrderItem;
