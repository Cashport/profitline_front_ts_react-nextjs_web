"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "use-intl";
import { Pencil, Save } from "lucide-react";
import Header from "@/components/organisms/header";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import ProfitLoader from "@/components/ui/profit-loader";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { getProductsByProject } from "@/services/products/products";
import {
  getAdminPromotionDetail,
  getProjectBusinessUnits,
  updatePromotion
} from "@/services/marketAdmin/marketAdmin";
import {
  MARKET_ADMIN_DISCOUNTS_TABS,
  marketAdminDiscountsListPath
} from "@/components/organisms/discounts/constants/routes";
import { IPromocion } from "@/types/marketAdmin/IMarketAdmin";
import PromocionCard from "@/modules/marketAdmin/components/MarketAdminPromotions/PromocionCard";
import PromotionSummary from "@/modules/marketAdmin/components/MarketAdminPromotions/PromotionSummary";
import {
  buildPromotionUpdatePayload,
  hasCategoryGifts,
  promotionDetailToForm
} from "@/modules/marketAdmin/components/MarketAdminPromotions/promotionDetailToForm";

interface Props {
  promotionId: number;
}

export default function MarketAdminPromotionDetail({ promotionId }: Props) {
  const t = useTranslations("marketAdmin.promotionDetail");
  const tCommon = useTranslations("common");
  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const {
    data: detail,
    error,
    isLoading,
    mutate
  } = useSWR(ID ? ["admin-promotion-detail", ID, promotionId] : null, () =>
    getAdminPromotionDetail(promotionId)
  );

  const [form, setForm] = useState<IPromocion | null>(null);
  const [saving, setSaving] = useState(false);
  const editing = form !== null;

  const { data: productsResponse } = useSWR(editing && ID ? ["ma-products", ID] : null, () =>
    getProductsByProject(ID)
  );
  const { data: businessUnitsResponse } = useSWR(
    editing && ID ? ["ma-business-units", ID] : null,
    () => getProjectBusinessUnits(ID)
  );

  const editBlocked = detail ? hasCategoryGifts(detail) : false;

  const handleSave = async () => {
    if (!form || !detail) return;

    if (!form.nombre.trim() || !form.fechaInicio || form.niveles.length === 0) {
      showMessage("error", t("validation.incomplete"));
      return;
    }
    if (form.fechaFin && form.fechaFin < form.fechaInicio) {
      showMessage("error", t("validation.endBeforeStart"));
      return;
    }

    try {
      setSaving(true);
      await updatePromotion(promotionId, buildPromotionUpdatePayload(form, detail));
      await mutate();
      setForm(null);
      showMessage("success", t("feedback.updated"));
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error && err.message ? err.message : t("feedback.updateError")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-page min-h-full">
      <Header
        title={detail?.name ?? t("fallbackTitle")}
        back={marketAdminDiscountsListPath(MARKET_ADMIN_DISCOUNTS_TABS.bonuses)}
        titleExtra={t("subtitle", { id: promotionId })}
      />

      <div className="cp-card overflow-hidden px-[18px] py-[14px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ProfitLoader />
          </div>
        ) : error || !detail ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[#999999]">{error?.message || t("notFound")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-2">
              {editBlocked && !editing && (
                <p className="text-[13px] text-[#999999] mr-auto">{t("editBlocked")}</p>
              )}
              {editing ? (
                <>
                  <div className="h-[var(--control-h)] flex-shrink-0">
                    <SecondaryButton onClick={() => setForm(null)} disabled={saving} bordered>
                      {tCommon("actions.cancel")}
                    </SecondaryButton>
                  </div>
                  <div className="h-[var(--control-h)] flex-shrink-0">
                    <PrincipalButton
                      onClick={handleSave}
                      disabled={saving}
                      loading={saving}
                      icon={<Save size={15} />}
                      customStyles={{ fontSize: 14 }}
                    >
                      {saving ? tCommon("status.saving") : tCommon("actions.saveChanges")}
                    </PrincipalButton>
                  </div>
                </>
              ) : (
                <div className="h-[var(--control-h)] flex-shrink-0">
                  <PrincipalButton
                    onClick={() => setForm(promotionDetailToForm(detail))}
                    disabled={editBlocked}
                    icon={<Pencil size={15} />}
                    customStyles={{ fontSize: 14 }}
                  >
                    {t("edit")}
                  </PrincipalButton>
                </div>
              )}
            </div>

            {editing ? (
              <PromocionCard
                promo={form}
                products={productsResponse?.data ?? []}
                businessUnits={businessUnitsResponse?.data ?? []}
                onChange={setForm}
              />
            ) : (
              <PromotionSummary detail={detail} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
