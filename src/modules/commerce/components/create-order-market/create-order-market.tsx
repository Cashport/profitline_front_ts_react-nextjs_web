import { FC, useContext } from "react";

import { OrderViewContext } from "../../contexts/orderViewContext";

import CreateOrderProducts from "../create-order-products";
import CreateOrderCart from "../create-order-cart";

import styles from "./create-order-market.module.scss";

const CreateOrderMarket: FC = () => {
  const { isCartVisible, toggleCart } = useContext(OrderViewContext);

  return (
    <div
      className={`${styles.marketLayout} ${isCartVisible ? styles.marketLayoutWithCart : ""}`}
    >
      <CreateOrderProducts />
      {isCartVisible && <CreateOrderCart onClose={toggleCart} />}
    </div>
  );
};

export default CreateOrderMarket;
