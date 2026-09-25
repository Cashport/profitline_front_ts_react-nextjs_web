"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
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
          className="text-[#AAAAAA] hover:text-[#141414] transition-colors mr-1"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <span className="text-base font-bold text-[#141414]">
        {step === "tipo" ? "Crear nuevo" : "Tipo de descuento"}
      </span>
    </div>
  );

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={420} title={title} destroyOnClose>
      {step === "tipo" && (
        <div className="flex flex-col gap-3 py-1">
          <p className="text-sm text-[#999999] mb-1">Selecciona el tipo que quieres crear.</p>
          <OptionCard
            icon={Tag}
            iconColor="#B84A00"
            bg="#FFF0E6"
            bgHover="#FFE0CC"
            title="Descuento"
            description="Crea reglas de descuento por producto y fechas de vigencia."
            onClick={() => setStep("descuento")}
          />
          <OptionCard
            icon={Gift}
            iconColor="#1A5FAD"
            bg="#E8F4FF"
            bgHover="#D0E8FF"
            title="Bonificado"
            description="Asigna unidades bonificadas a clientes específicos con flujo de aprobación."
            onClick={onSelectBonificado}
          />
        </div>
      )}

      {step === "descuento" && (
        <div className="flex flex-col gap-3 py-1">
          <p className="text-sm text-[#999999] mb-1">Selecciona el tipo de descuento.</p>
          <OptionCard
            icon={Layers}
            iconColor="#1A7A1A"
            bg="#F0FFF0"
            bgHover="#D8F5D8"
            title="Grupo de descuentos"
            description="Agrupa múltiples reglas de descuento bajo un mismo conjunto."
            onClick={() => goTo(`${MARKET_ADMIN_DISCOUNTS_BASE}/paquete/create`)}
          />
          <OptionCard
            icon={Sliders}
            iconColor="#6B21A8"
            bg="#F5F0FF"
            bgHover="#E8DDFF"
            title="Regla de descuento"
            description="Define una condición específica de descuento por producto, canal o volumen."
            onClick={() => goTo(`${MARKET_ADMIN_DISCOUNTS_BASE}/regla/create`)}
          />
        </div>
      )}
    </Modal>
  );
}
