"use client";

import { useState } from "react";
import UiTab from "@/components/ui/ui-tab/ui-tab";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import CrearNuevoModal from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/CrearNuevoModal";
import DiscountPackagesTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/DiscountPackagesTab";
import DiscountRulesTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/DiscountRulesTab";
import BonificadosTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/BonificadosTab";

export default function MarketAdminBonusAndDiscounts() {
  const [activeTab, setActiveTab] = useState("paquetes");
  const [crearOpen, setCrearOpen] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);

  const openCrearNuevo = () => setCrearOpen(true);

  const tabs = [
    {
      key: "paquetes",
      label: "Paquete de descuentos",
      children: <DiscountPackagesTab onCrearNuevo={openCrearNuevo} />
    },
    {
      key: "reglas",
      label: "Reglas de descuentos",
      children: <DiscountRulesTab onCrearNuevo={openCrearNuevo} />
    },
    {
      key: "bonificados",
      label: "Bonificados",
      children: <BonificadosTab onCrearNuevo={openCrearNuevo} />
    }
  ];

  if (showPromotions) {
    return <MarketAdminPromotions onBack={() => setShowPromotions(false)} />;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Descuentos y bonificados</h1>

      <div className="bg-white rounded-lg overflow-hidden p-8 [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
        <UiTab tabs={tabs} activeKey={activeTab} onChangeTab={setActiveTab} />
      </div>

      <CrearNuevoModal
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onSelectBonificado={() => {
          setCrearOpen(false);
          setShowPromotions(true);
        }}
      />
    </div>
  );
}
