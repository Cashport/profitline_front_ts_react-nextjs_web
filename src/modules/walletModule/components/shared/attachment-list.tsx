"use client";

import { Paperclip, X } from "lucide-react";

import { cn } from "@/utils/utils";
import type { IWalletAttachment } from "../../types";

interface AttachmentListProps {
  items: IWalletAttachment[];
  /** Si se pasa, cada adjunto muestra una ✕ para quitarlo (adjuntos sin enviar). */
  onRemove?: (index: number) => void;
  className?: string;
}

const CHIP =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-[7px] py-0.5 text-[11px] font-semibold text-foreground";

export default function AttachmentList({ items, onRemove, className }: AttachmentListProps) {
  if (!items.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((a, i) => {
        const contenido = (
          <>
            <Paperclip className="h-[11px] w-[11px] shrink-0" />
            {a.nombre}
            {a.peso && <small className="font-medium text-muted-foreground">{a.peso}</small>}
          </>
        );

        // Con URL (ya subido) el chip abre el archivo en otra pestaña.
        return a.url ? (
          <a
            key={`${a.nombre}-${i}`}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir ${a.nombre}`}
            className={cn(CHIP, "transition-colors hover:bg-secondary hover:underline")}
          >
            {contenido}
          </a>
        ) : (
          <span key={`${a.nombre}-${i}`} className={CHIP}>
            {contenido}
            {onRemove && (
              <button
                type="button"
                aria-label={`Quitar ${a.nombre}`}
                className="text-muted-foreground transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => onRemove(i)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
