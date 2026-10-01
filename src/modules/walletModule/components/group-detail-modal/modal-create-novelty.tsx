"use client";

import { useState } from "react";
import { DatePicker, Input, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useProjectUsers } from "@/hooks/useProjectUsers";
import { useIncidentListFilters } from "@/modules/noveltiesModule/hooks/useIncidentListFilters";
import type { ICreateIncidentBody } from "@/types/novelties/INovelties";
import { fac, fmtFull } from "../../utils/format";
import NoveltyDocumentsTable from "./novelty-documents-table";
import NoveltyDrawer, { Label, NoveltyPanel, SectionTitle } from "./novelty-drawer";
import type { IWalletDocument } from "../../types";

/** Lo que arma el formulario; el `project_id` lo agrega quien lo envía. */
export type CreateNoveltyBody = Omit<ICreateIncidentBody, "project_id">;

interface ModalCreateNoveltyProps {
  open: boolean;
  clienteNombre: string;
  /** Facturas y saldos marcados en la pestaña "Facturas". */
  documentos: IWalletDocument[];
  /** Responsable propuesto: el asignado de la novedad desde la que se abre. */
  defaultAssignedTo?: number | null;
  onClose: () => void;
  /** Resuelve true si la novedad quedó creada; el padre cierra el panel. */
  onCreate: (body: CreateNoveltyBody) => Promise<boolean>;
}

/** Alta de una novedad sobre los documentos seleccionados: POST /invoice/incident/client/:uuid. */
function CreateNoveltyForm({
  clienteNombre,
  documentos,
  defaultAssignedTo,
  onClose,
  onCreate
}: Omit<ModalCreateNoveltyProps, "open">) {
  const { filters, isLoading: isLoadingFilters } = useIncidentListFilters();
  const { users, isLoading: isLoadingUsers } = useProjectUsers();

  const [motiveId, setMotiveId] = useState<number>();
  const [assignedTo, setAssignedTo] = useState<number | undefined>(defaultAssignedTo ?? undefined);
  const [firstTicketDate, setFirstTicketDate] = useState<Dayjs>(dayjs().add(5, "day"));
  const [limitDate, setLimitDate] = useState<Dayjs>(dayjs().add(30, "day"));
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const total = documentos.reduce((sum, d) => sum + d.saldo, 0);
  const canSubmit = motiveId !== undefined && documentos.length > 0;

  // Si falló, el formulario conserva lo escrito para reintentar; si quedó
  // creada, el padre cierra el panel y lo desmonta.
  const handleSubmit = async () => {
    if (!canSubmit || isSending) return;
    setIsSending(true);
    try {
      await onCreate({
        motive_id: motiveId,
        documents: documentos.map((d) => ({ document_type: d.tipo, document_id: d.documentId })),
        comments: comment.trim() || undefined,
        assigned_to: assignedTo,
        next_ticket_date: firstTicketDate.format("YYYY-MM-DD"),
        limit_date: limitDate.format("YYYY-MM-DD")
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <NoveltyPanel
      title="Nueva novedad"
      subtitle={`${fac(documentos.length)} · ${fmtFull(total)} · ${clienteNombre}`}
      onClose={onClose}
      submitLabel="Crear novedad"
      sendingLabel="Creando…"
      onSubmit={handleSubmit}
      isSending={isSending}
      submitDisabled={!canSubmit}
    >
      <div>
        <SectionTitle>Clasificación</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label>Tipo de novedad</Label>
            <Select
              className="w-full"
              value={motiveId}
              options={(filters?.novelty_type ?? []).map((t) => ({ value: t.id, label: t.name }))}
              onChange={setMotiveId}
              showSearch
              optionFilterProp="label"
              loading={isLoadingFilters}
              disabled={isSending}
              placeholder="Selecciona el tipo"
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
          <div>
            <Label>Fecha del primer ticket</Label>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              value={firstTicketDate}
              disabled={isSending}
              onChange={(d) => d && setFirstTicketDate(d)}
            />
          </div>
          <div>
            <Label>Fecha límite de solución</Label>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              value={limitDate}
              disabled={isSending}
              onChange={(d) => d && setLimitDate(d)}
            />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Comentario inicial</SectionTitle>
        <Input.TextArea
          rows={2}
          value={comment}
          disabled={isSending}
          placeholder="Ej.: el cliente pide el soporte firmado antes del viernes"
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          Queda como primera entrada en la línea de tiempo de la novedad. La próxima acción se abre
          como ticket con la fecha indicada.
        </p>
      </div>

      <div>
        <SectionTitle>Facturas incluidas</SectionTitle>
        <NoveltyDocumentsTable documentos={documentos} />
      </div>
    </NoveltyPanel>
  );
}

export default function ModalCreateNovelty({ open, onClose, ...form }: ModalCreateNoveltyProps) {
  return (
    <NoveltyDrawer open={open} onClose={onClose}>
      <CreateNoveltyForm onClose={onClose} {...form} />
    </NoveltyDrawer>
  );
}
