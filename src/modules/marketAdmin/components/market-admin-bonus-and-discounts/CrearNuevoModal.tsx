"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
import { ChevronLeft, Tag, Gift, Layers, Sliders } from "lucide-react";
import OptionCard from "@/modules/marketAdmin/components/modal-base/OptionCard";
import { MARKET_ADMIN_DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectBonificado: () => void;
};

type Step = "tipo" | "descuento";

export default function CrearNuevoModal({ open, onClose, onSelectBonificado }: Props) {
  const t = useTranslations("marketAdmin.createNewModal");
  const tCommon = useTranslations("common.actions");
  const [step, setStep] = useState<Step>("tipo");
  const router = useRouter();

  // Always start from the first step whenever the modal is (re)opened.
  useEffect(() => {
    if (open) setStep("tipo");
  }, [open]);

  const goTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const title = (
    <div className="flex items-center gap-2">
      {step === "descuento" && (
        <button
          onClick={() => setStep("tipo")}
          aria-label={tCommon("back")}
          className="text-[#AAAAAA] hover:text-[#141414] transition-colors mr-1"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <span className="text-base font-bold text-[#141414]">
        {step === "tipo" ? t("title") : t("discountTypeTitle")}
      </span>
    </div>
  );

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={420} title={title} destroyOnClose>
      {step === "tipo" && (
        <div className="flex flex-col gap-3 py-1">
          <p className="text-sm text-[#999999] mb-1">{t("selectType")}</p>
          <OptionCard
            icon={Tag}
            iconColor="#B84A00"
            bg="#FFF0E6"
            bgHover="#FFE0CC"
            title={t("options.discount.title")}
            description={t("options.discount.description")}
            onClick={() => setStep("descuento")}
          />
          <OptionCard
            icon={Gift}
            iconColor="#1A5FAD"
            bg="#E8F4FF"
            bgHover="#D0E8FF"
            title={t("options.bonus.title")}
            description={t("options.bonus.description")}
            onClick={onSelectBonificado}
          />
        </div>
      )}

      {step === "descuento" && (
        <div className="flex flex-col gap-3 py-1">
          <p className="text-sm text-[#999999] mb-1">{t("selectDiscountType")}</p>
          <OptionCard
            icon={Layers}
            iconColor="#1A7A1A"
            bg="#F0FFF0"
            bgHover="#D8F5D8"
            title={t("options.discountGroup.title")}
            description={t("options.discountGroup.description")}
            onClick={() => goTo(`${MARKET_ADMIN_DISCOUNTS_BASE}/package/create`)}
          />
          <OptionCard
            icon={Sliders}
            iconColor="#6B21A8"
            bg="#F5F0FF"
            bgHover="#E8DDFF"
            title={t("options.discountRule.title")}
            description={t("options.discountRule.description")}
            onClick={() => goTo(`${MARKET_ADMIN_DISCOUNTS_BASE}/rule/create`)}
          />
        </div>
      )}
    </Modal>
  );
}
