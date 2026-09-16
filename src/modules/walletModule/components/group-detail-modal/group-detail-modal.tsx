"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "antd";
import { Search, X } from "lucide-react";

import { cn } from "@/utils/utils";
import { ApiError } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import ProfitLoader from "@/components/ui/profit-loader";
import { useIncidentDetail } from "@/hooks/useNoveltyDetail";
import { useIncidentActions } from "@/hooks/useIncidentActions";
import {
  addIncidentComment,
  createIncident,
  createIncidentAction,
  resolveIncidentAction,
  updateIncident,
  updateIncidentStatus
} from "@/services/resolveNovelty/resolveNovelty";
import { useMessageApi } from "@/context/MessageContext";
import type { ICreateIncidentActionBody, IUpdateIncidentBody } from "@/types/novelties/INovelties";
import { toIncidentGroupDetail, toTickets, toTimelineEntries } from "../../utils/api-adapter";
import { useWalletTheme } from "../../contexts/wallet-theme-context";
import GroupComposer from "./group-composer";
import GroupDetailRail from "./group-detail-rail";
import GroupInvoicesTable from "./group-invoices-table";
import GroupModalHeader from "./group-modal-header";
import GroupTicketForm from "./group-ticket-form";
import GroupTicketsSection from "./group-tickets-section";
import GroupTimeline from "./group-timeline";
import ModalCreateNovelty, { CreateNoveltyBody } from "./modal-create-novelty";
import ModalEditNovelty from "./modal-edit-novelty";
import ModalLinkNovelty from "./modal-link-novelty";
import type { NoveltyModalMode } from "./novelty-drawer";
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
 *  que el estado local (pestaña, selección, formulario) nazca limpio. */
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
  const { showMessage, messageApi } = useMessageApi();
  const [tab, setTab] = useState<Tab>("gestion");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [ticketForm, setTicketForm] = useState(false);
  const [noveltyModal, setNoveltyModal] = useState<NoveltyModalMode | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Con `incidentId` el incidente es la fuente de verdad del modal (cabecera,
  // cifras, facturas, seguimiento y acciones). Sin él (grupo de cartera sin
  // novedad) los hooks no piden nada, se muestra la fila y seguimiento y
  // acciones quedan deshabilitados: no hay dónde leer ni publicar.
  const {
    data: incidentData,
    error: incidentError,
    isLoading: isLoadingIncident,
    mutate: mutateIncident
  } = useIncidentDetail({ incidentId });
  const incident = incidentData?.[0];

  const {
    data: actions,
    error: actionsError,
    isLoading: isLoadingActions,
    mutate: mutateActions
  } = useIncidentActions({ incidentId });

  const detail = useMemo(
    () => (incident ? toIncidentGroupDetail(incident, base) : base),
    [incident, base]
  );
  const bitacora = useMemo(() => (incident ? toTimelineEntries(incident) : []), [incident]);
  const tickets = useMemo(() => toTickets(actions), [actions]);
  const documentosSeleccionados = useMemo(
    () => (detail?.documentos ?? []).filter((d) => selected.includes(d.id)),
    [detail, selected]
  );

  // El seguimiento se lee de abajo hacia arriba: lo último siempre a la vista.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [tab, bitacora]);

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

  // Crear o resolver una acción mueve el compromiso y la última gestión de la
  // novedad, así que se releen las acciones y el incidente.
  const handleCreateTicket = async (body: ICreateIncidentActionBody): Promise<boolean> => {
    if (!incidentId) return false;
    try {
      await createIncidentAction(incidentId, body);
      await Promise.all([mutateActions(), mutateIncident()]);
      showMessage("success", "Acción creada");
      setTicketForm(false);
      return true;
    } catch {
      showMessage("error", "No se pudo crear la acción");
      return false;
    }
  };

  const handleResolveTicket = async (ticket: IWalletTicket, comment?: string): Promise<boolean> => {
    if (!incidentId) return false;
    try {
      await resolveIncidentAction(incidentId, ticket.actionId, { resolution_comment: comment });
      await Promise.all([mutateActions(), mutateIncident()]);
      showMessage("success", "Acción resuelta");
      return true;
    } catch {
      showMessage("error", "No se pudo resolver la acción");
      return false;
    }
  };

  // El cambio de estado queda en el historial de la novedad, así que se relee
  // el incidente (cabecera y seguimiento). Si el backend explica por qué no se
  // pudo (ApiError), se muestra su mensaje.
  const handleChangeNoveltyStatus = async (statusId: number): Promise<boolean> => {
    if (!incidentId) return false;
    // El menú se cierra al elegir el estado: el loader es el único feedback
    // hasta que llega la respuesta. Va por el messageApi del contexto (no el
    // estático de antd) para que herede el tema claro/oscuro del módulo.
    const hide = messageApi.open({ type: "loading", content: "Cambiando estado…", duration: 0 });
    try {
      await updateIncidentStatus(incidentId, { novelty_status_id: statusId });
      await mutateIncident();
      showMessage("success", "Estado actualizado");
      return true;
    } catch (error) {
      showMessage(
        "error",
        error instanceof ApiError && error.message ? error.message : "No se pudo cambiar el estado"
      );
      return false;
    } finally {
      hide();
    }
  };

  // La novedad nueva se crea sobre el cliente del incidente abierto (la
  // selección sólo existe cuando hay incidente). Al quedar creada se relee el
  // incidente —los documentos pueden haberse movido— y se suelta la selección.
  const handleCreateNovelty = async (body: CreateNoveltyBody): Promise<boolean> => {
    const clientUuid = incident?.client_uuid;
    if (!clientUuid) {
      showMessage("error", "No se pudo identificar el cliente de la novedad");
      return false;
    }
    try {
      await createIncident(clientUuid, body);
      await mutateIncident();
      setSelected([]);
      setNoveltyModal(null);
      showMessage("success", "Novedad creada");
      return true;
    } catch (error) {
      showMessage(
        "error",
        error instanceof ApiError && error.message ? error.message : "No se pudo crear la novedad"
      );
      return false;
    }
  };

  // Tipo y responsable salen en cabecera y panel izquierdo: se relee el incidente.
  const handleEditNovelty = async (body: IUpdateIncidentBody): Promise<boolean> => {
    if (!incidentId) return false;
    try {
      await updateIncident(incidentId, body);
      await mutateIncident();
      setNoveltyModal(null);
      showMessage("success", "Novedad actualizada");
      return true;
    } catch (error) {
      showMessage(
        "error",
        error instanceof ApiError && error.message
          ? error.message
          : "No se pudo actualizar la novedad"
      );
      return false;
    }
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

  return (
    <div className="wallet-scope flex h-[min(88vh,900px)] flex-col bg-card text-foreground">
      <GroupModalHeader
        detail={detail}
        onClose={onClose}
        seleccionadas={selected.length}
        onChangeStatus={handleChangeNoveltyStatus}
        onOpenNoveltyModal={setNoveltyModal}
      />

      <ModalCreateNovelty
        open={noveltyModal === "crear"}
        clienteNombre={detail.cliente.nombre}
        documentos={documentosSeleccionados}
        defaultAssignedTo={incident?.assigned_to}
        onClose={() => setNoveltyModal(null)}
        onCreate={handleCreateNovelty}
      />
      {/* Editar necesita el incidente cargado: de él salen los valores iniciales. */}
      {incident && (
        <ModalEditNovelty
          open={noveltyModal === "editar"}
          detail={detail}
          incident={incident}
          onClose={() => setNoveltyModal(null)}
          onSave={handleEditNovelty}
        />
      )}
      <ModalLinkNovelty
        open={noveltyModal === "vincular"}
        clienteNombre={detail.cliente.nombre}
        documentos={documentosSeleccionados}
        onClose={() => setNoveltyModal(null)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[512px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-border bg-muted/40 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-auto">
            <GroupDetailRail detail={detail} />
            {/* Las acciones cuelgan de la novedad: un grupo de cartera sin
                novedad no tiene dónde leerlas ni crearlas. */}
            {!!incidentId && (
              <>
                {ticketForm && (
                  <GroupTicketForm
                    defaultAssignedTo={incident?.assigned_to}
                    onCancel={() => setTicketForm(false)}
                    onCreate={handleCreateTicket}
                  />
                )}
                <GroupTicketsSection
                  tickets={tickets}
                  creando={ticketForm}
                  loading={isLoadingActions}
                  error={
                    actionsError
                      ? (actionsError as Error).message || "No se pudieron cargar las acciones."
                      : undefined
                  }
                  onNew={() => setTicketForm(true)}
                  onResolve={handleResolveTicket}
                />
              </>
            )}
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
