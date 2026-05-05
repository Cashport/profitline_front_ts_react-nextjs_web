"use client";

import { Dispatch, SetStateAction, useContext, useState } from "react";
import { GitBranch, Pencil, Plus, Trash2, X } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { DiscountItem } from "@/types/commerce/ICommerce";

const INDICATIVOS = ["+57", "+1", "+34", "+52", "+56", "+58"];

const DIRECCIONES_MOCK = [
  "AV. ENRIQUILLO # 54 PLAZA ENRIQUILLO",
  "CALLE 90 # 19A-49 CONSULTORIO 306",
  "CRA 15 # 88-64 LOCAL 102"
];

function formatPrice(n: number) {
  return "$" + (n ?? 0).toLocaleString("es-CO");
}

export type Entrega = {
  id: string;
  direccion: string;
  indicativo: string;
  telefono: string;
  observaciones: string;
  cantidades: Record<string, number>;
};

interface OrderShipmentConfirmProps {
  multiEntrega: boolean;
  setMultiEntrega: (v: boolean) => void;
  entregas: Entrega[];
  setEntregas: Dispatch<SetStateAction<Entrega[]>>;
  cantidadesAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  onConfirm: () => void;
}

export default function OrderShipmentConfirm({
  multiEntrega,
  setMultiEntrega,
  entregas,
  setEntregas,
  cantidadesAsignadasExcluyendo,
  onConfirm
}: OrderShipmentConfirmProps) {
  const { client, confirmOrderData } = useContext(OrderViewContext);

  const discountItems: DiscountItem[] = confirmOrderData?.discounts?.discountItems ?? [];

  const [form, setForm] = useState({
    direccion: DIRECCIONES_MOCK[0],
    email: "",
    indicativo: "+57",
    telefono: "",
    observaciones: ""
  });

  const [modalEntrega, setModalEntrega] = useState<null | "new" | string>(null);
  const [modalDraft, setModalDraft] = useState<Omit<Entrega, "id">>({
    direccion: DIRECCIONES_MOCK[0],
    indicativo: "+57",
    telefono: "",
    observaciones: "",
    cantidades: {}
  });

  const makeBlankEntrega = (): Omit<Entrega, "id"> => ({
    direccion: DIRECCIONES_MOCK[0],
    indicativo: "+57",
    telefono: "",
    observaciones: "",
    cantidades: Object.fromEntries(discountItems.map((i) => [i.product_sku, 0]))
  });

  const openNewModal = () => {
    setModalDraft(makeBlankEntrega());
    setModalEntrega("new");
  };

  const openEditModal = (entrega: Entrega) => {
    setModalDraft({
      direccion: entrega.direccion,
      indicativo: entrega.indicativo,
      telefono: entrega.telefono,
      observaciones: entrega.observaciones,
      cantidades: { ...entrega.cantidades }
    });
    setModalEntrega(entrega.id);
  };

  const saveModal = () => {
    if (modalEntrega === "new") {
      const id = `e${Date.now()}`;
      setEntregas((prev) => [...prev, { id, ...modalDraft }]);
    } else if (modalEntrega) {
      setEntregas((prev) => prev.map((e) => (e.id === modalEntrega ? { ...e, ...modalDraft } : e)));
    }
    setModalEntrega(null);
  };

  const removeEntrega = (id: string) =>
    setEntregas((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));

  const activarMultiEntrega = () => {
    setMultiEntrega(true);
    const blank = makeBlankEntrega();
    const e1: Entrega = { id: `e${Date.now()}`, ...blank, direccion: DIRECCIONES_MOCK[0] };
    const e2: Entrega = {
      id: `e${Date.now() + 1}`,
      ...blank,
      direccion: DIRECCIONES_MOCK[1] ?? DIRECCIONES_MOCK[0]
    };
    setEntregas([e1, e2]);
  };

  const desactivarMultiEntrega = () => {
    setMultiEntrega(false);
    setEntregas([]);
    setModalEntrega(null);
  };

  const cantidadesAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);
  const hayDesbalance = discountItems.some(
    (i) => cantidadesAsignadas(i.product_sku) !== i.quantity
  );

  const subtotal = confirmOrderData?.subtotal ?? 0;
  const totalDescuento = confirmOrderData?.discounts?.totalDiscount ?? 0;
  const total = confirmOrderData?.total ?? 0;
  const iva = confirmOrderData?.taxes ?? 0;

  return (
    <div className="flex flex-col w-[420px] flex-shrink-0 bg-[#F7F7F7]">
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDDDDD] flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#141414]">
              {multiEntrega ? "Múltiples entregas" : "Datos de envío"}
            </h2>
            <p className="text-xs text-[#999999]">{client?.name}</p>
          </div>
          {!multiEntrega ? (
            <button
              onClick={activarMultiEntrega}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:text-[#141414] transition-colors"
            >
              <GitBranch size={12} />
              Dividir entregas
            </button>
          ) : (
            <button
              onClick={desactivarMultiEntrega}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
              Un solo envío
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* SINGLE MODE */}
          {!multiEntrega && (
            <div className="px-5 py-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">
                  Dirección de despacho
                </label>
                <select
                  value={form.direccion}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] appearance-none"
                >
                  {DIRECCIONES_MOCK.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                  <option>+ Nueva dirección</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Teléfono de contacto</label>
                <div className="flex gap-2">
                  <select
                    value={form.indicativo}
                    onChange={(e) => setForm((f) => ({ ...f, indicativo: e.target.value }))}
                    className="w-20 px-2 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] appearance-none text-center"
                  >
                    {INDICATIVOS.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={form.telefono}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                    className="flex-1 px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Observaciones</label>
                <textarea
                  placeholder="Ingresar un comentario"
                  maxLength={64}
                  value={form.observaciones}
                  onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
                />
                <p className="text-[10px] text-[#999999]">Máximo 64 caracteres</p>
              </div>
            </div>
          )}

          {/* MULTI MODE */}
          {multiEntrega && (
            <div className="flex flex-col px-4 py-4 gap-3">
              {entregas.map((entrega, eIdx) => (
                <div
                  key={entrega.id}
                  className="border border-[#EEEEEE] rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F7F7] border-b border-[#EEEEEE]">
                    <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {eIdx + 1}
                    </span>
                    <p className="flex-1 text-xs font-medium text-[#141414] truncate">
                      {entrega.direccion}
                    </p>
                    <button
                      onClick={() => openEditModal(entrega)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#999999] hover:text-[#141414] hover:bg-white transition-colors flex-shrink-0"
                      title="Editar destino"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeEntrega(entrega.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Eliminar destino"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="divide-y divide-[#F7F7F7]">
                    {discountItems.map((item) => {
                      const asignado = entrega.cantidades[item.product_sku] ?? 0;
                      return (
                        <div key={item.product_sku} className="flex items-center gap-2 px-3 py-2">
                          <p className="flex-1 text-[11px] text-[#666666] line-clamp-1">
                            {item.description}
                          </p>
                          <span
                            className={`text-[11px] font-semibold w-6 text-right ${asignado === 0 ? "text-[#CCCCCC]" : "text-[#141414]"}`}
                          >
                            {asignado}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {(entrega.telefono || entrega.observaciones) && (
                    <div className="px-3 py-2 bg-[#FAFAFA] border-t border-[#F0F0F0] flex flex-col gap-0.5">
                      {entrega.telefono && (
                        <p className="text-[10px] text-[#999999]">
                          {entrega.indicativo} {entrega.telefono}
                        </p>
                      )}
                      {entrega.observaciones && (
                        <p className="text-[10px] text-[#999999] italic line-clamp-1">
                          {entrega.observaciones}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={openNewModal}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#DDDDDD] rounded-xl text-xs text-[#999999] hover:border-[#141414] hover:text-[#141414] transition-colors"
              >
                <Plus size={12} />
                Agregar destino
              </button>
            </div>
          )}

          {/* MODAL */}
          {modalEntrega !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl border border-[#DDDDDD] w-[480px] max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEE]">
                  <h3 className="text-sm font-bold text-[#141414]">
                    {modalEntrega === "new" ? "Nuevo destino" : "Editar destino"}
                  </h3>
                  <button
                    onClick={() => setModalEntrega(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999999] hover:bg-[#F7F7F7] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#666666]">
                      Dirección de entrega
                    </label>
                    <select
                      value={modalDraft.direccion}
                      onChange={(e) => setModalDraft((d) => ({ ...d, direccion: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
                    >
                      {DIRECCIONES_MOCK.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__nueva__">+ Nueva dirección</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#666666]">
                      Teléfono de contacto
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={modalDraft.indicativo}
                        onChange={(e) =>
                          setModalDraft((d) => ({ ...d, indicativo: e.target.value }))
                        }
                        className="w-20 px-2 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] text-center"
                      >
                        {INDICATIVOS.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="3001234567"
                        value={modalDraft.telefono}
                        onChange={(e) => setModalDraft((d) => ({ ...d, telefono: e.target.value }))}
                        className="flex-1 px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#666666]">
                      Observaciones
                    </label>
                    <textarea
                      placeholder="Instrucciones especiales para esta entrega"
                      maxLength={128}
                      value={modalDraft.observaciones}
                      onChange={(e) =>
                        setModalDraft((d) => ({ ...d, observaciones: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-[#666666]">
                      Unidades por producto
                    </label>
                    <div className="border border-[#EEEEEE] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[1fr_56px_72px] px-3 py-2 bg-[#F7F7F7] border-b border-[#EEEEEE]">
                        <span className="text-[10px] text-[#999999] font-semibold">Producto</span>
                        <span className="text-[10px] text-[#999999] font-semibold text-center">
                          Disp.
                        </span>
                        <span className="text-[10px] text-[#999999] font-semibold text-center">
                          Cant.
                        </span>
                      </div>
                      {discountItems.map((item, iIdx) => {
                        const asignado = modalDraft.cantidades[item.product_sku] ?? 0;
                        const asignadoOtros = cantidadesAsignadasExcluyendo(
                          item.product_sku,
                          modalEntrega === "new" ? null : modalEntrega
                        );
                        const disponible = item.quantity - asignadoOtros;
                        const puedeAsignar = disponible;
                        return (
                          <div
                            key={item.product_sku}
                            className={`grid grid-cols-[1fr_56px_72px] items-center px-3 py-2.5 ${iIdx < discountItems.length - 1 ? "border-b border-[#EEEEEE]" : ""}`}
                          >
                            <p className="text-xs text-[#141414] leading-tight pr-2">
                              {item.description}
                            </p>
                            <p
                              className={`text-xs font-semibold text-center ${puedeAsignar === 0 ? "text-red-400" : "text-[#666666]"}`}
                            >
                              {puedeAsignar}
                            </p>
                            <input
                              type="number"
                              min={0}
                              max={puedeAsignar}
                              value={asignado === 0 ? "" : asignado}
                              placeholder="0"
                              onChange={(e) => {
                                const v = Math.min(
                                  Math.max(parseInt(e.target.value) || 0, 0),
                                  puedeAsignar
                                );
                                setModalDraft((d) => ({
                                  ...d,
                                  cantidades: { ...d.cantidades, [item.product_sku]: v }
                                }));
                              }}
                              className="w-full text-center text-sm font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 px-5 py-4 border-t border-[#EEEEEE]">
                  <button
                    onClick={() => setModalEntrega(null)}
                    className="flex-1 py-2.5 text-sm font-semibold text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:text-[#141414] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveModal}
                    className="flex-1 py-2.5 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors"
                  >
                    {modalEntrega === "new" ? "Agregar destino" : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-[#EEEEEE] px-5 py-3 flex-shrink-0">
          <div className="rounded-lg bg-[#F7F7F7] px-4 py-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-[#666666]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {totalDescuento > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>Descuentos aplicados</span>
                <span>-{formatPrice(totalDescuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#141414] pt-1.5 border-t border-[#DDDDDD] mt-0.5">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#999999]">
              <span>IVA (19%)</span>
              <span>{formatPrice(iva)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#141414]">
              <span>Total con IVA</span>
              <span>{formatPrice(total + iva)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-4 flex-shrink-0">
          <button className="flex-1 py-3 text-sm font-semibold bg-[#141414] text-white rounded-lg hover:bg-[#333333] transition-colors">
            Guardar borrador
          </button>
          <button
            onClick={onConfirm}
            disabled={multiEntrega && hayDesbalance}
            className="flex-1 py-3 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
