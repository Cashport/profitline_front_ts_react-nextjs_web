"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Gift, ArrowLeft, Save } from "lucide-react";
import { useAppStore } from "@/lib/store/store";
import { getProductsByProject } from "@/services/products/products";
import { createBonification } from "@/services/marketAdmin/marketAdmin";
import { useMessageApi } from "@/context/MessageContext";
import { IPromocion } from "@/types/marketAdmin/IMarketAdmin";
import { buildPromotionPayload } from "./buildPromotionPayload";
import PromocionCard from "./PromocionCard";

interface Props {
  onBack: () => void;
  onSaved?: () => void;
}

export default function MarketAdminPromotions({ onBack, onSaved }: Props) {
  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();
  const { data: productsResponse } = useSWR(ID ? ["ma-products", ID] : null, () =>
    getProductsByProject(ID)
  );
  const products = productsResponse?.data ?? [];

  const [promociones, setPromociones] = useState<IPromocion[]>([]);
  const [saving, setSaving] = useState(false);

  const addPromocion = () => {
    const id = `p${Date.now()}`;
    setPromociones((prev) => [
      ...prev,
      {
        id,
        nombre: "Nueva promoción",
        tipoCondicion: "monto",
        activa: true,
        fechaInicio: "",
        fechaFin: "",
        accumulable: 0,
        niveles: []
      }
    ]);
  };

  const updatePromocion = (id: string, p: IPromocion) => {
    setPromociones((prev) => prev.map((x) => (x.id === id ? p : x)));
  };

  const deletePromocion = (id: string) => {
    setPromociones((prev) => prev.filter((x) => x.id !== id));
  };

  const handleGuardar = async () => {
    if (promociones.length === 0) return;

    const invalida = promociones.some(
      (p) => !p.fechaInicio || !p.fechaFin || p.niveles.length === 0
    );
    if (invalida) {
      showMessage(
        "error",
        "Cada promoción necesita fecha de inicio, fecha de fin y al menos un nivel."
      );
      return;
    }

    try {
      setSaving(true);
      await Promise.all(promociones.map((p) => createBonification(buildPromotionPayload(p))));
      showMessage("success", "Promociones guardadas exitosamente.");
      onSaved?.();
    } catch (error) {
      showMessage("error", "Ocurrió un error al guardar las promociones.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-[#999999] hover:text-[#141414] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#141414]">Promociones automáticas</h1>
              <p className="text-xs text-[#999999]">
                Define condiciones y productos bonificados por escalones
              </p>
            </div>
          </div>
          <button
            onClick={addPromocion}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Plus size={14} /> Nueva promoción
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {promociones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Gift size={32} className="text-[#DDDDDD]" />
              <p className="text-sm text-[#999999]">No hay promociones creadas</p>
              <button
                onClick={addPromocion}
                className="px-4 py-2 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Crear primera promoción
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {promociones.map((promo) => (
                <PromocionCard
                  key={promo.id}
                  promo={promo}
                  products={products}
                  onChange={(p) => updatePromocion(promo.id, p)}
                  onDelete={() => deletePromocion(promo.id)}
                />
              ))}

              {/* Global save */}
              <div className="flex justify-end border-t border-[#EEEEEE] pt-4">
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#CBE71E] text-[#141414] text-sm font-semibold rounded-lg hover:bg-[#b8d419] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={15} /> {saving ? "Guardando…" : "Guardar promoción"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
