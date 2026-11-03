"use client";

import { useState } from "react";
import { Gift, Zap, Users, ArrowRight } from "lucide-react";
import Header from "@/components/organisms/header";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import MarketAdminManualBonus from "@/modules/marketAdmin/components/MarketAdminManualBonus/MarketAdminManualBonus";

type View = "hub" | "promociones" | "manuales";

const MODULES: {
  view: Exclude<View, "hub">;
  icon: typeof Zap;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    view: "promociones",
    icon: Zap,
    title: "Promociones automáticas",
    description:
      "Crea y gestiona promociones por monto o combinación de productos con escalones dinámicos. Los bonificados se agregan automáticamente al carrito.",
    badge: "2 activas",
    badgeColor: "bg-green-50 text-green-700 border border-green-200"
  },
  {
    view: "manuales",
    icon: Users,
    title: "Bonificados manuales por cliente",
    description:
      "Asigna unidades bonificadas a clientes específicos. Cada asignación pasa por flujo de aprobación antes de quedar disponible en el marketplace.",
    badge: "1 pendiente",
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200"
  }
];

export default function MarketAdminBonusAndPromotions() {
  const [view, setView] = useState<View>("hub");

  if (view === "promociones") {
    return <MarketAdminPromotions onBack={() => setView("hub")} />;
  }

  if (view === "manuales") {
    return <MarketAdminManualBonus onBack={() => setView("hub")} />;
  }

  return (
    <div className="cp-page min-h-full">
      <Header
        title="Sistema de Bonificados"
        back="/market-admin/bonusAndDiscounts"
        titleExtra="Gestión de productos bonificados y promociones"
      />

      <div className="cp-card overflow-hidden">
        <div className="px-[18px] py-[14px]">
          <div className="grid grid-cols-2 gap-4">
            {MODULES.map(({ view: v, icon: Icon, title, description, badge, badgeColor }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="group text-left cp-card outline outline-1 outline-transparent -outline-offset-1 p-5 flex flex-col gap-4 hover:outline-[#141414] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] flex items-center justify-center group-hover:bg-[#CBE71E] transition-colors">
                    <Icon size={18} className="text-[#141414]" />
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[13px] font-semibold rounded-lg ${badgeColor}`}
                  >
                    {badge}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#141414] mb-1">{title}</h2>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-[#0067B1] mt-auto">
                  Ir al módulo <ArrowRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
