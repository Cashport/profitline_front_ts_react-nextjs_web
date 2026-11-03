"use client";

import { Modal } from "antd";
import { FileText } from "lucide-react";

import ProfitLoader from "@/components/ui/profit-loader";
import StatusPill from "@/modules/visitsModule/components/shared/status-pill";
import { formatDateAndTime } from "@/utils/utils";

import { RESPONSE_STATUS } from "../../constants";
import { useVisitFormResponseDisplay } from "../../hooks/useVisitFormResponseDisplay";

interface SurveyResponseModalProps {
  /** null: cerrado. */
  responseId: number | null;
  onClose: () => void;
}

/** Una respuesta: cada pregunta visible con lo que contestó el asesor, y sus fotos o archivos. */
export default function SurveyResponseModal({ responseId, onClose }: SurveyResponseModalProps) {
  const { response, isLoading, error } = useVisitFormResponseDisplay(responseId);

  const renderBody = () => {
    if (isLoading) return <ProfitLoader size="small" />;
    if (error || !response) {
      return (
        <p className="py-6 text-center text-sm text-destructive">
          {error?.message || "No se pudo cargar la respuesta."}
        </p>
      );
    }
    return (
      <ol className="flex max-h-[60vh] flex-col overflow-y-auto">
        {response.answers.map((answer, i) => (
          <li
            key={answer.questionId}
            className="flex flex-col gap-1.5 border-b border-border py-3 last:border-b-0"
          >
            <span className="text-[13px] font-medium text-foreground">
              <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
              {answer.label}
            </span>
            {answer.files.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {answer.files.map((file) =>
                  file.mimeType.startsWith("image/") ? (
                    <a
                      key={file.url}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      title={file.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-20 w-20 rounded-lg border border-border object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      key={file.url}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[13px] font-medium text-[#1677ff]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {file.name}
                    </a>
                  )
                )}
              </div>
            ) : (
              <span
                className={
                  answer.display
                    ? "text-[13px] text-foreground"
                    : "text-[13px] text-muted-foreground"
                }
              >
                {answer.display ?? "Sin respuesta"}
              </span>
            )}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <Modal
      centered
      destroyOnClose
      open={responseId !== null}
      onCancel={onClose}
      footer={null}
      width={640}
      title={
        response ? (
          <div className="flex flex-col gap-1 pr-6">
            <span className="text-[17px] font-semibold">
              {response.client.name ?? "Cliente sin nombre"}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-normal text-muted-foreground">
              {formatDateAndTime(response.completedAt ?? response.startedAt)} ·{" "}
              {response.user.name ?? "—"}
              <StatusPill
                label={RESPONSE_STATUS[response.status].label}
                color={RESPONSE_STATUS[response.status].color}
              />
            </span>
          </div>
        ) : (
          "Respuesta"
        )
      }
    >
      {renderBody()}
    </Modal>
  );
}
