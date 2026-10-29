"use client";
import { useState } from "react";
import { Popover } from "antd";
import { ChevronDown, MessageCircle, User } from "lucide-react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMessageApi } from "@/context/MessageContext";
import { useThemeMenu, type ThemePreference } from "@/context/ThemeMenuContext";
import { sendEmailResetPassword } from "@/services/users/users";
import { cn } from "@/utils/utils";
import { LogoutIcon, useLogoutConfirm } from "./logout-confirm";

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
      "flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-2.5 text-left text-[13.5px] hover:bg-cp-bg disabled:cursor-default disabled:opacity-50",
      danger ? "text-cp-magenta" : "text-cp-ink"
    )}
  >
    <span className="flex shrink-0">{icon}</span>
    {label}
  </button>
);

/* Íconos del diseño "Corte y Proyeccion" (17px el de la fila, 14px los del selector). */
const MenuIcon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={size === 17 ? 1.7 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const ICON_THEME = "M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18";
const ICON_LOCK = "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3";

const THEME_OPTIONS: { key: ThemePreference; label: string; d: string }[] = [
  {
    key: "light",
    label: "Claro",
    d: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
  },
  { key: "dark", label: "Oscuro", d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" },
  { key: "system", label: "Sistema", d: "M4 5h16v11H4zM2 19h20" }
];

/**
 * Avatar del header y su menú: nombre/correo, tema (solo en módulos con modo oscuro),
 * cambiar contraseña, (soporte) y cerrar sesión.
 */
export default function UserMenu() {
  const user = useCurrentUser();
  const { showMessage } = useMessageApi();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const themeMenu = useThemeMenu();
  const { askLogout, logoutModal } = useLogoutConfirm();

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
    <div className="flex w-[300px] flex-col p-2 text-cp-ink">
      <div className="flex items-center gap-3 p-2.5">
        <Avatar initials={initials} className="h-[38px] w-[38px] text-[13px]" />
        <div className="flex min-w-0 flex-col gap-px">
          {name && <span className="truncate text-[14.5px] font-semibold">{name}</span>}
          <span className="truncate text-[13px] text-cp-ink-3">{email}</span>
        </div>
      </div>
      <div className="my-1 h-px bg-cp-line" />
      {themeMenu && (
        <div className="flex flex-col gap-2 px-2.5 pb-2.5 pt-2">
          <span className="flex items-center gap-3 text-[13.5px]">
            <MenuIcon d={ICON_THEME} />
            Tema
          </span>
          <div className="grid grid-cols-3 gap-0.5 rounded-lg bg-cp-bg p-[3px]">
            {THEME_OPTIONS.map(({ key, label, d }) => {
              const active = themeMenu.theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={label}
                  aria-pressed={active}
                  onClick={() => themeMenu.setTheme(key)}
                  className={cn(
                    "flex h-[30px] min-w-0 cursor-pointer items-center justify-center gap-[5px] rounded-md border-0 text-[13px] text-cp-ink",
                    active
                      ? "bg-white font-semibold shadow-[0_1px_3px_rgba(0,0,0,.12)]"
                      : "bg-transparent font-normal"
                  )}
                >
                  <MenuIcon d={d} size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <MenuItem
        icon={<MenuIcon d={ICON_LOCK} />}
        label={sending ? "Enviando correo…" : "Cambiar contraseña"}
        onClick={handleChangePassword}
        disabled={sending || !email}
      />
      {SHOW_SUPPORT && (
        <MenuItem
          icon={<MessageCircle size={17} strokeWidth={1.7} />}
          label="Contactar soporte"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="my-1 h-px bg-cp-line" />
      <MenuItem
        danger
        icon={<LogoutIcon />}
        label="Cerrar sesión"
        onClick={() => {
          setOpen(false);
          askLogout();
        }}
      />
    </div>
  );

  return (
    <>
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
          boxShadow: "0 12px 32px rgba(0,0,0,.16)"
        }}
      >
        <button
          type="button"
          aria-label="Menú de usuario"
          className="ml-1 flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-cp-ink"
        >
          <Avatar initials={initials} className="h-[var(--avatar)] w-[var(--avatar)] text-[13px]" />
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      </Popover>
      {logoutModal}
    </>
  );
}
