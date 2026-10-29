import { ITemplatePreview } from "@/types/dataQuality/IIntakeStructure";
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
  const detected = preview?.detected;
  const canUse = !!preview?.can_use_as_template;
  const headers = preview?.template?.fields.map((f) => f.name) ?? detected?.headers ?? [];
  const meta = detected?.headerCell
    ? `${detected.sheet ? `Hoja ${detected.sheet} · ` : ""}encabezados desde ${detected.headerCell}${
        detected.delimiter ? ` · separador ${detected.delimiter}` : ""
      }`
    : null;

  return (
    <PlModalShell
      open={open}
      onClose={() => onAnswer(null)}
      title="Este archivo aún no tiene template"
      fileName={null}
      meta={meta}
      heading={canUse ? `${headers.length} columnas detectadas` : "No se puede usar como template"}
      subheading={
        canUse
          ? "Si lo usas como template, los próximos archivos deberán traer estas mismas columnas, en el mismo orden y en la misma ubicación."
          : "Corrige el archivo o cárgalo sin template."
      }
      footer={
        <>
          <button type="button" className="plBtn" onClick={() => onAnswer(null)}>
            Cancelar cargue
          </button>
          <span className="plSpacer" />
          <button type="button" className="plBtn" onClick={() => onAnswer(false)}>
            Cargar sin template
          </button>
          <button
            type="button"
            className="plBtn plBtnPrimary"
            disabled={!canUse}
            onClick={() => onAnswer(true)}
          >
            Usar como template
          </button>
        </>
      }
    >
      {canUse && (
        <div className="plCard" style={{ padding: "14px 18px" }}>
          <div className="plTags">
            {headers.map((h, i) => (
              <PlCol key={`${h}-${i}`}>{h || "(sin nombre)"}</PlCol>
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
          <strong>Revisa antes de confirmar</strong>
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
