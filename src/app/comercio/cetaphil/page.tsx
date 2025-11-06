"use client";
import { Dispatch, FC, createContext, useEffect, useState } from "react";

import { useAppStore } from "@/lib/store/store";
import { getSingleOrder, getDiscounts } from "@/services/commerce/commerce";

import CreateOrderMarket from "@/modules/commerce/components/create-order-market";
import CreateOrderCart from "@/modules/commerce/components/create-order-cart";
import CreateOrderCheckout from "@/modules/commerce/components/create-order-checkout";

import {
  IDiscountPackageAvailable,
  IFetchedCategories,
  IOrderConfirmedResponse,
  ISelectedProduct,
  IShippingInformation
} from "@/types/commerce/ICommerce";

import styles from "./create-order.module.scss";
import { useDecodeToken } from "@/hooks/useDecodeToken";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";

export interface ISelectedCategories {
  category_id: number;
  category: string;
  products: ISelectedProduct[];
}

export interface IOrderViewContext {
  client?: {
    name: string;
    id: string;
    email: string;
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

const CreateOrderView: FC = () => {
  const [client, setClient] = useState<IOrderViewContext["client"] | undefined>(undefined);
  const [isLoadingLocalClient, setIsLoadingLocalClient] = useState(true);
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
  const { draftInfo, setDraftInfo, selectedProject } = useAppStore((state) => state);
  const decoder = useDecodeToken();
  const token = localStorage.getItem(STORAGE_TOKEN);

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
    console.log("Draft Info changed:", client);
  }, [client]);

  useEffect(() => {
    if (client?.id) return;
    const decodedToken = decoder(token || "");
    console.log("Decoded Token in CreateOrderView:", decodedToken);
    if (decodedToken) {
      setClient({
        name: decodedToken?.claims?.guestName || "",
        id: decodedToken?.claims?.guestDocument || "",
        email: decodedToken?.claims?.guestEmail || ""
      });
      setIsLoadingLocalClient(false);
    }
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
        <h2 className={styles.title}>Crear orden</h2>
        <div className={styles.marketView}>
          {!isLoadingLocalClient && client ? (
            <>
              {checkingOut ? <CreateOrderCheckout /> : <CreateOrderMarket />}
              <CreateOrderCart />
            </>
          ) : (
            <p>No hay cliente seleccionado</p>
          )}
        </div>
      </div>
    </OrderViewContext.Provider>
  );
};

export default CreateOrderView;
