"use client";

import { useEffect, useState } from "react";
import { Input, Pagination } from "antd";
import { Search } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { getNotificationsByClient } from "@/services/notifications/notification";
import type { INotificationByClient } from "@/types/notifications/INotifications";
import { fac, fmtFull } from "../../utils/format";
import NoveltyDocumentsTable from "./novelty-documents-table";
import NoveltyDrawer, { NoveltyPanel, SectionTitle } from "./novelty-drawer";
import type { IWalletDocument } from "../../types";

interface ModalLinkNoveltyProps {
  open: boolean;
  clienteNombre: string;
  /** Id del cliente que reciben los endpoints de notificaciones (client_id del incidente). */
  clienteNit: string;
  /** Facturas y saldos marcados en la pestaña "Facturas". */
  documentos: IWalletDocument[];
  onClose: () => void;
}

const NOVEDADES_PAGE_SIZE = 5;

/** Vínculo de los documentos seleccionados a una novedad abierta del cliente
 *  (GET /notification/project/:project_id/client/:client_id).
 *  TODO: reemplazar el `console.log` de envío por el endpoint real. */
function LinkNoveltyForm({
  clienteNombre,
  clienteNit,
  documentos,
  onClose
}: Omit<ModalLinkNoveltyProps, "open">) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const [novedades, setNovedades] = useState<INotificationByClient[]>([]);
  const [isLoadingNovedades, setIsLoadingNovedades] = useState(true);
  // `incident_id` de la novedad marcada; sin datos no hay nada que vincular.
  const [novedadExistente, setNovedadExistente] = useState<number>();
  const [comentario, setComentario] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [novedadesPage, setNovedadesPage] = useState(1);

  // El drawer desmonta el formulario al cerrar, así que se pide una vez por apertura.
  useEffect(() => {
    const fetchNovedades = async () => {
      setIsLoadingNovedades(true);
      try {
        const data = await getNotificationsByClient(projectId, clienteNit);
        setNovedades(data);
        setNovedadExistente(data[0]?.incident_id ?? undefined);
      } catch {
        showMessage("error", "No se pudieron cargar las novedades del cliente");
      } finally {
        setIsLoadingNovedades(false);
      }
    };
    fetchNovedades();
  }, [projectId, clienteNit]);

  const q = busqueda.trim().toLowerCase();
  const novedadesFiltradas = q
    ? novedades.filter(
        (n) => n.id_erp?.toLowerCase().includes(q) || n.incident_motive?.toLowerCase().includes(q)
      )
    : novedades;

  const novedadesVisibles = novedadesFiltradas.slice(
    (novedadesPage - 1) * NOVEDADES_PAGE_SIZE,
    novedadesPage * NOVEDADES_PAGE_SIZE
  );

  const handleSearchChange = (value: string) => {
    setBusqueda(value);
    setNovedadesPage(1);
  };

  const total = documentos.reduce((sum, d) => sum + d.saldo, 0);

  const handleSubmit = () => {
    const novedad = novedades.find((n) => n.incident_id === novedadExistente);
    console.log("Vincular novedad", { novedad, documentos, comentario });
    onClose();
  };

  return (
    <NoveltyPanel
      title="Vincular a una novedad existente"
      subtitle={`${fac(documentos.length)} · ${fmtFull(total)} · ${clienteNombre}`}
      onClose={onClose}
      submitLabel="Vincular facturas"
      sendingLabel="Vinculando…"
      onSubmit={handleSubmit}
      submitDisabled={documentos.length === 0 || novedadExistente === undefined}
    >
      <div>
        <SectionTitle>Novedades abiertas de este cliente</SectionTitle>
        {!isLoadingNovedades && novedades.length > 0 && (
          <label className="mb-2 flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={busqueda}
              placeholder="Buscar por documento o motivo…"
              onChange={(e) => handleSearchChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        )}
        <div className="overflow-hidden rounded-md border border-border">
          {isLoadingNovedades ? (
            <div className="px-3 py-2.5 text-[12.5px] text-muted-foreground">
              Cargando novedades…
            </div>
          ) : novedades.length === 0 ? (
            <div className="px-3 py-2.5 text-[12.5px] text-muted-foreground">
              Sin novedades abiertas para este cliente
            </div>
          ) : novedadesFiltradas.length === 0 ? (
            <div className="px-3 py-2.5 text-[12.5px] text-muted-foreground">
              Sin novedades que coincidan con la búsqueda
            </div>
          ) : (
            novedadesVisibles.map((n) => (
              <div
                key={n.id}
                onClick={() => setNovedadExistente(n.incident_id ?? undefined)}
                className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 text-[12.5px] transition-colors last:border-b-0 hover:bg-secondary"
              >
                <input
                  type="radio"
                  name="novedad-existente"
                  aria-label={`Seleccionar ${n.id_erp ?? n.incident_motive ?? n.notification_type_name}`}
                  className="accent-wallet-accent"
                  checked={novedadExistente === n.incident_id}
                  onChange={() => setNovedadExistente(n.incident_id ?? undefined)}
                />
                <span className="font-mono font-semibold text-foreground">{n.id_erp}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {n.incident_motive || n.notification_type_name}
                </span>
                <span className="whitespace-nowrap text-muted-foreground">{n.days}</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-2.5 flex justify-end">
          <Pagination
            current={novedadesPage}
            pageSize={NOVEDADES_PAGE_SIZE}
            total={novedadesFiltradas.length}
            onChange={setNovedadesPage}
            showSizeChanger={false}
            hideOnSinglePage
            size="small"
          />
        </div>
      </div>

      <div>
        <SectionTitle>Facturas incluidas</SectionTitle>
        <NoveltyDocumentsTable documentos={documentos} />
      </div>

      <div>
        <SectionTitle>Comentario</SectionTitle>
        <Input.TextArea
          rows={2}
          value={comentario}
          placeholder="Ej.: el cliente pide el soporte firmado antes del viernes"
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>
    </NoveltyPanel>
  );
}

export default function ModalLinkNovelty({ open, onClose, ...form }: ModalLinkNoveltyProps) {
  return (
    <NoveltyDrawer open={open} onClose={onClose}>
      <LinkNoveltyForm onClose={onClose} {...form} />
    </NoveltyDrawer>
  );
}
