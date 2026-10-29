"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Select, Spin } from "antd";
import { ImagePlus, Minus, Package, Plus, Trash2, X } from "lucide-react";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMarketAdminProducts } from "@/modules/marketAdmin/hooks/useMarketAdminProducts";
import { useMarketAdminProductLines } from "@/modules/marketAdmin/hooks/useMarketAdminProductLines";
import { useMarketAdminProductCategories } from "@/modules/marketAdmin/hooks/useMarketAdminProductCategories";
import { useProductPackDetail } from "@/modules/marketAdmin/hooks/useProductPacks";
import { createProductPack, updateProductPack } from "@/services/productPack/productPack";
import { IProductPackBody } from "@/types/productPack/IProductPack";

interface PackItemDraft {
  productId: number;
  sku: string;
  description: string;
  image: string | null;
  quantity: number;
}

interface Props {
  open: boolean;
  packId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full h-9 rounded-lg border border-[#e3e3e3] bg-[#fafafa] px-3 text-[13px] text-[#141414] outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-[#141414]";
const labelClass = "text-[11.5px] font-medium text-[#6b6b6b]";

const hasImage = (src?: string | null): src is string => !!src && src !== ".";

export default function ProductPackFormModal({ open, packId, onClose, onSaved }: Props) {
  const { showMessage } = useMessageApi();
  const isEdit = packId !== null;
  const { data: pack, isLoading: isLoadingPack } = useProductPackDetail(packId);
  const { data: lines } = useMarketAdminProductLines();
  const { data: categories } = useMarketAdminProductCategories();

  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [lineId, setLineId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [items, setItems] = useState<PackItemDraft[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(productSearch, 400);
  const { data: products, isLoading: isLoadingProducts } = useMarketAdminProducts({
    page: 1,
    limit: 20,
    search: debouncedSearch
  });

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setProductSearch("");
    setImageFile(null);
    if (!isEdit) {
      setSku("");
      setDescription("");
      setLineId(null);
      setCategoryId(null);
      setIsAvailable(true);
      setItems([]);
      setImagePreview(null);
    }
  }, [open, isEdit]);

  useEffect(() => {
    if (!open || !pack) return;
    setSku(pack.sku);
    setDescription(pack.description);
    setLineId(pack.id_line);
    setCategoryId(pack.id_category);
    setIsAvailable(pack.is_available === 1);
    setImagePreview(hasImage(pack.image) ? pack.image : null);
    setItems(
      pack.items.map((item) => ({
        productId: item.productId,
        sku: item.productSku ?? "",
        description: item.productDescription ?? "",
        image: item.productImage ?? null,
        quantity: item.quantity
      }))
    );
  }, [open, pack]);

  const lineCategories = useMemo(
    () => categories.filter((c) => c.line_id === lineId),
    [categories, lineId]
  );

  const productOptions = useMemo(
    () =>
      products
        .filter((p) => !items.some((item) => item.productId === p.id))
        .map((p) => ({ value: p.id, label: `${p.sku} · ${p.description}` })),
    [products, items]
  );

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const errors = {
    sku: !sku.trim() ? "El SKU es obligatorio" : sku.length > 100 ? "Máximo 100 caracteres" : "",
    description: !description.trim()
      ? "La descripción es obligatoria"
      : description.length > 255
        ? "Máximo 255 caracteres"
        : "",
    line: lineId === null ? "Selecciona una línea" : "",
    category: categoryId === null ? "Selecciona una categoría" : "",
    items: items.length === 0 ? "Agrega al menos un producto" : ""
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleAddProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        sku: product.sku,
        description: product.description,
        image: hasImage(product.image) ? product.image : null,
        quantity: 1
      }
    ]);
    setProductSearch("");
  };

  const handleQuantity = (productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity || 1) } : item
      )
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValid || lineId === null || categoryId === null) return;

    const body: IProductPackBody = {
      sku: sku.trim(),
      description: description.trim(),
      idLine: lineId,
      idCategory: categoryId,
      items: items.map(({ productId, quantity }) => ({ productId, quantity }))
    };

    setSaving(true);
    try {
      if (isEdit && packId !== null) {
        await updateProductPack(packId, body, imageFile);
      } else {
        const created = await createProductPack({
          ...body,
          isAvailable: isAvailable ? 1 : 0
        });
        // El POST no persiste la imagen adjunta: se sube con un PUT aparte.
        if (imageFile && created?.id) {
          try {
            await updateProductPack(created.id, body, imageFile);
          } catch {
            showMessage("warning", "El pack se creó, pero no se pudo subir la imagen.");
          }
        }
      }
      showMessage(
        "success",
        isEdit ? "Pack actualizado correctamente." : "Pack creado correctamente."
      );
      onSaved();
      onClose();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "";
      showMessage("error", message || "Ocurrió un error al guardar el pack.");
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (message: string) =>
    submitted && message ? <p className="text-[11px] text-[#e5262b]">{message}</p> : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={900}
      centered
      destroyOnClose
      styles={{ content: { padding: 0, borderRadius: 16, overflow: "hidden" } }}
    >
      <div className="flex max-h-[calc(100*var(--vh)-120px)] flex-col">
        <div className="flex items-center gap-3 border-b border-[#ececec] px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f9d2]">
            <Package size={18} className="text-[#141414]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold text-[#141414]">
              {isEdit ? "Editar pack" : "Nuevo pack de productos"}
            </p>
            <p className="text-[12px] text-[#6b6b6b]">
              Agrupa productos del catálogo en un solo SKU. El precio se calcula con la lista de
              precios de cada cliente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#141414]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {isEdit && isLoadingPack ? (
          <div className="flex h-64 items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[200px_minmax(0,1fr)] gap-6 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-3">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[14px] bg-[#f7f7f7]">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={description}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Package size={44} className="text-[#8a8a8a]" strokeWidth={1.7} />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#e3e3e3] bg-white text-[13px] font-medium text-[#4a4a4a] transition-colors hover:text-[#141414]"
              >
                <ImagePlus size={15} /> {imagePreview ? "Cambiar imagen" : "Subir imagen"}
              </button>

              {!isEdit && (
                <label className="mt-1 flex cursor-pointer items-center justify-between rounded-lg bg-[#f7f7f7] px-3 py-2.5">
                  <span className="text-[13px] text-[#141414]">Activo al crear</span>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 accent-[#cbe71e]"
                  />
                </label>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>SKU del pack</label>
                  <input
                    value={sku}
                    maxLength={100}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ej. PACK-ALAS-001"
                    className={inputClass}
                  />
                  {fieldError(errors.sku)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Nombre visible</label>
                  <input
                    value={description}
                    maxLength={255}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej. Kit rutina antiedad"
                    className={inputClass}
                  />
                  {fieldError(errors.description)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Línea</label>
                  <Select
                    value={lineId ?? undefined}
                    placeholder="Selecciona una línea"
                    showSearch
                    optionFilterProp="label"
                    options={lines.map((l) => ({ value: l.id, label: l.description }))}
                    onChange={(value: number) => {
                      setLineId(value);
                      setCategoryId(null);
                    }}
                    className="h-9 w-full"
                  />
                  {fieldError(errors.line)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Categoría</label>
                  <Select
                    value={categoryId ?? undefined}
                    placeholder={
                      lineId === null ? "Primero elige la línea" : "Selecciona una categoría"
                    }
                    disabled={lineId === null}
                    showSearch
                    optionFilterProp="label"
                    options={lineCategories.map((c) => ({ value: c.id, label: c.description }))}
                    onChange={(value: number) => setCategoryId(value)}
                    className="h-9 w-full"
                  />
                  {fieldError(errors.category)}
                </div>
              </div>

              <div className="h-px bg-[#ececec]" />

              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-[#141414]">Productos del pack</p>
                <p className="text-[11px] text-[#8a8a8a]">
                  {items.length} {items.length === 1 ? "producto" : "productos"} · {totalUnits}{" "}
                  {totalUnits === 1 ? "unidad" : "unidades"}
                </p>
              </div>

              <Select<number>
                showSearch
                value={null as unknown as number}
                placeholder="Buscar producto por SKU o nombre…"
                filterOption={false}
                searchValue={productSearch}
                onSearch={setProductSearch}
                onSelect={handleAddProduct}
                notFoundContent={
                  isLoadingProducts ? <Spin size="small" /> : "No se encontraron productos"
                }
                options={productOptions}
                className="h-9 w-full"
              />
              {fieldError(errors.items)}

              {items.length > 0 && (
                <div className="overflow-hidden rounded-[10px] border border-[#ececec]">
                  <div className="grid h-8 grid-cols-[minmax(0,1fr)_120px_36px] items-center gap-3 border-b border-[#ececec] px-4 text-[12px] font-semibold text-[#141414]">
                    <span>Producto</span>
                    <span className="text-right">Cantidad</span>
                    <span />
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_120px_36px] items-center gap-3 border-b border-[#f2f2f2] px-4 py-1.5 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f7f7f7]">
                          {hasImage(item.image) ? (
                            <img
                              src={item.image}
                              alt={item.description}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Package size={14} className="text-[#8a8a8a]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium text-[#141414]">
                            {item.description}
                          </p>
                          <p className="truncate text-[10.5px] text-[#6b6b6b]">{item.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#141414] hover:bg-[#f2f2f2] disabled:text-[#c4c4c4] disabled:hover:bg-transparent"
                          aria-label="Restar"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQuantity(item.productId, Number(e.target.value))}
                          className="h-7 w-11 rounded-md bg-[#f2f2f2] text-center text-[13px] font-semibold text-[#141414] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#141414] hover:bg-[#f2f2f2]"
                          aria-label="Sumar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setItems((prev) => prev.filter((p) => p.productId !== item.productId))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#8a8a8a] hover:bg-[#f2f2f2] hover:text-[#e5262b]"
                        aria-label="Quitar producto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[#ececec] px-6 py-3">
          <button
            onClick={onClose}
            className="h-10 rounded-[10px] px-4 text-[13px] font-semibold text-[#141414] hover:bg-[#f2f2f2]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || (isEdit && isLoadingPack)}
            className="h-10 rounded-[10px] bg-[#cbe71e] px-5 text-[13px] font-semibold text-[#141414] transition-colors hover:bg-[#9bb514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear pack"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
