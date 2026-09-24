"use client";

import { Drawer } from "antd";
import { X } from "lucide-react";

import { useWalletTheme } from "../../contexts/wallet-theme-context";

/** Panel que abre el menú de acciones del grupo. */
export type NoveltyModalMode = "crear" | "editar" | "vincular";

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-[11px] text-[11px] font-semibold text-muted-foreground">{children}</h4>
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-[10.5px] font-semibold text-muted-foreground">
    {children}
  </label>
);

interface NoveltyPanelProps {
  title: string;
  subtitle?: React.ReactNode;
  onClose: () => void;
  submitLabel: string;
  /** Etiqueta del botón mientras se envía ("Creando…"). */
  sendingLabel: string;
  onSubmit: () => void;
  isSending?: boolean;
  submitDisabled?: boolean;
  children: React.ReactNode;
}

/**
 * Cabecera, cuerpo desplazable y pie (Cancelar / acción principal) de los
 * paneles de novedad. Lo renderiza el formulario de cada panel, que es quien
 * conoce su estado de envío.
 */
export function NoveltyPanel({
  title,
  subtitle,
  onClose,
  submitLabel,
  sendingLabel,
  onSubmit,
  isSending = false,
  submitDisabled = false,
  children
}: NoveltyPanelProps) {
  return (
    <div className="wallet-scope flex h-full flex-col bg-card text-foreground">
      <header className="flex flex-none items-start gap-4 border-b border-border px-[22px] pb-4 pt-[18px]">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-[1.2] tracking-[-0.015em] text-foreground">
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-[12.5px] text-muted-foreground">{subtitle}</p>}
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          disabled={isSending}
          onClick={onClose}
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-[22px] py-4">
        {children}
      </div>

      <div className="flex flex-none items-center justify-end gap-2 border-t border-border px-[22px] py-3.5">
        <button
          type="button"
          disabled={isSending}
          onClick={onClose}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isSending || submitDisabled}
          onClick={onSubmit}
          className="rounded-md bg-cashport-green px-3 py-1.5 text-[12.5px] font-bold text-cashport-black transition-colors hover:bg-cashport-green/90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSending ? sendingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

interface NoveltyDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Panel lateral de los formularios de novedad. Sólo monta el contenido
 * mientras está abierto: así cada apertura nace con el estado limpio y los
 * catálogos no se piden hasta que hacen falta.
 */
export default function NoveltyDrawer({ open, onClose, children }: NoveltyDrawerProps) {
  const { resolvedTheme } = useWalletTheme();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      closable={false}
      destroyOnClose
      width={560}
      // El drawer vive en un portal fuera de .wallet-scope y del contenedor .dark,
      // así que el tema se re-declara aquí, igual que en GroupDetailModal.
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 } }}
    >
      {open && children}
    </Drawer>
  );
}
