"use client";

import { useState } from "react";
// TODO: adjuntos — /invoice/incident-comments sólo recibe { comments }. Cuando
// el endpoint acepte archivos, descomentar los bloques marcados abajo.
// import { useRef } from "react";
// import { Paperclip } from "lucide-react";
// import AttachmentList from "../shared/attachment-list";
// import type { IWalletAttachment } from "../../types";

interface GroupComposerProps {
  /** Resuelve true si el comentario quedó registrado; sólo entonces se limpia. */
  onSubmit: (comment: string) => Promise<boolean>;
}

/** Caja de comentario del seguimiento. */
export default function GroupComposer({ onSubmit }: GroupComposerProps) {
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  // const fileRef = useRef<HTMLInputElement>(null);
  // const [attachments, setAttachments] = useState<IWalletAttachment[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = comment.trim();
    if (!value || isSending) return;

    setIsSending(true);
    try {
      const registered = await onSubmit(value);
      if (registered) setComment("");
    } finally {
      setIsSending(false);
    }
  };

  // const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files ?? []);
  //   if (files.length) {
  //     setAttachments((prev) => [
  //       ...prev,
  //       ...files.map((f) => ({
  //         nombre: f.name,
  //         peso: `${Math.max(1, Math.round(f.size / 1024))} KB`
  //       }))
  //     ]);
  //   }
  //   e.target.value = "";
  // };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-none flex-col gap-2.5 border-t border-border px-5 pb-4 pt-3.5"
    >
      {/* <AttachmentList
        items={attachments}
        onRemove={(i) => setAttachments((prev) => prev.filter((_, k) => k !== i))}
      /> */}

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            autoComplete="off"
            value={comment}
            placeholder="Escribe un comentario…"
            disabled={isSending}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30 disabled:opacity-60"
          />
          {/* <input type="file" ref={fileRef} multiple className="hidden" onChange={handleAddFiles} />
          <button
            type="button"
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo"
            onClick={() => fileRef.current?.click()}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </button> */}
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
