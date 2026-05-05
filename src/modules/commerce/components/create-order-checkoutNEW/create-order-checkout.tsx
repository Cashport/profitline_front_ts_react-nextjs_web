"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import ProductsDetailsAndDiscounts from "./products-details-and-discounts";
import OrderShipmentConfirm, { Entrega } from "./order-shipment-confirm/order-shipment-confirm";

export default function CheckoutPage() {
  const router = useRouter();
  const { client } = useContext(OrderViewContext);

  const [multiEntrega, setMultiEntrega] = useState(false);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [confirmado, setConfirmado] = useState(false);

  const cantidadesAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  const cantidadesAsignadasExcluyendo = (sku: string, excludeId: string | null) =>
    entregas.filter((e) => e.id !== excludeId).reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  if (confirmado) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F7F7]">
        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-10 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#CBE71E] flex items-center justify-center">
              <CheckCircle2 size={36} className="text-[#141414]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#141414] mb-1">Pedido solicitado</h2>
          <p className="text-sm text-[#666666] mb-6">
            Tu orden ha sido registrada exitosamente para <strong>{client?.name}</strong>
          </p>
          <button
            onClick={() => router.push("/comercio")}
            className="w-full py-3 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
