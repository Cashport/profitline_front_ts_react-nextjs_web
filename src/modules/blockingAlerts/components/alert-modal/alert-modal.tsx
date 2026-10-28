"use client";

import { Button, Modal } from "antd";
import { X } from "lucide-react";

import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";

interface AlertModalProps {
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Cascarón de los modales del módulo (como upload-modal de conciliación). Se monta
 * al abrirse y se desmonta al cerrarse, así que cada apertura empieza de cero. Vive
 * en un portal fuera del contenedor .dark: el tema se re-declara aquí.
 */
export default function AlertModal({ onClose, title, subtitle, children }: AlertModalProps) {
  const { resolvedTheme } = useWalletTheme();

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      centered
      width="min(520px, calc(100 * var(--vw) - 32px))"
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{
        body: { padding: 0 },
        content: { padding: 0, overflow: "hidden", borderRadius: 12 }
      }}
    >
      <div className="flex flex-col bg-cp-surface text-cp-ink">
        <header className="flex items-center gap-3 border-b border-cp-line px-[22px] py-4">
          <div className="mr-auto min-w-0">
            <h3 className="m-0 text-base font-semibold">{title}</h3>
            {subtitle && <p className="m-0 truncate text-xs text-cp-ink-3">{subtitle}</p>}
          </div>
          <Button type="text" aria-label="Cerrar" icon={<X size={14} />} onClick={onClose} />
        </header>
        <div className="flex flex-col gap-4 px-[22px] py-5">{children}</div>
      </div>
    </Modal>
  );
}
