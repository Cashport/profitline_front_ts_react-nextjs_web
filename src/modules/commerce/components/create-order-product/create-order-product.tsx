import { FC } from "react";
import Image from "next/image";
import { Flex } from "antd";
import { Minus, Plus } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";

import { useHandleProductsItems } from "../../hooks/create-order/handle-products-items.hook";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SimpleTag from "@/components/atoms/SimpleTag/SimpleTag";

import { ISelectedProduct } from "@/types/commerce/ICommerce";

import styles from "./create-order-product.module.scss";

export interface CreateOrderProductProps {
  product: ISelectedProduct;
  categoryName: string;
}

const CreateOrderProduct: FC<CreateOrderProductProps> = ({ product, categoryName }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const {
    alreadySelectedProduct,
    handleAddToCart,
    handleDecrementQuantity,
    handleIncrementQuantity,
    handleChangeQuantity
  } = useHandleProductsItems(product, categoryName);

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        <Image
          className={styles.imageContainer__img}
          src={product.image}
          alt="product image"
          width={400}
          height={400}
        />
      </div>

      <hr className={styles.separator} />
      <h4 className={styles.name}>
        {product.name}
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
        {product.discount ? (
          <>
            <h5 className={styles.oldPrice}>{formatMoney(product.price)}</h5>
            <Flex gap={4}>
              <h5 className={styles.price__amount}>{formatMoney(product.discount)}</h5>
              <p className={styles.discountPercentage}>-%{product.discount_percentage}</p>
            </Flex>
          </>
        ) : (
          <Flex gap={"0.5rem"} align="baseline">
            <h5 className={styles.price__amount}>{formatMoney(product.price)}</h5>
            {product.shipment_unit > 1 && (alreadySelectedProduct?.quantity ?? 0) > 0 && (
              <span className={styles.units}>
                {product.shipment_unit * (alreadySelectedProduct?.quantity ?? 0)} und
              </span>
            )}
          </Flex>
        )}
      </div>
      {alreadySelectedProduct ? (
        <div className={styles.quantityFooter}>
          <PrincipalButton
            customStyles={{ padding: "0.5rem" }}
            onClick={() => handleDecrementQuantity(product.id)}
          >
            <Minus size={20} />
          </PrincipalButton>
          <input
            key={alreadySelectedProduct ? alreadySelectedProduct.quantity : "default"}
            type="number"
            className={styles.quantityInput}
            defaultValue={alreadySelectedProduct ? alreadySelectedProduct.quantity : undefined}
            onBlur={(e) => handleChangeQuantity(e, product.id, product.category_id)}
          />
          <PrincipalButton
            customStyles={{ padding: "0.5rem" }}
            onClick={() => handleIncrementQuantity(product.id)}
          >
            <Plus size={20} />
          </PrincipalButton>
        </div>
      ) : (
        <div className={styles.footer}>
          <SecondaryButton
            customStyles={{ width: "100%" }}
            bordered
            onClick={() => handleAddToCart(product)}
          >
            Agregar <Plus size={20} />
          </SecondaryButton>
        </div>
      )}
    </div>
  );
};

export default CreateOrderProduct;
