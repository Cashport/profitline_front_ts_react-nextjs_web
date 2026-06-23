import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

import { useAppStore } from "@/lib/store/store";
import { getDiscounts, getOrderDraft, getProductsByClient } from "@/services/commerce/commerce";

import { OrderViewContext } from "../../contexts/orderViewContext";

import SearchClient from "../../components/create-order-search-client/create-order-search-client";
import CreateOrderMarket from "../../components/create-order-market";
import CreateOrderCart from "../../components/create-order-cart";
import CreateOrderCheckout from "../../components/create-order-checkout";
import CreateOrderDiscountsModal from "../../components/create-order-discounts-modal/create-order-discounts-modal";

import {
  IBonus,
  IDiscountPackageAvailable,
  IDraftOrderDetail,
  IExecutiveDiscount,
  IFetchedCategories,
  IOrderConfirmedResponse,
  IOrderSplitDetail,
  ISelectedProduct,
  IShippingInformation
} from "@/types/commerce/ICommerce";

import styles from "./create-order.module.scss";

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
  executiveDiscounts: IExecutiveDiscount[];
  setExecutiveDiscounts: Dispatch<SetStateAction<IExecutiveDiscount[]>>;
  deactivateCrossSelling: boolean;
  setDeactivateCrossSelling: Dispatch<SetStateAction<boolean>>;
  toggleCart?: () => void;
  isCartVisible?: boolean;
  numberOfItems?: number;
}

export const CreateOrderView: FC = () => {
  const [client, setClient] = useState({} as IOrderViewContext["client"]);
  const [categories, setCategories] = useState<IFetchedCategories[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ISelectedCategories[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmOrderData, setConfirmOrderData] = useState({} as IOrderConfirmedResponse);
  const [shippingInfo, setShippingInfo] = useState<IShippingInformation>();
  const [channelCode, setChannelCode] = useState("");
  const [channelName, setChannelName] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState<IDiscountPackageAvailable | undefined>(
    undefined
  );
  const [discounts, setDiscounts] = useState<IDiscountPackageAvailable[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [openDiscountsModal, setOpenDiscountsModal] = useState(false);
  const [executiveDiscounts, setExecutiveDiscounts] = useState<IExecutiveDiscount[]>([]);
  const [deactivateCrossSelling, setDeactivateCrossSelling] = useState(true);
  const [orderSplitDetails, setOrderSplitDetails] = useState<IOrderSplitDetail[]>([]);
  const [bonus, setBonus] = useState<IBonus | undefined>();
  const [draftDetail, setDraftDetail] = useState<IDraftOrderDetail | null>(null);
  const [isCartVisible, setIsCartVisible] = useState(
    () => typeof window !== "undefined" && window.innerWidth > 1000
  );
  const { draftInfo, setDraftInfo, selectedProject } = useAppStore((state) => state);

  const toggleCart = () => {
    setIsCartVisible((prev) => !prev);
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
          // Si hay mas de un descuento, abrir el modal para que el usuario elija
          if (response.data.length > 1) {
            setOpenDiscountsModal(true);
          }
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
    const projectId = selectedProject?.ID;
    const draftId = draftInfo.id;
    if (!draftInfo.client_name || !draftId || !projectId) return;
    const fetchDraft = async () => {
      const draftResponse = await getOrderDraft(projectId, draftId);
      const productsResponse = await getProductsByClient(projectId, draftResponse.client_id);
      if (productsResponse.data) {
        const categoriesList: IFetchedCategories[] = productsResponse.data.map((category) => ({
          category: category.category,
          products: category.products.map((product) => ({
            id: Number(product.id),
            name: product.description,
            price: product.price,
            price_taxes: product.price_taxes,
            discount: 0,
            discount_percentage: 0,
            quantity: 0,
            image: product.image,
            category_id: Number(product.id_category),
            SKU: product.SKU,
            EAN: product.EAN,
            stock: true,
            category_name: product.category_name,
            shipment_unit: product.shipment_unit
          }))
        }));
        setCategories(categoriesList);
      }
      setDraftDetail(draftResponse);
    };
    fetchDraft();

    return () => {
      setDraftInfo({ id: 0, client_name: undefined });
    };
  }, []);

  useEffect(() => {
    if (!draftDetail || categories.length === 0) return;

    const { client_name, client_id, shipping_info, order_summary, executive_discounts } =
      draftDetail;

    setClient({
      name: client_name,
      id: client_id,
      email: shipping_info?.email ?? "",
      payment_type: 1
    });
    setShippingInfo(shipping_info);
    // Drafts carry no channel internal_code; clear it so the checkout falls back to client id.
    setChannelCode("");
    setSelectedDiscount(order_summary.discount_package);
    setConfirmOrderData(order_summary);
    setExecutiveDiscounts(executive_discounts ?? []);

    const grouped =
      order_summary.products?.reduce<ISelectedCategories[]>((acc, p) => {
        const matchedCategory = categories.find((c) =>
          c.products.some((cp) => cp.category_id === p.category_id)
        );
        const productMapped: ISelectedProduct = {
          id: p.product_id,
          name: p.description,
          price: p.price,
          price_taxes: p.price_taxes,
          discount: undefined,
          discount_percentage: undefined,
          quantity: p.quantity,
          image: p.image,
          category_id: p.category_id,
          category_name: matchedCategory?.category ?? "",
          SKU: p.product_sku,
          stock: true,
          shipment_unit: p.shipment_unit
        };
        const found = acc.find((c) => c.category_id === p.category_id);
        if (found) {
          found.products.push(productMapped);
        } else {
          acc.push({
            category_id: p.category_id,
            category: matchedCategory?.category ?? "",
            products: [productMapped]
          });
        }
        return acc;
      }, []) ?? [];

    setSelectedCategories(grouped);
    setCheckingOut(true);
    setDraftDetail(null);
    setIsCartVisible(false);
  }, [draftDetail, categories]);

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
        channelCode,
        setChannelCode,
        channelName,
        setChannelName,
        selectedDiscount,
        setSelectedDiscount,
        categories,
        setCategories,
        discounts,
        setDiscounts,
        discountsLoading,
        executiveDiscounts,
        setExecutiveDiscounts,
        deactivateCrossSelling,
        setDeactivateCrossSelling,
        order_split_details: orderSplitDetails,
        setOrderSplitDetails,
        toggleCart,
        isCartVisible,
        numberOfItems,
        bonus,
        setBonus
      }}
    >
      <div className={styles.ordersView}>
        {!client?.name ? (
          <SearchClient />
        ) : (
          <div className={`${styles.marketView} ${isCartVisible ? styles.marketViewWithCart : ""}`}>
            {checkingOut ? <CreateOrderCheckout /> : <CreateOrderMarket />}
            {isCartVisible && <CreateOrderCart onClose={toggleCart} />}
          </div>
        )}
      </div>
      <CreateOrderDiscountsModal
        floating
        open={openDiscountsModal}
        setOpenDiscountsModal={setOpenDiscountsModal}
      />
    </OrderViewContext.Provider>
  );
};

export default CreateOrderView;
