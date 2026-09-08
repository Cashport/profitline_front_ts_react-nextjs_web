"use client";

import { useRef, useState } from "react";
import { DatePicker, Select } from "antd";
import { Paperclip } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

import { CATEGORIAS } from "../../constants";
import { HOY, dias } from "../../utils/format";
import { WALLET_PEOPLE } from "../../mocked-data";
import AttachmentList from "../shared/attachment-list";
import type { IWalletAttachment, IWalletPerson, IWalletTicket } from "../../types";

interface GroupTicketFormProps {
  /** Responsable propuesto: el dueño de la novedad o el ejecutivo del cliente. */
  defaultResponsable: IWalletPerson;
  onCancel: () => void;
  onCreate: (ticket: Omit<IWalletTicket, "id" | "estado">) => void;
}

const PERSONAS = Object.values(WALLET_PEOPLE);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-[11.5px] font-semibold text-muted-foreground">{children}</label>
);

const inputClass =
  "w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30";

/** Alta de un ticket. TODO: enviar al endpoint de acciones en vez de al estado local. */
export default function GroupTicketForm({
  defaultResponsable,
  onCancel,
  onCreate
}: GroupTicketFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [categoria, setCategoria] = useState(CATEGORIAS[0].value);
  const [responsable, setResponsable] = useState(defaultResponsable.id);
  const [deadline, setDeadline] = useState<Dayjs>(dayjs(dias(HOY, 5)));
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [adjuntos, setAdjuntos] = useState<IWalletAttachment[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onCreate({
      titulo: titulo.trim(),
      comentario: comentario.trim() || undefined,
      categoria: CATEGORIAS.find((c) => c.value === categoria)?.label,
      responsable: WALLET_PEOPLE[responsable] ?? defaultResponsable,
      deadline: deadline.toDate(),
      adjuntos: adjuntos.length ? adjuntos : undefined
    });
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setAdjuntos((prev) => [
        ...prev,
        ...files.map((f) => ({
          nombre: f.name,
          peso: `${Math.max(1, Math.round(f.size / 1024))} KB`
        }))
      ]);
    }
    e.target.value = "";
  };

  return (
    <div className="border-t border-border px-[18px] pb-4 pt-3.5">
      <h4 className="mb-[11px] text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        Nuevo ticket
      </h4>

      <form className="flex flex-col gap-2.5" onSubmit={submit}>
        <div>
          <Label>Tipo de ticket</Label>
          <Select
            className="w-full"
            value={categoria}
            options={CATEGORIAS}
            onChange={setCategoria}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label>Responsable</Label>
            <Select
              className="w-full"
              value={responsable}
              options={PERSONAS.map((p) => ({ value: p.id, label: p.nombre }))}
              onChange={setResponsable}
            />
          </div>
          <div>
            <Label>Fecha límite</Label>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              value={deadline}
              onChange={(d) => d && setDeadline(d)}
            />
          </div>
        </div>

        <div>
          <Label>Acción</Label>
          <input
            className={inputClass}
            value={titulo}
            placeholder="Ej.: recibir acta de la transportadora"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <Label>
            Comentario <span className="font-normal opacity-70">opcional</span>
          </Label>
          <textarea
            className={`${inputClass} resize-y`}
            rows={2}
            value={comentario}
            placeholder="Contexto para quien lo resuelve"
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        <AttachmentList
          items={adjuntos}
          onRemove={(i) => setAdjuntos((prev) => prev.filter((_, k) => k !== i))}
        />

        <div className="flex items-center gap-2">
          <input type="file" ref={fileRef} multiple className="hidden" onChange={addFiles} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-[3px] text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Adjuntar
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="ml-auto rounded-md border border-border bg-card px-2.5 py-[3px] text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!titulo.trim()}
            className="rounded-md bg-primary px-2.5 py-[3px] text-[11.5px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Crear ticket
          </button>
        </div>
      </form>
    </div>
  );
}
