"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { ChevronLeft, Tag, Gift, Layers, Sliders } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectBonificado: () => void;
};

type Step = "tipo" | "descuento";

type OptionCardProps = {
  icon: typeof Tag;
  iconColor: string;
  bg: string;
  bgHover: string;
  title: string;
  description: string;
  onClick: () => void;
};

function OptionCard({ icon: Icon, iconColor, bg, bgHover, title, description, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full text-left border border-[#E0E0E0] rounded-xl px-4 py-4 hover:border-[#141414] hover:bg-[#FAFAFA] transition-colors group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ backgroundColor: bg }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#141414]">{title}</p>
        <p className="text-xs text-[#999999] mt-0.5">{description}</p>
      </div>
    </button>
  );
}

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
            onClick={() => goTo("/descuentos/paquete/create")}
          />
          <OptionCard
            icon={Sliders}
            iconColor="#6B21A8"
            bg="#F5F0FF"
            bgHover="#E8DDFF"
            title="Regla de descuento"
            description="Define una condición específica de descuento por producto, canal o volumen."
            onClick={() => goTo("/descuentos/regla/create")}
          />
        </div>
      )}
    </Modal>
  );
}
