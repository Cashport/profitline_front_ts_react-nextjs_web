"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Zap, Users, ArrowRight, ChevronLeft } from "lucide-react";
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
    <div className="min-h-screen">
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EEEEEE]">
          <Link
            href="/market-admin/bonificados"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#CBE71E] flex items-center justify-center">
            <Gift size={16} className="text-[#141414]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#141414]">Sistema de Bonificados</h1>
            <p className="text-xs text-[#999999]">Gestión de productos bonificados y promociones</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {MODULES.map(({ view: v, icon: Icon, title, description, badge, badgeColor }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="group text-left bg-white rounded-xl border border-[#DDDDDD] p-5 flex flex-col gap-4 hover:border-[#141414] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] flex items-center justify-center group-hover:bg-[#CBE71E] transition-colors">
                    <Icon size={18} className="text-[#141414]" />
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg ${badgeColor}`}
                  >
                    {badge}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#141414] mb-1">{title}</h2>
                  <p className="text-xs text-[#999999] leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#0067B1] mt-auto">
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
