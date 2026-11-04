import { IStructureDetected, IStructureIssue } from "@/types/dataQuality/IIntakeStructure";
import { useTranslations } from "use-intl";

import { PlCol, PlModalShell } from "./PlModalShell";

export interface IStructureErrorsState {
  message: string;
  issues: IStructureIssue[];
  warnings: IStructureIssue[];
  detected?: IStructureDetected;
}

interface Props {
  open: boolean;
  state: IStructureErrorsState | null;
  onClose: () => void;
}

/** Etapa "Críticas": errores de estructura del archivo (422), todos juntos y con su celda. */
export const ModalStructureErrors = ({ open, state, onClose }: Props) => {
  const t = useTranslations("modals.intakeStructure.structureErrors");
  const tShared = useTranslations("modals.intakeStructure");
  const detected = state?.detected;
  const issues = state?.issues ?? [];
  const count = issues.length;

  return (
    <PlModalShell
      open={open}
      onClose={onClose}
      title={t("title")}
      meta={
        detected?.headerCell
          ? `${detected.format ? `${detected.format.toUpperCase()} · ` : ""}${
              detected.sheet ? `${t("sheet", { sheet: detected.sheet })} · ` : ""
            }${tShared("headersFrom", { cell: detected.headerCell })}`
          : null
      }
      steps={[
        { label: t("stepCritical"), state: "error" },
        { label: t("stepWarnings"), state: "pending" },
        { label: t("stepConfirm"), state: "pending" }
      ]}
      heading={t("heading", { count })}
      subheading={t("subheading")}
      footer={
        <>
          <button type="button" className="plBtn" onClick={onClose}>
            {tShared("cancelUpload")}
          </button>
          <span className="plSpacer" />
          <button type="button" className="plBtn plBtnPrimary" onClick={onClose}>
            {t("gotIt")}
          </button>
        </>
      }
    >
      <div className="plCard">
        {issues.map((issue, i) => (
          <div key={i} className="plItem">
            <span className="plDot" />
            <span style={{ flex: 1 }}>
              {issue.cell && <span className="plCellRef">{issue.cell}</span>}
              {issue.message}
            </span>
          </div>
        ))}
      </div>

      {!!state?.warnings.length && (
        <div className="plAlert">
          <strong>{t("warnings")}</strong>
          <ul>
            {state.warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {!!detected?.headers.length && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="plNote">{t("headersFound")}</span>
          <div className="plTags">
            {detected.headers.map((h, i) => (
              <PlCol key={`${h}-${i}`}>{h || tShared("unnamed")}</PlCol>
            ))}
          </div>
        </div>
      )}
    </PlModalShell>
  );
};
