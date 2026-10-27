import { useRef, useState } from "react";
import { message } from "antd";

import { ApiError } from "@/utils/api/api";
import { ITemplatePreview } from "@/types/dataQuality/IIntakeStructure";
import { ModalTemplateDecision } from "./ModalTemplateDecision";
import { IStructureErrorsState, ModalStructureErrors } from "./ModalStructureErrors";

// eslint-disable-next-line no-unused-vars
export type IntakeUpload = (useAsTemplate?: boolean) => Promise<unknown>;

interface RunOptions {
  /** Se llama antes de mostrar un modal (p. ej. para ocultar el mensaje de carga). */
  onPrompt?: () => void;
}

const isTemplatePreview = (data: unknown): data is ITemplatePreview =>
  !!data && typeof data === "object" && "can_use_as_template" in data;

/**
 * Maneja la validación de estructura de /data/create-intake(-generic):
 * - 409: pregunta si el archivo se usa como template y reintenta con la respuesta.
 * - 422: muestra todos los errores de encabezados con su celda.
 * Los demás errores se relanzan para que el llamador los maneje como siempre.
 *
 * `runUpload` devuelve true si el archivo se cargó y false si el usuario canceló
 * o el archivo fue rechazado (el modal ya informó el motivo).
 */
export const useIntakeStructureUpload = () => {
  const [preview, setPreview] = useState<ITemplatePreview | null>(null);
  const [errorsState, setErrorsState] = useState<IStructureErrorsState | null>(null);
  // eslint-disable-next-line no-unused-vars
  const resolveDecision = useRef<((answer: boolean | null) => void) | null>(null);

  const askDecision = (data: ITemplatePreview) =>
    new Promise<boolean | null>((resolve) => {
      resolveDecision.current = resolve;
      setPreview(data);
    });

  const handleAnswer = (answer: boolean | null) => {
    setPreview(null);
    resolveDecision.current?.(answer);
    resolveDecision.current = null;
  };

  const runUpload = async (upload: IntakeUpload, options: RunOptions = {}): Promise<boolean> => {
    let useAsTemplate: boolean | undefined;
    let hideRetry: (() => void) | undefined;
    try {
      for (;;) {
        try {
          await upload(useAsTemplate);
          return true;
        } catch (error) {
          if (!(error instanceof ApiError)) throw error;

          if (
            error.status === 409 &&
            useAsTemplate === undefined &&
            isTemplatePreview(error.data)
          ) {
            options.onPrompt?.();
            const answer = await askDecision(error.data);
            if (answer === null) return false;
            useAsTemplate = answer;
            hideRetry = message.loading("Subiendo archivo...", 0);
            continue;
          }

          if (error.status === 422 && Array.isArray(error.data?.errors)) {
            options.onPrompt?.();
            hideRetry?.();
            setErrorsState({
              message: error.message,
              issues: error.data.errors,
              warnings: error.data.warnings ?? [],
              detected: error.data.detected
            });
            return false;
          }

          throw error;
        }
      }
    } finally {
      hideRetry?.();
    }
  };

  const structureModals = (
    <>
      <ModalTemplateDecision open={!!preview} preview={preview} onAnswer={handleAnswer} />
      <ModalStructureErrors
        open={!!errorsState}
        state={errorsState}
        onClose={() => setErrorsState(null)}
      />
    </>
  );

  return { runUpload, structureModals };
};
