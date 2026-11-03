"use client";

import type { ReactNode } from "react";
import { DatePicker, Input, InputNumber, Select, Switch, Tooltip } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "use-intl";

import type { IVisitFormQuestion, IVisitFormQuestionValidation } from "@/types/surveys/ISurveys";
import { cn } from "@/utils/utils";

import { FILE_TYPE_OPTIONS, MAX_DECIMALS, MAX_FILES_LIMIT } from "../../constants";
import type { SurveyEditor } from "../../hooks/useSurveyEditor";

interface QuestionConfigFieldsProps {
  question: IVisitFormQuestion;
  editor: SurveyEditor;
}

type NumericLimit =
  | "min_length"
  | "max_length"
  | "min_value"
  | "max_value"
  | "decimals"
  | "min_selections"
  | "max_selections"
  | "max_files"
  | "max_file_size_mb";

/** Campo con su etiqueta. `soon`: el backend todavía no lo recibe, va deshabilitado y no se envía. */
function Field({ label, soon, children }: { label: string; soon?: boolean; children: ReactNode }) {
  const t = useTranslations("surveys.config");
  const field = (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
  return soon ? <Tooltip title={t("soon")}>{field}</Tooltip> : field;
}

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">{children}</div>
);

/** Configuración propia de cada tipo de pregunta (límites, formatos, fechas). */
export default function QuestionConfigFields({ question, editor }: QuestionConfigFieldsProps) {
  const t = useTranslations("surveys.config");
  const v = question.validation ?? {};
  const setValidation = (patch: IVisitFormQuestionValidation) =>
    editor.updateValidation(question.id, patch);

  const limit = (
    key: NumericLimit,
    label: string,
    { min, max, placeholder }: { min?: number; max?: number; placeholder?: string } = {}
  ) => (
    <Field label={label}>
      <InputNumber
        className="!w-full"
        min={min}
        max={max}
        placeholder={placeholder}
        value={v[key]}
        onChange={(value) =>
          setValidation({ [key]: value ?? undefined } as IVisitFormQuestionValidation)
        }
      />
    </Field>
  );

  const placeholderField = (
    <Field label={t("placeholder")}>
      <Input
        value={question.placeholder ?? ""}
        onChange={(e) =>
          editor.updateQuestion(question.id, { placeholder: e.target.value || null })
        }
      />
    </Field>
  );

  const toggleFileType = (ext: string) => {
    const current = v.allowed_file_types ?? [];
    const next = current.includes(ext) ? current.filter((e) => e !== ext) : [...current, ext];
    setValidation({ allowed_file_types: next.length ? next : undefined });
  };

  switch (question.type) {
    case "text":
    case "textarea":
      return (
        <Grid>
          {placeholderField}
          {limit("max_length", t("maxChars"), {
            min: 1,
            max: question.type === "text" ? 255 : 5000
          })}
        </Grid>
      );
    case "document":
    case "phone":
      return (
        <Grid>
          {placeholderField}
          {limit("min_length", t("minDigits"), { min: 0 })}
          {limit("max_length", t("maxDigits"), { min: 1 })}
        </Grid>
      );
    case "number":
      return (
        <Grid>
          {placeholderField}
          {limit("min_value", t("min"))}
          {limit("max_value", t("max"))}
          {limit("decimals", t("decimals"), { min: 0, max: MAX_DECIMALS })}
          <Field label={t("initialValue")} soon>
            <InputNumber className="!w-full" disabled placeholder="0" />
          </Field>
          <Field label={t("currency")} soon>
            <Select
              disabled
              placeholder={t("currencyCop")}
              options={[
                { value: "COP", label: t("currencyCop") },
                { value: "USD", label: t("currencyUsd") }
              ]}
            />
          </Field>
        </Grid>
      );
    case "multi_select":
      return (
        <Grid>
          {limit("min_selections", t("minSelections"), { min: 0 })}
          {limit("max_selections", t("maxSelections"), { min: 1, placeholder: t("noLimit") })}
        </Grid>
      );
    case "photo":
      return (
        <Grid>
          {limit("max_files", t("maxPhotos"), { min: 1, max: MAX_FILES_LIMIT })}
          {limit("max_file_size_mb", t("maxSizeMb"), { min: 1 })}
          <Field label={t("cameraOnly")} soon>
            <Switch disabled className="w-fit" />
          </Field>
        </Grid>
      );
    case "file":
      return (
        <div className="flex flex-col gap-3">
          <Grid>
            {limit("max_files", t("maxFiles"), { min: 1, max: MAX_FILES_LIMIT })}
            {limit("max_file_size_mb", t("maxSizeMb"), { min: 1 })}
          </Grid>
          <Field label={t("allowedFormats")}>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set([...FILE_TYPE_OPTIONS, ...(v.allowed_file_types ?? [])])).map(
                (ext) => {
                  const on = v.allowed_file_types?.includes(ext);
                  return (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => toggleFileType(ext)}
                      className={cn(
                        "h-7 rounded-md border px-2.5 text-[13px] font-semibold transition-colors",
                        on
                          ? "border-[#cbe71e] bg-[#cbe71e] text-[#141414]"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ext.slice(1).toUpperCase()}
                    </button>
                  );
                }
              )}
            </div>
          </Field>
        </div>
      );
    case "date":
      return (
        <Grid>
          <Field label={t("minDate")}>
            <DatePicker
              className="!w-full"
              format="DD/MM/YYYY"
              value={v.min_date ? dayjs(v.min_date) : null}
              onChange={(d) => setValidation({ min_date: d ? d.format("YYYY-MM-DD") : undefined })}
            />
          </Field>
          <Field label={t("maxDate")}>
            <DatePicker
              className="!w-full"
              format="DD/MM/YYYY"
              value={v.max_date ? dayjs(v.max_date) : null}
              onChange={(d) => setValidation({ max_date: d ? d.format("YYYY-MM-DD") : undefined })}
            />
          </Field>
        </Grid>
      );
    case "location":
      return (
        <Grid>
          <Field label={t("minAccuracy")} soon>
            <InputNumber className="!w-full" disabled placeholder="50" />
          </Field>
        </Grid>
      );
    default:
      return null;
  }
}
