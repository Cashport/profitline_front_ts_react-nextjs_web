import { FC } from "react";
import { Button, Flex } from "antd";
import { ShoppingCartSimple } from "@phosphor-icons/react";

import styles from "./button-cart.module.scss";

interface CartButtonProps {
  onClick?: () => void;
  numberOfItems?: number;
}

const CartButton: FC<CartButtonProps> = ({ onClick, numberOfItems = 0 }) => {
  return (
    <Button className={styles.cartButton} onClick={onClick}>
      <ShoppingCartSimple size={32} />
      <p className={styles.cartButton__itemsNum}>{numberOfItems}</p>
    </Button>
  );
};

export default CartButton;
