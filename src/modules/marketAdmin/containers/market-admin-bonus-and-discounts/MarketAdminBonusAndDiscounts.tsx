"use client";

import { useState } from "react";
import UiTab from "@/components/ui/ui-tab/ui-tab";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import CrearNuevoModal from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/CrearNuevoModal";
import DiscountPackagesTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/DiscountPackagesTab";
import DiscountRulesTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/DiscountRulesTab";
import BonificadosTab from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/BonificadosTab";
import {
  MARKET_ADMIN_DISCOUNTS_TABS,
  MarketAdminDiscountsTab
} from "@/components/organisms/discounts/constants/routes";

const isKnownTab = (tab?: string): tab is MarketAdminDiscountsTab =>
  Object.values(MARKET_ADMIN_DISCOUNTS_TABS).some((key) => key === tab);

interface Props {
  // The detail views navigate back here with ?tab=, so the list opens on the right tab.
  initialTab?: string;
}

export default function MarketAdminBonusAndDiscounts({ initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<string>(
    isKnownTab(initialTab) ? initialTab : MARKET_ADMIN_DISCOUNTS_TABS.packages
  );
  const [crearOpen, setCrearOpen] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);

  const openCrearNuevo = () => setCrearOpen(true);

  const tabs = [
    {
      key: MARKET_ADMIN_DISCOUNTS_TABS.packages,
      label: "Paquete de descuentos",
      children: <DiscountPackagesTab onCrearNuevo={openCrearNuevo} />
    },
    {
      key: MARKET_ADMIN_DISCOUNTS_TABS.rules,
      label: "Reglas de descuentos",
      children: <DiscountRulesTab onCrearNuevo={openCrearNuevo} />
    },
    {
      key: MARKET_ADMIN_DISCOUNTS_TABS.bonuses,
      label: "Bonificados",
      children: <BonificadosTab onCrearNuevo={openCrearNuevo} />
    }
  ];

  if (showPromotions) {
    return (
      <MarketAdminPromotions
        onBack={() => setShowPromotions(false)}
        onSaved={() => {
          setActiveTab(MARKET_ADMIN_DISCOUNTS_TABS.bonuses);
          setShowPromotions(false);
        }}
      />
    );
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
