"use client";

import { Modal } from "antd";
import { Tag, Sliders } from "lucide-react";
import OptionCard from "@/modules/marketAdmin/components/modal-base/OptionCard";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectPromocion: () => void;
};

export default function ModalCrearDescuento({ open, onClose, onSelectPromocion }: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      title={<span className="text-base font-bold text-[#141414]">Crear descuento</span>}
      destroyOnClose
    >
      <div className="flex flex-col gap-3 py-1">
        <p className="text-sm text-[#999999] mb-1">
          Selecciona el tipo de descuento que quieres crear.
        </p>
        <OptionCard
          icon={Tag}
          iconColor="#B84A00"
          bg="#FFF0E6"
          bgHover="#FFE0CC"
          title="Crear promoción"
          description="Crea una negociación con descuentos por producto y fechas de vigencia."
          onClick={onSelectPromocion}
        />
        <OptionCard
          icon={Sliders}
          iconColor="#6B21A8"
          bg="#F5F0FF"
          bgHover="#E8DDFF"
          title="Configurar descuentos"
          description="Próximamente — reglas de descuento avanzadas por canal o volumen."
          disabled
        />
      </div>
    </Modal>
  );
}
