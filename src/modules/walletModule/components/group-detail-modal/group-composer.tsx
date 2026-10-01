"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";

import AttachmentList from "../shared/attachment-list";

interface GroupComposerProps {
  /** Resuelve true si el comentario quedó registrado; sólo entonces se limpia. */
  onSubmit: (comment: string, files: File[]) => Promise<boolean>;
}

/** Caja de comentario del seguimiento, con adjuntos opcionales. */
export default function GroupComposer({ onSubmit }: GroupComposerProps) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = comment.trim();
    if (!value || isSending) return;

    setIsSending(true);
    try {
      const registered = await onSubmit(value, files);
      if (registered) {
        setComment("");
        setFiles([]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevos = Array.from(e.target.files ?? []);
    if (nuevos.length) setFiles((prev) => [...prev, ...nuevos]);
    // Se limpia para poder volver a elegir el mismo archivo tras quitarlo.
    e.target.value = "";
  };

  const adjuntos = files.map((f) => ({
    nombre: f.name,
    peso: `${Math.max(1, Math.round(f.size / 1024))} KB`
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-none flex-col gap-2.5 border-t border-border px-5 pb-4 pt-3.5"
    >
      <AttachmentList
        items={adjuntos}
        onRemove={(i) => setFiles((prev) => prev.filter((_, k) => k !== i))}
      />

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            autoComplete="off"
            value={comment}
            placeholder="Escribe un comentario…"
            disabled={isSending}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-2 pl-3 pr-10 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30 disabled:opacity-60"
          />
          <input type="file" ref={fileRef} multiple className="hidden" onChange={handleAddFiles} />
          <button
            type="button"
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo"
            disabled={isSending}
            onClick={() => fileRef.current?.click()}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={isSending || !comment.trim()}
          className="flex-none rounded-md bg-cashport-green px-4 py-2 text-[12.5px] font-bold text-cashport-black transition-colors hover:bg-cashport-green/90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSending ? "Registrando…" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
