"use client";

import { useState } from "react";
import { Select } from "antd";
import { useTranslations } from "use-intl";

import { cn } from "@/utils/utils";

export interface RecipientOption {
  label: string;
  value: string;
}

type RecipientKind = "email" | "phone";

const FIELD_LABEL =
  "w-12 shrink-0 text-[12px] font-medium text-cp-ink-4 max-md:w-11 max-md:text-[11px]";

/** Correo en minúsculas; teléfono solo con dígitos e indicativo, como lo espera el envío. */
const NORMALIZE: Record<RecipientKind, (value: string) => string> = {
  email: (value) => value.trim().toLowerCase(),
  phone: (value) => value.replace(/\D/g, "")
};
const VALID: Record<RecipientKind, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10,15}$/
};

/** Lo que eligió el usuario; mientras no toque nada, el único contacto si solo hay uno. */
export const useRecipients = (options: RecipientOption[]) => {
  const [picked, setPicked] = useState<string[] | null>(null);
  return [picked ?? (options.length === 1 ? [options[0].value] : []), setPicked] as const;
};

interface RecipientsFieldProps {
  kind: RecipientKind;
  options: RecipientOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Deja escribir destinatarios que no están entre los contactos (uno o más). */
  manual?: boolean;
  placeholder: string;
  loading?: boolean;
  className?: string;
}

/** Fila "Para": se eligen contactos del cliente y, con `manual`, se escriben otros. */
export default function RecipientsField({
  kind,
  options,
  value,
  onChange,
  manual,
  placeholder,
  loading,
  className
}: RecipientsFieldProps) {
  const t = useTranslations("blockingAlerts.recipients");
  const change = (next: string[]) =>
    onChange(
      Array.from(new Set(next.map(NORMALIZE[kind]))).filter(
        (v) => options.some((o) => o.value === v) || (manual && VALID[kind].test(v))
      )
    );

  return (
    <div className={cn("flex min-h-[44px] items-center gap-2.5 max-md:min-h-[38px]", className)}>
      <span className={FIELD_LABEL}>{t("to")}</span>
      <Select
        mode={manual ? "tags" : "multiple"}
        variant="borderless"
        aria-label={t("to")}
        placeholder={placeholder}
        loading={loading}
        options={options}
        value={value}
        onChange={change}
        tokenSeparators={[",", ";"]}
        notFoundContent={null}
        className="min-w-0 flex-1 !text-[13px] max-md:!text-[12.5px] [&_.ant-select-selector]:!px-0"
      />
    </div>
  );
}
