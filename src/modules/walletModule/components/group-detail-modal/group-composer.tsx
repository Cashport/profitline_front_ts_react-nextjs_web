"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";

import AttachmentList from "../shared/attachment-list";
import type { IWalletAttachment } from "../../types";

interface GroupComposerProps {
  onSubmit: (texto: string, adjuntos: IWalletAttachment[]) => void;
}

/** Caja de comentario del seguimiento.
 *  TODO: publicar contra el endpoint de bitácora del grupo. */
export default function GroupComposer({ onSubmit }: GroupComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [adjuntos, setAdjuntos] = useState<IWalletAttachment[]>([]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = texto.trim();
    if (!v && !adjuntos.length) return;

    onSubmit(v, adjuntos);
    setTexto("");
    setAdjuntos([]);
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
    <form
      onSubmit={enviar}
      className="flex flex-none flex-col gap-2.5 border-t border-border px-5 pb-4 pt-3.5"
    >
      <AttachmentList
        items={adjuntos}
        onRemove={(i) => setAdjuntos((prev) => prev.filter((_, k) => k !== i))}
      />

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            autoComplete="off"
            value={texto}
            placeholder="Escribe un comentario…"
            onChange={(e) => setTexto(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-2 pl-3 pr-9 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <input type="file" ref={fileRef} multiple className="hidden" onChange={addFiles} />
          <button
            type="button"
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo"
            onClick={() => fileRef.current?.click()}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>

        <button
          type="submit"
          className="flex-none rounded-md bg-wallet-nov px-4 py-2 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Registrar
        </button>
      </div>
    </form>
  );
}
