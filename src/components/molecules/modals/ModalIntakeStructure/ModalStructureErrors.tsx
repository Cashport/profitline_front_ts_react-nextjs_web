import { IStructureDetected, IStructureIssue } from "@/types/dataQuality/IIntakeStructure";
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
  const detected = state?.detected;
  const issues = state?.issues ?? [];
  const count = issues.length;

  return (
    <PlModalShell
      open={open}
      onClose={onClose}
      title="El archivo no tiene la estructura esperada"
      meta={
        detected?.headerCell
          ? `${detected.format ? `${detected.format.toUpperCase()} · ` : ""}${
              detected.sheet ? `hoja ${detected.sheet} · ` : ""
            }encabezados desde ${detected.headerCell}`
          : null
      }
      steps={[
        { label: "1 · Críticas", state: "error" },
        { label: "2 · Advertencias", state: "pending" },
        { label: "3 · Confirmar", state: "pending" }
      ]}
      heading={`${count} ${count === 1 ? "alerta crítica" : "alertas críticas"}`}
      subheading="Corrige el archivo y vuelve a cargarlo. No se procesó ningún dato."
      footer={
        <>
          <button type="button" className="plBtn" onClick={onClose}>
            Cancelar cargue
          </button>
          <span className="plSpacer" />
          <button type="button" className="plBtn plBtnPrimary" onClick={onClose}>
            Entendido
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
          <strong>Advertencias</strong>
          <ul>
            {state.warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {!!detected?.headers.length && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="plNote">Encabezados encontrados en el archivo:</span>
          <div className="plTags">
            {detected.headers.map((h, i) => (
              <PlCol key={`${h}-${i}`}>{h || "(sin nombre)"}</PlCol>
            ))}
          </div>
        </div>
      )}
    </PlModalShell>
  );
};
