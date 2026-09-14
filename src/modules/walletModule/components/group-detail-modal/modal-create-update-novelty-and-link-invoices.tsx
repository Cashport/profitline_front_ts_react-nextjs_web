"use client";

import { useState } from "react";
import { Drawer, Select, Input, DatePicker, Pagination } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { X } from "lucide-react";

import { cn } from "@/utils/utils";
import { useWalletTheme } from "../../contexts/wallet-theme-context";
import { WALLET_PEOPLE } from "../../mocked-data";
import { HOY, dias, fac, fmtD, fmtFull, fmtM } from "../../utils/format";
import PersonBadge from "../shared/person-badge";
import TramoChip from "../shared/tramo-chip";
import type { IWalletInvoice, IWalletPerson } from "../../types";

export type NoveltyModalMode = "crear" | "editar" | "vincular";

interface ModalCreateUpdateNoveltyAndLinkInvoicesProps {
  /** Modo del panel; `null` lo mantiene cerrado. */
  mode: NoveltyModalMode | null;
  onClose: () => void;
}

// Mock local: por ahora el panel no recibe ni el cliente ni las facturas
// seleccionadas del grupo, así que trabaja siempre sobre este ejemplo fijo.
const MOCK_CLIENTE = "OXXO COLOMBIA S.A.S.";
const MOCK_INVOICES: IWalletInvoice[] = [
  {
    id: "F418251",
    doc: "FV-2026-00001",
    vence: new Date(2026, 8, 15),
    dias: 12,
    tramo: 1,
    saldo: 4_250_000
  }
];

// TODO: reemplazar por el catálogo real de tipos de novedad cuando exista el endpoint.
const NOVEDAD_TIPOS = [
  { value: "nc_comercial", label: "Nota crédito comercial" },
  { value: "nc_precio", label: "NC diferencia de precio" },
  { value: "refact", label: "Refacturación" },
  { value: "rechazo", label: "Factura rechazada / sin radicar" },
  { value: "cruce", label: "Cruce de saldos / legalización" },
  { value: "acuerdo", label: "Acuerdo de pago" },
  { value: "pago_ni", label: "Pago no identificado" },
  { value: "faltante", label: "Faltante / avería en entrega" }
];

interface MockNovedadAbierta {
  id: string;
  tipo: string;
  monto: number;
  responsable: IWalletPerson;
}

const NOVEDADES_PAGE_SIZE = 5;

// TODO: reemplazar por las novedades abiertas reales del cliente.
const MOCK_NOVEDADES_ABIERTAS: MockNovedadAbierta[] = [
  { id: "NOV-1042", tipo: "Acuerdo de pago", monto: 32_000_000, responsable: WALLET_PEOPLE.cosorio },
  { id: "NOV-1041", tipo: "Refacturación", monto: 281_000_000, responsable: WALLET_PEOPLE.cosorio },
  {
    id: "NOV-1044",
    tipo: "Nota crédito comercial",
    monto: 126_000_000,
    responsable: WALLET_PEOPLE.comercial
  },
  { id: "NOV-1045", tipo: "Refacturación", monto: 177_000_000, responsable: WALLET_PEOPLE.cosorio },
  { id: "NOV-1039", tipo: "Cruce de saldos / legalización", monto: 64_000_000, responsable: WALLET_PEOPLE.gtorres },
  { id: "NOV-1037", tipo: "Pago no identificado", monto: 18_500_000, responsable: WALLET_PEOPLE.mbermudez },
  { id: "NOV-1035", tipo: "Faltante / avería en entrega", monto: 9_200_000, responsable: WALLET_PEOPLE.eorjuela },
  { id: "NOV-1033", tipo: "Factura rechazada / sin radicar", monto: 41_300_000, responsable: WALLET_PEOPLE.malfonso },
  { id: "NOV-1030", tipo: "NC diferencia de precio", monto: 27_800_000, responsable: WALLET_PEOPLE.backoffice },
  { id: "NOV-1028", tipo: "Acuerdo de pago", monto: 152_000_000, responsable: WALLET_PEOPLE.cosorio },
  { id: "NOV-1025", tipo: "Refacturación", monto: 73_400_000, responsable: WALLET_PEOPLE.gtorres },
  { id: "NOV-1021", tipo: "Cruce de saldos / legalización", monto: 15_900_000, responsable: WALLET_PEOPLE.comercial }
];

const PERSONAS = Object.values(WALLET_PEOPLE).map((p) => ({ value: p.id, label: p.nombre }));

const TITULOS: Record<NoveltyModalMode, string> = {
  crear: "Nueva novedad",
  editar: "Editar datos de la novedad",
  vincular: "Vincular a una novedad existente"
};

const BOTONES: Record<NoveltyModalMode, string> = {
  crear: "Crear novedad",
  editar: "Guardar cambios",
  vincular: "Vincular facturas"
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-[11px] text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
    {children}
  </h4>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
    {children}
  </label>
);

/** Cuerpo del panel. Con `key={mode}` para que el estado nazca limpio cada vez que se abre. */
function DrawerBody({ mode, onClose }: { mode: NoveltyModalMode; onClose: () => void }) {
  const [tipo, setTipo] = useState(NOVEDAD_TIPOS[0].value);
  const [responsable, setResponsable] = useState(PERSONAS[0]?.value);
  const [fechaPrimerTicket, setFechaPrimerTicket] = useState<Dayjs>(dayjs(dias(HOY, 5)));
  const [fechaLimite, setFechaLimite] = useState<Dayjs>(dayjs(dias(HOY, 30)));
  const [novedadExistente, setNovedadExistente] = useState(MOCK_NOVEDADES_ABIERTAS[0].id);
  const [comentario, setComentario] = useState("");
  const [novedadesPage, setNovedadesPage] = useState(1);

  const novedadesVisibles = MOCK_NOVEDADES_ABIERTAS.slice(
    (novedadesPage - 1) * NOVEDADES_PAGE_SIZE,
    novedadesPage * NOVEDADES_PAGE_SIZE
  );

  const montoTotal = MOCK_INVOICES.reduce((sum, f) => sum + f.saldo, 0);

  const submit = () => {
    if (mode === "vincular") {
      console.log("Vincular novedad", {
        novedadExistente,
        comentario,
        facturas: MOCK_INVOICES
      });
    } else {
      console.log(mode === "crear" ? "Crear novedad" : "Editar novedad", {
        tipo,
        responsable,
        fechaPrimerTicket: fechaPrimerTicket.toDate(),
        fechaLimite: fechaLimite.toDate(),
        comentario,
        facturas: MOCK_INVOICES
      });
    }
    onClose();
  };

  return (
    <div className="wallet-scope flex h-full flex-col bg-card text-foreground">
      <header className="flex flex-none items-start gap-4 border-b border-border px-[22px] pb-4 pt-[18px]">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] text-foreground">
            {TITULOS[mode]}
          </h3>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {fac(MOCK_INVOICES.length)} · {fmtFull(montoTotal)} · {MOCK_CLIENTE}
          </p>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-[22px] py-4">
        {mode === "vincular" ? (
          <div>
            <SectionTitle>Novedades abiertas de este cliente</SectionTitle>
            <div className="overflow-hidden rounded-md border border-border">
              {novedadesVisibles.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setNovedadExistente(n.id)}
                  className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 text-[12.5px] transition-colors last:border-b-0 hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="novedad-existente"
                    aria-label={`Seleccionar ${n.id}`}
                    className="accent-wallet-nov"
                    checked={novedadExistente === n.id}
                    onChange={() => setNovedadExistente(n.id)}
                  />
                  <span className="font-mono font-semibold text-foreground">{n.id}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{n.tipo}</span>
                  <span className="whitespace-nowrap font-semibold tabular-nums text-foreground">
                    {fmtM(n.monto)}
                  </span>
                  <PersonBadge person={n.responsable} mini className="flex-none" />
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex justify-end">
              <Pagination
                current={novedadesPage}
                pageSize={NOVEDADES_PAGE_SIZE}
                total={MOCK_NOVEDADES_ABIERTAS.length}
                onChange={setNovedadesPage}
                showSizeChanger={false}
                hideOnSinglePage
                size="small"
              />
            </div>
          </div>
        ) : (
          <div>
            <SectionTitle>Clasificación</SectionTitle>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label>Tipo de novedad</Label>
                <Select className="w-full" value={tipo} options={NOVEDAD_TIPOS} onChange={setTipo} />
              </div>
              <div>
                <Label>Responsable</Label>
                <Select
                  className="w-full"
                  value={responsable}
                  options={PERSONAS}
                  onChange={setResponsable}
                />
              </div>
              <div>
                <Label>Fecha del primer ticket</Label>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  allowClear={false}
                  value={fechaPrimerTicket}
                  onChange={(d) => d && setFechaPrimerTicket(d)}
                />
              </div>
              <div>
                <Label>Fecha límite de solución</Label>
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  allowClear={false}
                  value={fechaLimite}
                  onChange={(d) => d && setFechaLimite(d)}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <SectionTitle>Comentario inicial</SectionTitle>
          <Input.TextArea
            rows={2}
            value={comentario}
            placeholder="Ej.: el cliente pide el soporte firmado antes del viernes"
            onChange={(e) => setComentario(e.target.value)}
          />
          {mode !== "vincular" && (
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              Queda como primera entrada en la línea de tiempo de la novedad. La próxima acción se
              abre como ticket con la fecha indicada.
            </p>
          )}
        </div>

        <div>
          <SectionTitle>Facturas incluidas</SectionTitle>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="border-b border-border bg-muted px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    Factura
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border bg-muted px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    Vence
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border bg-muted px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    Tramo
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border bg-muted px-3 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-mono font-semibold text-foreground">{f.doc}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-foreground">
                      {fmtD(f.vence)}
                    </td>
                    <td className="px-3 py-2">
                      <TramoChip tramo={f.tramo} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground">
                      {fmtFull(f.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">{fac(MOCK_INVOICES.length)}</p>
        </div>
      </div>

      <div className="flex flex-none items-center justify-end gap-2 border-t border-border px-[22px] py-3.5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={cn(
            "rounded-md bg-cashport-green px-3 py-1.5 text-[12.5px] font-bold text-cashport-black transition-colors hover:bg-cashport-green/90"
          )}
        >
          {BOTONES[mode]}
        </button>
      </div>
    </div>
  );
}

/** Alta/edición de una novedad y su vínculo con facturas, como panel lateral.
 *  TODO: reemplazar los mocks y el `console.log` de envío por los endpoints reales. */
export default function ModalCreateUpdateNoveltyAndLinkInvoices({
  mode,
  onClose
}: ModalCreateUpdateNoveltyAndLinkInvoicesProps) {
  const { resolvedTheme } = useWalletTheme();

  return (
    <Drawer
      open={!!mode}
      onClose={onClose}
      placement="right"
      closable={false}
      destroyOnClose
      width={560}
      // El drawer vive en un portal fuera de .wallet-scope y del contenedor .dark,
      // así que el tema se re-declara aquí, igual que en GroupDetailModal.
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 } }}
    >
      {mode && <DrawerBody key={mode} mode={mode} onClose={onClose} />}
    </Drawer>
  );
}
