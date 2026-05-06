"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { CheckCircle2 } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { confirmOrder } from "@/services/commerce/commerce";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { IConfirmOrderData } from "@/types/commerce/ICommerce";
import ProductsDetailsAndDiscounts from "./products-details-and-discounts";
import OrderShipmentConfirm from "./order-shipment-confirm/order-shipment-confirm";

export type IShippingInfo = {
  id: string;
  addressSelectValue: string;
  addressId?: number;
  direccion: string;
  city: string;
  dispatch_address: string;
  email: string;
  indicativo: string;
  telefono: string;
  observaciones: string;
  cantidades: Record<string, number>;
};

export default function CheckoutPage() {
  const router = useRouter();
  const projectId = useAppStore((state) => state.selectedProject.ID);
  const { client, selectedCategories, selectedDiscount, executiveDiscounts, setConfirmOrderData } =
    useContext(OrderViewContext);

  const [multiEntrega, setMultiEntrega] = useState(false);
  const [entregas, setEntregas] = useState<IShippingInfo[]>([]);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    const fetchTotalValues = async () => {
      if (selectedCategories.length === 0) return;
      const products = selectedCategories
        .flatMap((category) => category.products)
        .map((product) => ({
          product_sku: product.SKU,
          quantity: product.quantity
        }));
      const payload: IConfirmOrderData = {
        discount_package: selectedDiscount,
        order_summary: products,
        executive_discounts: executiveDiscounts
      };
      try {
        const response = await confirmOrder(projectId, client?.id || "", payload);
        if (response.status === 200) {
          setConfirmOrderData(response.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("Error confirmando orden", error.message);
        } else {
          console.error("Unexpected error", error);
        }
      }
    };

    const timeOut = setTimeout(() => {
      fetchTotalValues();
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [selectedCategories, selectedDiscount, executiveDiscounts]);

  const cantidadesAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  const cantidadesAsignadasExcluyendo = (sku: string, excludeId: string | null) =>
    entregas.filter((e) => e.id !== excludeId).reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  // if (confirmado) {
  //   return (
  //     <div className="flex h-full items-center justify-center bg-[#F7F7F7]">
  //       <div className="bg-white rounded-2xl border border-[#DDDDDD] p-10 max-w-md w-full text-center shadow-sm">
  //         <div className="flex justify-center mb-4">
  //           <div className="w-16 h-16 rounded-full bg-[#CBE71E] flex items-center justify-center">
  //             <CheckCircle2 size={36} className="text-[#141414]" />
  //           </div>
  //         </div>
  //         <h2 className="text-xl font-bold text-[#141414] mb-1">Pedido solicitado</h2>
  //         <p className="text-sm text-[#666666] mb-6">
  //           Tu orden ha sido registrada exitosamente para <strong>{client?.name}</strong>
  //         </p>
  //         <button
  //           onClick={() => router.push("/comercio")}
  //           className="w-full py-3 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors"
  //         >
  //           Volver al inicio
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-full gap-6 bg-[#F7F7F7] overflow-hidden">
      <ProductsDetailsAndDiscounts
        multiEntrega={multiEntrega}
        cantidadesAsignadas={cantidadesAsignadas}
      />
      <OrderShipmentConfirm
        multiEntrega={multiEntrega}
        setMultiEntrega={setMultiEntrega}
        entregas={entregas}
        setEntregas={setEntregas}
        cantidadesAsignadasExcluyendo={cantidadesAsignadasExcluyendo}
        onConfirm={() => setConfirmado(true)}
      />
    </div>
  );
}
