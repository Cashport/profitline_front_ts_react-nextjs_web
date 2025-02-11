import { Dispatch, FC, createContext, useEffect, useState } from "react";
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
import { useAppStore } from "@/lib/store/store";
import styles from "./create-order.module.scss";
import { getSingleOrder } from "@/services/commerce/commerce";

export interface ISelectedCategories {
  category_id: number;
  category: string;
  products: ISelectedProduct[];
}

interface IOrderViewContext {
  client: {
    name: string;
    id: number;
  };
  setClient: Dispatch<{
    name: string;
    id: number;
  }>;
  selectedCategories: ISelectedCategories[];
  setSelectedCategories: Dispatch<ISelectedCategories[]>;
  checkingOut: boolean;
  setCheckingOut: Dispatch<boolean>;
  confirmOrderData: IOrderConfirmedResponse;
  setConfirmOrderData: Dispatch<IOrderConfirmedResponse>;
  shippingInfo: IShippingInformation | undefined;
  setShippingInfo: Dispatch<IShippingInformation>;
  discountId: IDiscountPackageAvailable | undefined;
  setDiscountId: Dispatch<IDiscountPackageAvailable | undefined>;
  categories: IFetchedCategories[];
  setCategories: Dispatch<IFetchedCategories[]>;
}

export const OrderViewContext = createContext<IOrderViewContext>({} as IOrderViewContext);

export const CreateOrderView: FC = () => {
  const [client, setClient] = useState({} as IOrderViewContext["client"]);
  const [categories, setCategories] = useState<IFetchedCategories[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ISelectedCategories[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmOrderData, setConfirmOrderData] = useState({} as IOrderConfirmedResponse);
  const [shippingInfo, setShippingInfo] = useState<IShippingInformation>();
  const [discountId, setDiscountId] = useState<IDiscountPackageAvailable | undefined>(undefined);
  const { draftInfo, setDraftInfo, selectedProject } = useAppStore((state) => state);

  useEffect(() => {
    if (draftInfo.client_name) {
      const fetchDraft = async () => {
        if (!selectedProject.ID || !draftInfo.id) return;
        const response = await getSingleOrder(selectedProject.ID, draftInfo.id);
        setClient({
          name: response.data[0].client_name,
          id: response.data[0].client_id
        });

        const selectedCategories = response.data[0].detail.products.map((category) => ({
          category_id: category.id_category,
          category: category.category,
          products: category.products.map((product) => ({
            id: product.id,
            name: product.product_name,
            price: product.price,
            discount: product.discount,
            discount_percentage: product.discount_percentage,
            quantity: product.quantity,
            image: product.image,
            category_id: product.id_category,
            SKU: product.product_sku,
            stock: true,
            category_name: product.category_name
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
        discountId,
        setDiscountId,
        categories,
        setCategories
      }}
    >
      <div className={styles.ordersView}>
        <h2 className={styles.title}>Crear orden</h2>
        {!client?.name ? (
          <SearchClient />
        ) : (
          <div className={styles.marketView}>
            {checkingOut ? <CreateOrderCheckout /> : <CreateOrderMarket />}
            <CreateOrderCart />
          </div>
        )}
      </div>
    </OrderViewContext.Provider>
  );
};

export default CreateOrderView;
