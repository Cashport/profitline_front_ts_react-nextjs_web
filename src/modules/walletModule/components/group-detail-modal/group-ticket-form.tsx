"use client";

import { useState } from "react";
import { DatePicker, Input, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useProjectUsers } from "@/hooks/useProjectUsers";
import type { ICreateIncidentActionBody } from "@/types/novelties/INovelties";

interface GroupTicketFormProps {
  /** Responsable propuesto: el asignado de la novedad. Sin él, la acción queda para quien la crea. */
  defaultAssignedTo?: number | null;
  onCancel: () => void;
  /** Resuelve true si la acción quedó creada; el padre cierra el formulario. */
  onCreate: (body: ICreateIncidentActionBody) => Promise<boolean>;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-[11.5px] font-semibold text-muted-foreground">{children}</label>
);

/** Alta de una acción (ticket) de la novedad: POST /invoice/incident/:id/actions. */
export default function GroupTicketForm({
  defaultAssignedTo,
  onCancel,
  onCreate
}: GroupTicketFormProps) {
  const { users, isLoading: isLoadingUsers } = useProjectUsers();

  const [assignedTo, setAssignedTo] = useState<number | undefined>(defaultAssignedTo ?? undefined);
  const [deadline, setDeadline] = useState<Dayjs>(dayjs().add(5, "day"));
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Si falló, el formulario conserva lo escrito para reintentar; si quedó
  // creada, el padre lo desmonta.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = titulo.trim();
    if (!title || isSending) return;

    setIsSending(true);
    try {
      await onCreate({
        title,
        description: descripcion.trim() || undefined,
        assigned_to: assignedTo,
        due_date: deadline.format("YYYY-MM-DD")
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-border px-[18px] pb-4 pt-3.5">
      <h4 className="mb-[11px] text-[11px] font-semibold text-muted-foreground">
        Nuevo ticket
      </h4>

      <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2.5">
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
              placeholder="Quien crea la acción"
            />
          </div>
          <div>
            <Label>Fecha límite</Label>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              value={deadline}
              disabled={isSending}
              onChange={(d) => d && setDeadline(d)}
            />
          </div>
        </div>

        <div>
          <Label>Acción</Label>
          <Input
            value={titulo}
            disabled={isSending}
            placeholder="Ej.: recibir acta de la transportadora"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <Label>
            Comentario <span className="font-normal opacity-70">opcional</span>
          </Label>
          <Input.TextArea
            rows={2}
            value={descripcion}
            disabled={isSending}
            placeholder="Contexto para quien lo resuelve"
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isSending}
            onClick={onCancel}
            className="rounded-md border border-border bg-card px-2.5 py-[3px] text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSending || !titulo.trim()}
            className="rounded-md bg-cashport-green px-2.5 py-[3px] text-[11.5px] font-bold text-cashport-black transition-colors hover:bg-cashport-green/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSending ? "Creando…" : "Crear ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
