"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Gift, ArrowLeft, Save } from "lucide-react";
import { useAppStore } from "@/lib/store/store";
import { getProductsByProject } from "@/services/products/products";
import {
  createBonification,
  getProjectBusinessUnits
} from "@/services/marketAdmin/marketAdmin";
import { useMessageApi } from "@/context/MessageContext";
import { IPromocion } from "@/types/marketAdmin/IMarketAdmin";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
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

  const { data: businessUnitsResponse } = useSWR(
    ID ? ["ma-business-units", ID] : null,
    () => getProjectBusinessUnits(ID)
  );
  const businessUnits = businessUnitsResponse?.data ?? [];

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
              className="flex items-center gap-1.5 px-2 h-8 rounded-lg text-sm text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
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
          {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
          <div className="h-10 flex-shrink-0">
            <PrincipalButton onClick={addPromocion} icon={<Plus size={15} />}>
              Nueva promoción
            </PrincipalButton>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {promociones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Gift size={32} className="text-[#DDDDDD]" />
              <p className="text-sm text-[#999999]">No hay promociones creadas</p>
              <div className="h-10 flex-shrink-0">
                <PrincipalButton onClick={addPromocion}>Crear primera promoción</PrincipalButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {promociones.map((promo) => (
                <PromocionCard
                  key={promo.id}
                  promo={promo}
                  products={products}
                  businessUnits={businessUnits}
                  onChange={(p) => updatePromocion(promo.id, p)}
                  onDelete={() => deletePromocion(promo.id)}
                />
              ))}

              {/* Global save */}
              <div className="flex justify-end border-t border-[#EEEEEE] pt-4">
                <div className="h-10 flex-shrink-0">
                  <PrincipalButton
                    onClick={handleGuardar}
                    disabled={saving}
                    loading={saving}
                    icon={<Save size={15} />}
                  >
                    {saving ? "Guardando…" : "Guardar promoción"}
                  </PrincipalButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
