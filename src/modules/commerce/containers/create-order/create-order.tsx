import { Dispatch, FC, useEffect, useState } from "react";
import { Button, Flex } from "antd";

import { useAppStore } from "@/lib/store/store";
import { getSingleOrder, getDiscounts } from "@/services/commerce/commerce";
import { ShoppingCartSimple } from "@phosphor-icons/react";

import { OrderViewContext } from "../../contexts/orderViewContext";

import SearchClient from "../../components/create-order-search-client/create-order-search-client";
import CreateOrderMarket from "../../components/create-order-market";
import CreateOrderCart from "../../components/create-order-cart";
import CreateOrderCheckout from "../../components/create-order-checkout";

import {
  IDiscountPackageAvailable,
  IFetchedCategories,
  IOrderConfirmedResponse,
  ISelectedProduct,
  IShippingInformation
} from "@/types/commerce/ICommerce";

import styles from "./create-order.module.scss";
import { number } from "yup";

export interface ISelectedCategories {
  category_id: number;
  category: string;
  products: ISelectedProduct[];
}

interface IOrderViewContext {
  client: {
    name: string;
    id: string;
    email: string;
    payment_type: number;
  };
  setClient: Dispatch<{
    name: string;
    id: string;
    email: string;
  }>;
  selectedCategories: ISelectedCategories[];
  setSelectedCategories: Dispatch<ISelectedCategories[]>;
  checkingOut: boolean;
  setCheckingOut: Dispatch<boolean>;
  confirmOrderData: IOrderConfirmedResponse;
  setConfirmOrderData: Dispatch<IOrderConfirmedResponse>;
  shippingInfo: IShippingInformation | undefined;
  setShippingInfo: Dispatch<IShippingInformation>;
  selectedDiscount: IDiscountPackageAvailable | undefined;
  setSelectedDiscount: Dispatch<IDiscountPackageAvailable | undefined>;
  categories: IFetchedCategories[];
  setCategories: Dispatch<IFetchedCategories[]>;
  discounts: IDiscountPackageAvailable[];
  setDiscounts: Dispatch<IDiscountPackageAvailable[]>;
  discountsLoading: boolean;
}

export const CreateOrderView: FC = () => {
  const [client, setClient] = useState({} as IOrderViewContext["client"]);
  const [categories, setCategories] = useState<IFetchedCategories[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ISelectedCategories[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmOrderData, setConfirmOrderData] = useState({} as IOrderConfirmedResponse);
  const [shippingInfo, setShippingInfo] = useState<IShippingInformation>();
  const [selectedDiscount, setSelectedDiscount] = useState<IDiscountPackageAvailable | undefined>(
    undefined
  );
  const [discounts, setDiscounts] = useState<IDiscountPackageAvailable[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const { draftInfo, setDraftInfo, selectedProject } = useAppStore((state) => state);

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
  };

  // Fetch discounts cuando el cliente cambia
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (!client?.id || !selectedProject?.ID) return;

      setDiscountsLoading(true);
      try {
        const response = await getDiscounts(selectedProject.ID, client.id);

        if (response.data && response.data.length > 0) {
          setDiscounts(response.data);
          // Seleccionar el primer descuento por defecto
          setSelectedDiscount(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setDiscountsLoading(false);
      }
    };

    fetchDiscounts();
  }, [client?.id, selectedProject?.ID]);

  useEffect(() => {
    if (draftInfo.client_name) {
      const fetchDraft = async () => {
        if (!selectedProject.ID || !draftInfo.id) return;
        const response = await getSingleOrder(selectedProject.ID, draftInfo.id);
        setClient({
          name: response.data[0].client_name,
          id: response.data[0].client_id,
          email: "",
          payment_type: 1
        });

        const selectedCategories = response.data[0].detail.products.map((category) => ({
          category_id: category.id_category,
          category: category.category,
          products: category.products.map((product) => ({
            id: product.id,
            name: product.product_name,
            price: product.price,
            price_taxes: product.price_taxes,
            discount: product.discount,
            discount_percentage: product.discount_percentage,
            quantity: product.quantity,
            image: product.image,
            category_id: product.id_category,
            SKU: product.product_sku,
            stock: true,
            category_name: product.category_name,
            shipment_unit: product.shipment_unit
          }))
        }));
        setSelectedCategories(selectedCategories);
        setShippingInfo(response.data[0].shipping_info);
      };
      fetchDraft();
      setCheckingOut(true);
    }

    return () => {
      setDraftInfo({ id: 0, client_name: undefined });
    };
  }, []);

  const numberOfItems = selectedCategories.reduce((total, category) => {
    return total + category.products.reduce((catTotal, product) => catTotal + product.quantity, 0);
  }, 0);

  return (
    <OrderViewContext.Provider
      value={{
        client,
        setClient,
        selectedCategories,
        setSelectedCategories,
        checkingOut,
        setCheckingOut,
        confirmOrderData,
        setConfirmOrderData,
        shippingInfo,
        setShippingInfo,
        selectedDiscount,
        setSelectedDiscount,
        categories,
        setCategories,
        discounts,
        setDiscounts,
        discountsLoading
      }}
    >
      <div className={styles.ordersView}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear orden</h2>
          {!client?.name ? null : (
            <Button className={styles.cartButton} onClick={toggleCart}>
              <Flex vertical align="center" className={styles.cartButton__cart}>
                <p className={styles.cartButton__itemsNum}>{numberOfItems}</p>
                <ShoppingCartSimple size={32} />
              </Flex>
              Carrito
            </Button>
          )}
        </div>
        {!client?.name ? (
          <SearchClient />
        ) : (
          <div className={`${styles.marketView} ${isCartVisible ? styles.marketViewWithCart : ""}`}>
            {checkingOut ? <CreateOrderCheckout /> : <CreateOrderMarket />}
            {isCartVisible && <CreateOrderCart onClose={toggleCart} />}
          </div>
        )}
      </div>
    </OrderViewContext.Provider>
  );
};

export default CreateOrderView;
