"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Gift, Zap, Users, ArrowRight } from "lucide-react";
import Header from "@/components/organisms/header";
import MarketAdminPromotions from "@/modules/marketAdmin/components/MarketAdminPromotions/MarketAdminPromotions";
import MarketAdminManualBonus from "@/modules/marketAdmin/components/MarketAdminManualBonus/MarketAdminManualBonus";

type View = "hub" | "promociones" | "manuales";

const MODULES: {
  view: Exclude<View, "hub">;
  icon: typeof Zap;
  /** Clave en marketAdmin.bonusHub.modules */
  key: "automatic" | "manual";
  /** Cantidad del badge (por ahora fija) */
  badgeCount: number;
  badgeColor: string;
}[] = [
  {
    view: "promociones",
    icon: Zap,
    key: "automatic",
    badgeCount: 2,
    badgeColor: "bg-green-50 text-green-700 border border-green-200"
  },
  {
    view: "manuales",
    icon: Users,
    key: "manual",
    badgeCount: 1,
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200"
  }
];

export default function MarketAdminBonusAndPromotions() {
  const t = useTranslations("marketAdmin.bonusHub");
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
        title={t("title")}
        back="/market-admin/bonuses-and-discounts"
        titleExtra={t("subtitle")}
      />

      <div className="cp-card overflow-hidden">
        <div className="px-[18px] py-[14px]">
          <div className="grid grid-cols-2 gap-4">
            {MODULES.map(({ view: v, icon: Icon, key, badgeCount, badgeColor }) => (
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
                    {t(`modules.${key}.badge`, { count: badgeCount })}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#141414] mb-1">
                    {t(`modules.${key}.title`)}
                  </h2>
                  <p className="text-[13px] text-[#999999] leading-relaxed">
                    {t(`modules.${key}.description`)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[13px] font-semibold text-[#0067B1] mt-auto">
                  {t("goToModule")} <ArrowRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
