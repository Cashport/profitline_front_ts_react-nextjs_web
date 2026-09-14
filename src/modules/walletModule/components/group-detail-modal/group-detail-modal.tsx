"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import { Search, X } from "lucide-react";

import { cn } from "@/utils/utils";
import ProfitLoader from "@/components/ui/profit-loader";
import { useIncidentDetail } from "@/hooks/useNoveltyDetail";
import { addIncidentComment } from "@/services/resolveNovelty/resolveNovelty";
import { useMessageApi } from "@/context/MessageContext";
import { HOY } from "../../utils/format";
import { toIncidentGroupDetail, toTimelineEntries } from "../../utils/api-adapter";
import { useWalletTheme } from "../../contexts/wallet-theme-context";
import GroupComposer from "./group-composer";
import GroupDetailRail from "./group-detail-rail";
import GroupInvoicesTable from "./group-invoices-table";
import GroupModalHeader from "./group-modal-header";
import GroupTicketForm from "./group-ticket-form";
import GroupTicketsSection from "./group-tickets-section";
import GroupTimeline from "./group-timeline";
import type { IWalletGroupDetail, IWalletTicket } from "../../types";

interface GroupDetailModalProps {
  /**
   * Grupo abierto desde cartera. Si es una novedad, el modal la pide al API y
   * la fila sólo aporta el reparto por tramo. Sin `detail` ni `incidentId` el
   * modal está cerrado.
   */
  detail?: IWalletGroupDetail | null;
  /** Novedad abierta desde la bandeja: todo sale de /invoice/incident-detail. */
  incidentId?: number | null;
  onClose: () => void;
}

type Tab = "gestion" | "facturas";

const TabButton = ({
  active,
  count,
  onClick,
  disabled,
  children
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={disabled ? "Próximamente" : undefined}
    className={cn(
      "-mb-px inline-flex items-center gap-1.5 border-b-2 border-transparent px-1 pb-3 pt-3.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground",
      active && "border-cashport-green text-foreground",
      disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
    )}
  >
    {children}
    <span
      className={cn(
        "rounded-full px-1.5 text-[10.5px] font-bold leading-[17px] tabular-nums",
        active ? "bg-cashport-green text-cashport-black" : "bg-muted text-muted-foreground"
      )}
    >
      {count}
    </span>
  </button>
);

/** Cierre para los estados sin cabecera (cargando / error). */
const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    type="button"
    aria-label="Cerrar"
    onClick={onClose}
    className="absolute right-[22px] top-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  >
    <X className="h-4 w-4" />
  </button>
);

/** Contenido del modal. Va en su propio componente y con `key` por grupo para
 *  que el estado local (tickets, selección) nazca limpio. */
function GroupDetailBody({
  base,
  incidentId,
  onClose
}: {
  /** Detalle armado desde la fila de cartera; null cuando se abre desde la bandeja. */
  base: IWalletGroupDetail | null;
  incidentId?: number;
  onClose: () => void;
}) {
  const { showMessage } = useMessageApi();
  const [tab, setTab] = useState<Tab>("gestion");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [tickets, setTickets] = useState<IWalletTicket[]>(base?.tickets ?? []);
  const [ticketForm, setTicketForm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Con `incidentId` el incidente es la fuente de verdad del modal (cabecera,
  // cifras, facturas y seguimiento). Sin él (grupo de cartera sin novedad) el
  // hook no pide nada, se muestra la fila y el seguimiento queda deshabilitado:
  // no hay dónde leer ni publicar.
  const {
    data: incidentData,
    error: incidentError,
    isLoading: isLoadingIncident,
    mutate: mutateIncident
  } = useIncidentDetail({ incidentId });
  const incident = incidentData?.[0];

  const detail = useMemo(
    () => (incident ? toIncidentGroupDetail(incident, base) : base),
    [incident, base]
  );
  const bitacora = useMemo(() => (incident ? toTimelineEntries(incident) : []), [incident]);

  // El seguimiento se lee de abajo hacia arriba: lo último siempre a la vista.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [tab, bitacora]);

  const nextTicketId = useMemo(() => {
    const nums = tickets.map((t) => Number(t.id.replace(/\D/g, "")) || 0);
    return () => `TK-${Math.max(4400, ...nums) + 1 + nextId.current}`;
  }, [tickets]);

  // El comentario se publica sobre el incidente y el seguimiento se relee del
  // API: la bitácora nunca se arma en el navegador. Devuelve si quedó
  // registrado para que el composer conserve texto y adjuntos si falló.
  const handleRegisterNoveltyComment = async (comment: string, files: File[]): Promise<boolean> => {
    if (!incidentId) return false;
    try {
      await addIncidentComment(incidentId, { comments: comment, files });
      await mutateIncident();
      showMessage("success", "Comentario registrado");
      return true;
    } catch {
      showMessage("error", "No se pudo registrar el comentario");
      return false;
    }
  };

  // TODO: los tickets son locales; al conectar su API pasan a mutaciones.
  const handleCreateTicket = (data: Omit<IWalletTicket, "id" | "estado">) => {
    nextId.current += 1;
    setTickets((prev) => [...prev, { ...data, id: nextTicketId(), estado: "abierto" }]);
    setTicketForm(false);
  };

  const handleResolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: "resuelto", resueltoEl: HOY } : t))
    );
  };

  // Abierto desde la bandeja no hay fila de respaldo: hasta que llegue el
  // incidente no hay nada que pintar más que el estado de carga o el error.
  if (!detail) {
    return (
      <div className="wallet-scope relative flex h-[min(88vh,900px)] flex-col items-center justify-center bg-card text-foreground">
        <CloseButton onClose={onClose} />
        {isLoadingIncident ? (
          <ProfitLoader size="small" />
        ) : (
          <p className="px-6 text-center text-[12.5px] text-destructive">
            {(incidentError as Error)?.message || "No se pudo cargar la novedad."}
          </p>
        )}
      </div>
    );
  }

  /** Autor de lo que se registre: el dueño de la novedad o el ejecutivo. */
  const autor = detail.novedad?.responsable ?? detail.ejecutivo;

  return (
    <div className="wallet-scope flex h-[min(88vh,900px)] flex-col bg-card text-foreground">
      <GroupModalHeader detail={detail} onClose={onClose} seleccionadas={selected.length} />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[512px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-muted/40 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-auto">
            <GroupDetailRail detail={detail} />
            {ticketForm && (
              <GroupTicketForm
                defaultResponsable={autor}
                onCancel={() => setTicketForm(false)}
                onCreate={handleCreateTicket}
              />
            )}
            <GroupTicketsSection
              tickets={tickets}
              creando={ticketForm}
              onNew={() => setTicketForm(true)}
              onResolve={handleResolveTicket}
            />
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex flex-none items-center gap-[18px] border-b border-border px-5">
            <TabButton
              active={tab === "gestion"}
              count={bitacora.length}
              onClick={() => setTab("gestion")}
              disabled={!incidentId}
            >
              Seguimiento
            </TabButton>
            {/* Sólo las novedades traen sus documentos (incident-detail); los
                grupos de cartera no tienen endpoint de facturas todavía. */}
            <TabButton
              active={tab === "facturas"}
              count={detail.totalFacturas}
              onClick={() => setTab("facturas")}
              disabled={!incidentId}
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

          {!incidentId ? (
            <p className="flex flex-1 items-center justify-center px-6 text-center text-[12.5px] text-muted-foreground">
              El seguimiento solo está disponible para grupos con novedad.
            </p>
          ) : tab === "facturas" ? (
            <GroupInvoicesTable
              documentos={detail.documentos}
              query={query}
              selected={selected}
              onSelectedChange={setSelected}
            />
          ) : (
            <>
              <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-auto">
                <div className="mt-auto w-full px-[22px] pb-2.5 pt-[22px]">
                  {isLoadingIncident ? (
                    <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                      Cargando seguimiento…
                    </p>
                  ) : (
                    <GroupTimeline entries={bitacora} tickets={tickets} />
                  )}
                </div>
              </div>
              <GroupComposer onSubmit={handleRegisterNoveltyComment} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Modal de gestión de un grupo de facturas / una novedad. */
export default function GroupDetailModal({ onClose, detail, incidentId }: GroupDetailModalProps) {
  const { resolvedTheme } = useWalletTheme();

  const open = !!detail || !!incidentId;
  const resolvedIncidentId = incidentId ?? detail?.novedad?.incidentId;

  return (
    <Modal
      open={open}
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
      {open && (
        <GroupDetailBody
          key={detail?.clave ?? `inc-${incidentId}`}
          base={detail ?? null}
          incidentId={resolvedIncidentId}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
