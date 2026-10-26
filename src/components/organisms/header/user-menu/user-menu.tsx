"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover } from "antd";
import { ChevronDown, LockKeyhole, LogOut, MessageCircle, User } from "lucide-react";

import { logOut } from "../../../../../firebase-utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMessageApi } from "@/context/MessageContext";
import { sendEmailResetPassword } from "@/services/users/users";
import { cn } from "@/utils/utils";

// "Contactar soporte" queda maquetado pero oculto hasta que exista el módulo de tickets.
const SHOW_SUPPORT = false;

const initialsOf = (name: string, email: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length)
    return parts
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("");
  return email.slice(0, 2).toUpperCase();
};

const Avatar = ({ initials, className }: { initials: string; className?: string }) => (
  <span
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full bg-[#141414] font-semibold text-white",
      className
    )}
  >
    {initials || <User size={18} strokeWidth={2} />}
  </span>
);

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const MenuItem = ({ icon, label, onClick, danger, disabled }: MenuItemProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 text-left text-[13px] hover:bg-cp-muted disabled:cursor-default disabled:opacity-50",
      danger ? "text-cp-magenta" : "text-cp-ink"
    )}
  >
    <span className="flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    {label}
  </button>
);

/** Avatar del header y su menú: nombre/correo, cambiar contraseña, (soporte) y cerrar sesión. */
export default function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();
  const { showMessage } = useMessageApi();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const name = user?.name ?? "";
  const email = user?.email ?? "";
  const initials = user ? initialsOf(name, email) : "";

  const handleChangePassword = async () => {
    if (!email) return;
    setSending(true);
    try {
      await sendEmailResetPassword(email);
      showMessage("success", `Te enviamos un correo a ${email} para cambiar tu contraseña`);
      setOpen(false);
    } catch {
      showMessage("error", "No pudimos enviar el correo. Intenta de nuevo.");
    }
    setSending(false);
  };

  const content = (
    <div className="w-[240px] p-1.5">
      <div className="flex items-center gap-2.5 border-b border-cp-line px-2 pb-2.5 pt-1.5">
        <Avatar initials={initials} className="h-8 w-8 text-[12px]" />
        <div className="flex min-w-0 flex-col">
          {name && <span className="truncate text-[14px] font-semibold text-cp-ink">{name}</span>}
          <span className="truncate text-[12px] text-cp-ink-3">{email}</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 py-1.5">
        <MenuItem
          icon={<LockKeyhole strokeWidth={1.8} />}
          label={sending ? "Enviando correo…" : "Cambiar contraseña"}
          onClick={handleChangePassword}
          disabled={sending || !email}
        />
        {SHOW_SUPPORT && (
          <MenuItem
            icon={<MessageCircle strokeWidth={1.8} />}
            label="Contactar soporte"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
      <div className="border-t border-cp-line pt-1.5">
        <MenuItem
          danger
          icon={<LogOut strokeWidth={1.8} />}
          label="Cerrar sesión"
          onClick={() => logOut(router)}
        />
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={content}
      overlayInnerStyle={{
        padding: 0,
        borderRadius: 14,
        background: "#ffffff",
        boxShadow: "0 12px 32px rgba(0,0,0,.14)"
      }}
    >
      <button
        type="button"
        aria-label="Menú de usuario"
        className="ml-1 flex shrink-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-cp-ink"
      >
        <Avatar initials={initials} className="h-[var(--avatar)] w-[var(--avatar)] text-[14px]" />
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
    </Popover>
  );
}
