import { ReactNode } from "react";
import { Modal } from "antd";
import { DM_Mono, DM_Sans, Sora } from "next/font/google";

import "./modalIntakeStructure.scss";

// Sistema visual "Validación de cargue" (diseño aprobado): Sora para títulos y
// cifras, DM Sans para el cuerpo y DM Mono para archivos y columnas.
const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--pl-sora" });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--pl-sans"
});
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--pl-mono" });

export type PlStepState = "done" | "active" | "error" | "pending";

export interface PlStep {
  label: string;
  state: PlStepState;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Nombre del archivo que se está cargando (chip en mono). */
  fileName?: string | null;
  /** Texto corto junto al archivo (filas, fecha, etc.). */
  meta?: string | null;
  steps?: PlStep[];
  /** Título y subtítulo de la sección principal. */
  heading?: ReactNode;
  subheading?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  width?: number;
}

/** Cascarón de los modales del flujo de cargue (validación de estructura y contenido). */
export const PlModalShell = ({
  open,
  onClose,
  title,
  fileName,
  meta,
  steps,
  heading,
  subheading,
  children,
  footer,
  width = 880
}: Props) => (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    closable={false}
    width={width}
    centered
    destroyOnClose
    className="plModal"
  >
    <div className={`plShell ${sora.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <div className="plHeader">
        <div className="plTitleRow">
          <div className="plTitleBlock">
            <span className="plEyebrow">CASHPORT · VALIDACIÓN DE CARGUE</span>
            <h2 className="plTitle">{title}</h2>
            {(fileName || meta) && (
              <div className="plFileRow">
                {fileName && <span className="plFileChip">{fileName}</span>}
                {meta && <span>{meta}</span>}
              </div>
            )}
          </div>
          <button type="button" aria-label="Cerrar" className="plClose" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {steps && steps.length > 0 && (
          <div
            className="plSteps"
            style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          >
            {steps.map((step) => (
              <div key={step.label} className={`plStep plStep--${step.state}`}>
                <span className="plStepBar" />
                <span className="plStepLabel">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="plBody">
        {(heading || subheading) && (
          <div className="plHeading">
            {heading && <h3>{heading}</h3>}
            {subheading && <span>{subheading}</span>}
          </div>
        )}
        {children}
      </div>

      <div className="plFooter">{footer}</div>
    </div>
  </Modal>
);

/** Nombre de columna o archivo en mono, como en el diseño. */
export const PlCol = ({ children }: { children: ReactNode }) => (
  <span className="plCol">{children}</span>
);
