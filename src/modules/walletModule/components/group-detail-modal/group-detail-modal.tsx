"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import { Search } from "lucide-react";

import { cn } from "@/utils/utils";
import { HOY } from "../../utils/format";
import { WALLET_GROUP_DETAILS } from "../../mocked-data";
import { useWalletTheme } from "../../contexts/wallet-theme-context";
import GroupComposer from "./group-composer";
import GroupDetailRail from "./group-detail-rail";
import GroupInvoicesTable from "./group-invoices-table";
import GroupModalHeader from "./group-modal-header";
import GroupTicketForm from "./group-ticket-form";
import GroupTicketsSection from "./group-tickets-section";
import GroupTimeline from "./group-timeline";
import type {
  IWalletAttachment,
  IWalletGroupDetail,
  IWalletTicket,
  IWalletTimelineEntry
} from "../../types";

interface GroupDetailModalProps {
  /** Clave del grupo abierto; null cierra el modal. */
  clave: string | null;
  onClose: () => void;
}

type Tab = "gestion" | "facturas";

const TabButton = ({
  active,
  count,
  onClick,
  children
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-1 pb-3 pt-3.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground",
      active && "border-wallet-nov text-foreground"
    )}
  >
    {children}
    <span
      className={cn(
        "rounded-full px-1.5 text-[10.5px] font-bold leading-[17px] tabular-nums",
        active ? "bg-wallet-nov/15 text-wallet-nov" : "bg-muted text-muted-foreground"
      )}
    >
      {count}
    </span>
  </button>
);

/** Contenido del modal. Va en su propio componente y con `key` por grupo para
 *  que el estado local (comentarios, tickets, selección) nazca limpio. */
function GroupDetailBody({ detail, onClose }: { detail: IWalletGroupDetail; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("gestion");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bitacora, setBitacora] = useState<IWalletTimelineEntry[]>(detail.bitacora);
  const [tickets, setTickets] = useState<IWalletTicket[]>(detail.tickets);
  const [ticketForm, setTicketForm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // El seguimiento se lee de abajo hacia arriba: lo último siempre a la vista.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [tab, bitacora]);

  /** Autor de lo que se registre: el dueño de la novedad o el ejecutivo. */
  const autor = detail.novedad?.responsable ?? detail.ejecutivo;

  const nextTicketId = useMemo(() => {
    const nums = tickets.map((t) => Number(t.id.replace(/\D/g, "")) || 0);
    return () => `TK-${Math.max(4400, ...nums) + 1 + nextId.current}`;
  }, [tickets]);

  // TODO: estas tres acciones son locales; al conectar el API pasan a mutaciones.
  const addEntry = (entry: Omit<IWalletTimelineEntry, "id">) => {
    nextId.current += 1;
    setBitacora((prev) => [...prev, { ...entry, id: `local-${nextId.current}` }]);
  };

  const registrarComentario = (texto: string, adjuntos: IWalletAttachment[]) => {
    addEntry({
      fecha: HOY,
      autor,
      tipo: adjuntos.length ? "adjunto" : "comentario",
      texto:
        texto ||
        (adjuntos.length === 1 ? "Adjuntó un soporte." : `Adjuntó ${adjuntos.length} soportes.`),
      adjuntos: adjuntos.length ? adjuntos : undefined
    });
  };

  const crearTicket = (data: Omit<IWalletTicket, "id" | "estado">) => {
    const id = nextTicketId();
    setTickets((prev) => [...prev, { ...data, id, estado: "abierto" }]);
    addEntry({ fecha: HOY, autor, tipo: "ticket", texto: data.titulo, ticketId: id });
    setTicketForm(false);
  };

  const resolverTicket = (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: "resuelto", resueltoEl: HOY } : t))
    );
    addEntry({
      fecha: HOY,
      autor,
      tipo: "ticket_ok",
      texto: `Resolvió: ${ticket?.titulo ?? id}`
    });
  };

  return (
    <div className="wallet-scope flex h-[min(88vh,900px)] flex-col bg-card text-foreground">
      <GroupModalHeader detail={detail} onClose={onClose} />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[512px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-muted/40 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-auto">
            <GroupDetailRail detail={detail} />
            {ticketForm && (
              <GroupTicketForm
                defaultResponsable={autor}
                onCancel={() => setTicketForm(false)}
                onCreate={crearTicket}
              />
            )}
            <GroupTicketsSection
              tickets={tickets}
              creando={ticketForm}
              onNew={() => setTicketForm(true)}
              onResolve={resolverTicket}
            />
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex flex-none items-center gap-[18px] border-b border-border px-5">
            <TabButton
              active={tab === "gestion"}
              count={bitacora.length}
              onClick={() => setTab("gestion")}
            >
              Seguimiento
            </TabButton>
            <TabButton
              active={tab === "facturas"}
              count={detail.facturas.length}
              onClick={() => setTab("facturas")}
            >
              Facturas
            </TabButton>

            {tab === "facturas" && (
              <label className="ml-auto flex min-w-[160px] max-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  placeholder="Buscar factura…"
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
            )}
          </div>

          {tab === "facturas" ? (
            <GroupInvoicesTable
              invoices={detail.facturas}
              query={query}
              selected={selected}
              onSelectedChange={setSelected}
            />
          ) : (
            <>
              <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-auto">
                <div className="mt-auto w-full px-[22px] pb-2.5 pt-[22px]">
                  <GroupTimeline entries={bitacora} tickets={tickets} />
                </div>
              </div>
              <GroupComposer onSubmit={registrarComentario} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Modal de gestión de un grupo de facturas. */
export default function GroupDetailModal({ clave, onClose }: GroupDetailModalProps) {
  const { resolvedTheme } = useWalletTheme();
  const detail = clave ? WALLET_GROUP_DETAILS[clave] : undefined;

  return (
    <Modal
      open={!!detail}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      centered
      destroyOnClose
      width="min(1320px, 95vw)"
      // El modal vive en un portal fuera de .wallet-scope y del contenedor .dark,
      // así que el tema se re-declara aquí: `dark` en la raíz y `wallet-scope`
      // en el cuerpo, porque el token block es `.dark .wallet-scope`.
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: "hidden" } }}
    >
      {detail && <GroupDetailBody key={detail.clave} detail={detail} onClose={onClose} />}
    </Modal>
  );
}
