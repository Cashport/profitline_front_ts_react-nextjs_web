import { useTranslations } from "use-intl";

/** Marca el informe recién publicado en el listado. */
export default function NewReportBadge() {
  const t = useTranslations("reports.list");
  return (
    <span className="shrink-0 rounded-full bg-primary px-2 py-px text-[13px] font-semibold text-primary-foreground">
      {t("newBadge")}
    </span>
  );
}
