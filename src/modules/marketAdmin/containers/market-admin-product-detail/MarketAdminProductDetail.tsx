"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { PRODUCTOS_ADMIN_MOCK } from "@/modules/marketAdmin/mocks/products";
import { useMarketAdminProductDetail } from "@/modules/marketAdmin/hooks/useMarketAdminProductDetail";
import ProductInfoSection from "@/modules/marketAdmin/components/market-admin-product-detail/ProductInfoSection";
import ProductImageUpload from "@/modules/marketAdmin/components/market-admin-product-detail/ProductImageUpload";
import ProductSkusTable from "@/modules/marketAdmin/components/market-admin-product-detail/ProductSkusTable";
import ProductLotes from "@/modules/marketAdmin/components/market-admin-product-detail/ProductLotes";

export default function MarketAdminProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const base = PRODUCTOS_ADMIN_MOCK.find((p) => p.id === id) ?? PRODUCTOS_ADMIN_MOCK[0];

  // Detalle real desde el backend — por ahora solo se loguea para tipar la respuesta.
  const { data: productDetail, isLoading, error } = useMarketAdminProductDetail(id);

  useEffect(() => {
    console.log("[MarketAdminProductDetail] GET /product/:id →", {
      id,
      productDetail,
      isLoading,
      error
    });
  }, [id, productDetail, isLoading, error]);

  const [nombreVisible, setNombreVisible] = useState(base.nombreVisible);
  const [activo, setActivo] = useState(base.activo);
  const [imagen, setImagen] = useState(base.imagen);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">{nombreVisible}</h1>

      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
        {/* Card top bar: back + save */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <Link
            href="/market-admin/productos"
            className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              saved ? "bg-[#E6F9E6] text-[#1A7A1A]" : "bg-[#CBE71E] text-[#141414] hover:bg-[#b8d11a]"
            }`}
          >
            {saved ? (
              <>
                <Check size={14} /> Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>

        <ProductInfoSection
          producto={base}
          activo={activo}
          onToggleActivo={() => setActivo((v) => !v)}
        />

        <div className="p-6 grid grid-cols-[180px_1fr] gap-8">
          {/* Left: image */}
          <ProductImageUpload imagen={imagen} alt={nombreVisible} onChange={setImagen} />

          {/* Right: editable fields + tables */}
          <div className="flex flex-col gap-5">
            {/* Nombre editable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#999999]">Nombre visible</label>
              <input
                type="text"
                value={nombreVisible}
                onChange={(e) => setNombreVisible(e.target.value)}
                className="w-full text-sm text-[#141414] border border-[#DDDDDD] rounded-lg px-3 py-2.5 outline-none focus:border-[#141414] transition-colors font-bold"
              />
              <p className="text-[11px] text-[#AAAAAA]">Nombre interno: {base.nombre}</p>
            </div>

            <div className="border-t border-[#EEEEEE]" />

            <ProductSkusTable skuList={base.skuList} />

            <div className="border-t border-[#EEEEEE]" />

            <ProductLotes lotes={base.lotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
