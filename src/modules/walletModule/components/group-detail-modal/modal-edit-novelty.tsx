"use client";

import { useState } from "react";
import { Select } from "antd";

import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { useProjectUsers } from "@/hooks/useProjectUsers";
import type { IIncidentDetail } from "@/hooks/useNoveltyDetail";
import type { IUpdateIncidentBody } from "@/types/novelties/INovelties";
import { parseApiDate } from "../../utils/api-adapter";
import { corto, fac, fmtD, fmtFull } from "../../utils/format";
import NoveltyDrawer, { Label, NoveltyPanel, SectionTitle } from "./novelty-drawer";
import type { IWalletGroupDetail } from "../../types";

interface ModalEditNoveltyProps {
  open: boolean;
  detail: IWalletGroupDetail;
  incident: IIncidentDetail;
  onClose: () => void;
  /** Resuelve true si los cambios quedaron guardados; el padre cierra el panel. */
  onSave: (body: IUpdateIncidentBody) => Promise<boolean>;
}

/** Un dato de sólo lectura del bloque "No editable desde aquí". */
const ReadOnly = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <Label>{label}</Label>
    <p className="truncate text-[12.5px] font-semibold text-foreground" title={value}>
      {value}
    </p>
  </div>
);

const fecha = (value: string | null | undefined): string => {
  const d = parseApiDate(value);
  return d ? fmtD(d) : "—";
};

/** Edición de tipo y responsable de la novedad: PUT /invoice/incident/:id. */
function EditNoveltyForm({
  detail,
  incident,
  onClose,
  onSave
}: Omit<ModalEditNoveltyProps, "open">) {
  const { data: motives, isLoading: isLoadingMotives } = useInvoiceIncidentMotives();
  const { users, isLoading: isLoadingUsers } = useProjectUsers();

  // El detalle del incidente no trae el id del motivo, sólo su nombre: el
  // valor inicial se resuelve contra el catálogo cuando éste llega, por eso
  // el estado guarda sólo lo que el usuario cambió. Si el motivo ya no está
  // en el catálogo (inactivo), su nombre queda de placeholder y se puede
  // guardar sin elegir otro: sin motive_id, el PUT conserva el tipo.
  const tipos = motives ?? [];
  const motiveInicial = tipos.find((t) => t.name === incident.incident_name)?.id;
  const assignedInicial = incident.assigned_to ?? undefined;

  const [motiveElegido, setMotiveElegido] = useState<number>();
  const [assignedTo, setAssignedTo] = useState<number | undefined>(assignedInicial);
  const [isSending, setIsSending] = useState(false);

  const motiveId = motiveElegido ?? motiveInicial;
  const hayCambios = motiveId !== motiveInicial || assignedTo !== assignedInicial;

  const handleSubmit = async () => {
    if (!hayCambios || isSending) return;
    setIsSending(true);
    try {
      await onSave({ motive_id: motiveId, assigned_to: assignedTo ?? null });
    } finally {
      setIsSending(false);
    }
  };

  const nov = detail.novedad;

  return (
    <NoveltyPanel
      title="Editar novedad"
      subtitle={`${nov?.id ?? `NOV-${incident.incident_id}`} · ${corto(detail.cliente.nombre)} · ${fac(detail.totalFacturas)}`}
      onClose={onClose}
      submitLabel="Guardar cambios"
      sendingLabel="Guardando…"
      onSubmit={handleSubmit}
      isSending={isSending}
      submitDisabled={!hayCambios}
    >
      <div>
        <SectionTitle>Datos editables</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label>Tipo de novedad</Label>
            <Select
              className="w-full"
              value={motiveId}
              options={tipos.map((t) => ({ value: t.id, label: t.name, title: t.description }))}
              onChange={setMotiveElegido}
              showSearch
              optionFilterProp="label"
              loading={isLoadingMotives}
              disabled={isSending}
              placeholder={incident.incident_name}
            />
          </div>
          <div>
            <Label>Responsable</Label>
            <Select
              className="w-full"
              value={assignedTo}
              options={users.map((u) => ({ value: u.id, label: u.user_name }))}
              onChange={setAssignedTo}
              allowClear
              showSearch
              optionFilterProp="label"
              loading={isLoadingUsers}
              disabled={isSending}
              placeholder="Sin responsable"
            />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>No editable desde aquí</SectionTitle>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <ReadOnly label="Cliente" value={corto(detail.cliente.nombre)} />
          <ReadOnly label="Monto agrupado" value={fmtFull(incident.actual_amount)} />
          <ReadOnly label="Creada" value={fecha(incident.date)} />
          <ReadOnly label="Fecha de compromiso" value={fecha(incident.next_ticket_date)} />
          <ReadOnly label="Fecha límite de solución" value={fecha(incident.limit_date)} />
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Las fechas no se editan a mano: el compromiso se mueve al cerrar el ticket en curso y la
          fecha límite se fija al crear la novedad. El cambio queda registrado en la línea de tiempo
          del grupo.
        </p>
      </div>
    </NoveltyPanel>
  );
}

export default function ModalEditNovelty({ open, onClose, ...form }: ModalEditNoveltyProps) {
  return (
    <NoveltyDrawer open={open} onClose={onClose}>
      <EditNoveltyForm onClose={onClose} {...form} />
    </NoveltyDrawer>
  );
}
