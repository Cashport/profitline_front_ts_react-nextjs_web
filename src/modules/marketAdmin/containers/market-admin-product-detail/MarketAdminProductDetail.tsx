"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminProductDetail } from "@/modules/marketAdmin/hooks/useMarketAdminProductDetail";
import { useMarketAdminRelatedSkus } from "@/modules/marketAdmin/hooks/useMarketAdminRelatedSkus";
import { getProductInventory, updateMarketAdminProduct } from "@/services/marketAdmin/marketAdmin";
import {
  IProductInventoryItem,
  IUpdateMarketAdminProductBody
} from "@/types/marketAdmin/IMarketAdmin";
import ProfitLoader from "@/components/ui/profit-loader";
import ProductInfoSection from "@/modules/marketAdmin/components/market-admin-product-detail/ProductInfoSection";
import ProductImageUpload from "@/modules/marketAdmin/components/market-admin-product-detail/ProductImageUpload";
import ProductSkusTable from "@/modules/marketAdmin/components/market-admin-product-detail/ProductSkusTable";
import ProductLotes from "@/modules/marketAdmin/components/market-admin-product-detail/ProductLotes";

// Campos que el endpoint aún no devuelve → marcados como pendientes de backend.
const MISSING = "XXXX";

export default function MarketAdminProductDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { showMessage } = useMessageApi();

  const { data: product, isLoading, error, mutate } = useMarketAdminProductDetail(id);
  const { data: relatedSkus } = useMarketAdminRelatedSkus(id);

  const [nombreVisible, setNombreVisible] = useState("");
  const [activo, setActivo] = useState(false);
  const [imagen, setImagen] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inventory, setInventory] = useState<IProductInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Sincroniza el estado editable cuando llega/cambia el detalle del backend.
  useEffect(() => {
    if (!product) return;
    setNombreVisible(product.description ?? "");
    setActivo(product.is_available === 1);
    setImagen(product.image && product.image !== "." ? product.image : "");
    setImageFile(null);
  }, [product]);

  // TODO: temporal — inspeccionar la respuesta para tipar el hook de SKUs relacionados.
  useEffect(() => {
    if (relatedSkus) console.log("related-skus", relatedSkus);
  }, [relatedSkus]);

  // Inventario por lote y bodega (endpoint aparte del detalle).
  useEffect(() => {
    let active = true;

    const loadInventory = async () => {
      setInventoryLoading(true);
      try {
        const data = await getProductInventory(id);
        if (active) setInventory(data ?? []);
      } catch {
        if (active) setInventory([]);
      } finally {
        if (active) setInventoryLoading(false);
      }
    };

    loadInventory();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!product) return;

    const body: IUpdateMarketAdminProductBody = {};
    if (nombreVisible !== product.description) body.description = nombreVisible;
    const nextAvailable = activo ? 1 : 0;
    if (nextAvailable !== product.is_available) body.is_available = nextAvailable;
    if (imageFile) body.image = imageFile;

    if (Object.keys(body).length === 0) return;

    try {
      setSaving(true);
      await updateMarketAdminProduct(id, body);
      await mutate();
      setImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      showMessage("success", "Producto actualizado correctamente.");
    } catch {
      showMessage("error", "Ocurrió un error al actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProfitLoader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#999999]">No se pudo cargar el producto.</p>
      </div>
    );
  }

  // Hay algo por guardar: nombre, estado o una imagen nueva.
  const isDirty =
    nombreVisible !== product.description ||
    (activo ? 1 : 0) !== product.is_available ||
    imageFile !== null;

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
          {(isDirty || saving || saved) && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                saved
                  ? "bg-[#E6F9E6] text-[#1A7A1A]"
                  : "bg-[#CBE71E] text-[#141414] hover:bg-[#b8d11a]"
              }`}
            >
              {saved ? (
                <>
                  <Check size={14} /> Guardado
                </>
              ) : saving ? (
                "Guardando..."
              ) : (
                "Guardar cambios"
              )}
            </button>
          )}
        </div>

        <ProductInfoSection
          linea={product.line_name}
          canal={product.line_name}
          skus={product.product_units}
          precioBase={product.transfer_price}
          lotesCount={inventory.length}
          activo={activo}
          onToggleActivo={() => setActivo((v) => !v)}
        />

        <div className="p-6 grid grid-cols-[180px_1fr] gap-8">
          {/* Left: image */}
          <ProductImageUpload
            imagen={imagen}
            alt={nombreVisible}
            onChange={(file, url) => {
              setImageFile(file);
              setImagen(url);
            }}
          />

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
              <p className="text-[11px] text-[#AAAAAA]">Nombre interno: {product.sku}</p>
            </div>

            <div className="border-t border-[#EEEEEE]" />

            <ProductSkusTable
              skuList={[{ sku: product.sku, descripcion: product.description, precio: MISSING }]}
            />

            <div className="border-t border-[#EEEEEE]" />

            <ProductLotes lotes={inventory} loading={inventoryLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
