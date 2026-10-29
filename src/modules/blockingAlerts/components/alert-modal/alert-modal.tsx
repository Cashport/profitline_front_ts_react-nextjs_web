"use client";

import { Button, Modal } from "antd";
import { X } from "lucide-react";

import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { cn } from "@/utils/utils";

/** Móvil: menos aire y botones grandes (PrincipalButton, "Listo") más bajos. */
const MOBILE_BODY =
  "max-md:gap-2.5 max-md:px-4 max-md:pb-4 max-md:pt-2 max-md:[&_.ant-btn-lg]:!h-10 max-md:[&_.ant-btn-lg]:!text-[14px]";

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
 * Cabe en la pantalla: si falta alto se desplaza el cuerpo y el encabezado queda fijo.
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
        // En columna: el contenido toma el ancho del modal y no el de su texto más largo.
        body: {
          padding: 0,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column"
        },
        content: {
          padding: 0,
          overflow: "hidden",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100 * var(--vh) - 48px)"
        }
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-cp-surface text-cp-ink">
        <header className="flex shrink-0 items-center gap-3 px-[22px] pb-1 pt-4 max-md:px-4 max-md:pt-3">
          <div className="mr-auto min-w-0">
            <h3 className="m-0 text-[15px] font-semibold leading-tight">{title}</h3>
            {subtitle && (
              <p className="m-0 truncate text-[13px] leading-tight text-cp-ink-3">{subtitle}</p>
            )}
          </div>
          <Button type="text" aria-label="Cerrar" icon={<X size={14} />} onClick={onClose} />
        </header>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-[22px] pb-5 pt-3",
            MOBILE_BODY
          )}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
}
