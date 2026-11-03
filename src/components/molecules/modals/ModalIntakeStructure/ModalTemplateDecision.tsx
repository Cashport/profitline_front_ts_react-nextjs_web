import { ITemplatePreview } from "@/types/dataQuality/IIntakeStructure";
import { useTranslations } from "use-intl";

import { PlCol, PlModalShell } from "./PlModalShell";

interface Props {
  open: boolean;
  preview: ITemplatePreview | null;
  /** true = usar como template, false = cargar sin template, null = cancelar. */
  // eslint-disable-next-line no-unused-vars
  onAnswer: (answer: boolean | null) => void;
}

/**
 * Se muestra cuando la carga aun no tiene template de estructura
 * (409 TEMPLATE_DECISION_REQUIRED).
 */
export const ModalTemplateDecision = ({ open, preview, onAnswer }: Props) => {
  const t = useTranslations("modals.intakeStructure.templateDecision");
  const tShared = useTranslations("modals.intakeStructure");
  const detected = preview?.detected;
  const canUse = !!preview?.can_use_as_template;
  const headers = preview?.template?.fields.map((f) => f.name) ?? detected?.headers ?? [];
  const meta = detected?.headerCell
    ? `${detected.sheet ? `${t("sheet", { sheet: detected.sheet })} · ` : ""}${tShared("headersFrom", { cell: detected.headerCell })}${
        detected.delimiter ? ` · ${t("delimiter", { delimiter: detected.delimiter })}` : ""
      }`
    : null;

  return (
    <PlModalShell
      open={open}
      onClose={() => onAnswer(null)}
      title={t("title")}
      fileName={null}
      meta={meta}
      heading={canUse ? t("columnsDetected", { count: headers.length }) : t("cannotUse")}
      subheading={canUse ? t("useHint") : t("fixHint")}
      footer={
        <>
          <button type="button" className="plBtn" onClick={() => onAnswer(null)}>
            {tShared("cancelUpload")}
          </button>
          <span className="plSpacer" />
          <button type="button" className="plBtn" onClick={() => onAnswer(false)}>
            {t("uploadWithout")}
          </button>
          <button
            type="button"
            className="plBtn plBtnPrimary"
            disabled={!canUse}
            onClick={() => onAnswer(true)}
          >
            {t("useAsTemplate")}
          </button>
        </>
      }
    >
      {canUse && (
        <div className="plCard" style={{ padding: "14px 18px" }}>
          <div className="plTags">
            {headers.map((h, i) => (
              <PlCol key={`${h}-${i}`}>{h || tShared("unnamed")}</PlCol>
            ))}
          </div>
        </div>
      )}

      {!canUse && !!preview?.errors.length && (
        <div className="plCard">
          {preview.errors.map((e, i) => (
            <div key={i} className="plItem">
              <span className="plDot" />
              <span style={{ flex: 1 }}>{e.message}</span>
            </div>
          ))}
        </div>
      )}

      {canUse && !!preview?.warnings.length && (
        <div className="plAlert">
          <strong>{t("reviewBeforeConfirm")}</strong>
          <ul>
            {preview.warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}
    </PlModalShell>
  );
};
