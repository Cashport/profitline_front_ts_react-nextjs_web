import { useEffect, useMemo, useState } from "react";

import { useMessageApi } from "@/context/MessageContext";
import type {
  IUpsertVisitFormBody,
  IVisitForm,
  IVisitFormQuestion,
  IVisitFormQuestionOption,
  IVisitFormQuestionType,
  IVisitFormQuestionValidation,
  IVisitFormStatus
} from "@/types/surveys/ISurveys";
import { ApiError } from "@/utils/api/api";

import { NEW_QUESTION_DEFAULTS, OPTION_TYPES } from "../constants";
import { useVisitForm } from "./useVisitForm";

/** Lo que se edita: los campos de la encuesta y sus preguntas, con la forma del backend. */
export interface ISurveyDraft {
  name: string;
  description: string | null;
  status: IVisitFormStatus;
  questions: IVisitFormQuestion[];
}

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/** El `value` de una opción nueva se arma con su etiqueta al publicar (ver `withValues`). */
const newOption = (label: string): IVisitFormQuestionOption => ({
  id: newId("o"),
  label,
  value: ""
});

const newQuestion = (type: IVisitFormQuestionType): IVisitFormQuestion => {
  const defaults = NEW_QUESTION_DEFAULTS[type];
  return {
    id: newId("q"),
    type,
    label: "",
    description: null,
    required: false,
    order: 0,
    placeholder: defaults?.placeholder ?? null,
    validation: { ...defaults?.validation },
    options: defaults?.optionLabels?.map(newOption)
  };
};

const draftOf = (form?: IVisitForm): ISurveyDraft =>
  form
    ? {
        name: form.name,
        description: form.description,
        status: form.status,
        questions: form.questions
      }
    : {
        name: "",
        description: null,
        status: "ACTIVE",
        questions: [{ ...newQuestion("text"), required: true }]
      };

/** Quita los límites vacíos: el backend rechaza null donde espera un número. */
const cleanValidation = (validation: IVisitFormQuestionValidation) =>
  Object.fromEntries(
    Object.entries(validation).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as IVisitFormQuestionValidation;

const slug = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "opcion";

/** Las opciones nuevas reciben un `value` legible y único; las ya publicadas conservan el suyo. */
const withValues = (options: IVisitFormQuestionOption[]) => {
  const used = new Set(options.map((o) => o.value).filter(Boolean));
  return options.map((o) => {
    const label = o.label.trim();
    if (o.value) return { ...o, label };
    const base = slug(label);
    let value = base;
    for (let n = 2; used.has(value); n++) value = `${base}_${n}`;
    used.add(value);
    return { ...o, label, value };
  });
};

const toDefinition = (questions: IVisitFormQuestion[]) => ({
  questions: questions.map((q, order) => ({
    ...q,
    order,
    label: q.label.trim(),
    description: q.description?.trim() || null,
    ...(q.options && { options: withValues(q.options) })
  }))
});

/** Lo mismo que revisa el diseño antes de publicar; el resto lo valida el backend. */
const firstProblem = (draft: ISurveyDraft) => {
  if (!draft.name.trim()) return "Ponle un nombre a la encuesta";
  if (!draft.questions.length) return "Agrega al menos una pregunta";
  const untitled = draft.questions.filter((q) => !q.label.trim()).length;
  if (untitled)
    return untitled === 1 ? "1 pregunta sin título" : `${untitled} preguntas sin título`;
  const withEmptyOption = draft.questions.findIndex((q) => q.options?.some((o) => !o.label.trim()));
  if (withEmptyOption >= 0) return `La pregunta ${withEmptyOption + 1} tiene opciones sin texto`;
  return null;
};

/**
 * Editor de una encuesta (/surveys/new y /surveys/:id): el borrador, las
 * operaciones sobre preguntas y opciones, y la publicación (POST o PUT).
 */
export const useSurveyEditor = (formId?: number) => {
  const { form, error, isLoading, saveForm } = useVisitForm(formId);
  const { showMessage } = useMessageApi();
  const [initial, setInitial] = useState<ISurveyDraft>(() => draftOf(form));
  const [draft, setDraft] = useState<ISurveyDraft>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial.questions[0]?.id ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Llega la encuesta, o la versión que se acaba de publicar: el borrador arranca de ahí.
  useEffect(() => {
    if (!form) return;
    const next = draftOf(form);
    setInitial(next);
    setDraft(next);
    setSelectedId((current) =>
      next.questions.some((q) => q.id === current) ? current : next.questions[0]?.id ?? null
    );
  }, [form]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial]
  );

  const setQuestions = (fn: (questions: IVisitFormQuestion[]) => IVisitFormQuestion[]) =>
    setDraft((d) => ({ ...d, questions: fn(d.questions) }));

  const patchQuestion = (id: string, fn: (question: IVisitFormQuestion) => IVisitFormQuestion) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? fn(q) : q)));

  const setField = <K extends "name" | "description" | "status">(key: K, value: ISurveyDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const updateQuestion = (id: string, patch: Partial<IVisitFormQuestion>) =>
    patchQuestion(id, (q) => ({ ...q, ...patch }));

  const updateValidation = (id: string, patch: IVisitFormQuestionValidation) =>
    patchQuestion(id, (q) => ({
      ...q,
      validation: cleanValidation({ ...q.validation, ...patch })
    }));

  /** Cambia el tipo con la configuración por defecto del nuevo; las opciones pasan entre tipos de selección. */
  const changeType = (id: string, type: IVisitFormQuestionType) =>
    patchQuestion(id, (q) => {
      const fresh = newQuestion(type);
      const keepOptions = OPTION_TYPES.includes(type) && Boolean(q.options?.length);
      return {
        ...q,
        type,
        placeholder: fresh.placeholder,
        validation: fresh.validation,
        options: keepOptions ? q.options : fresh.options
      };
    });

  /** Agrega debajo de la pregunta seleccionada (o al final) y la deja seleccionada. */
  const addQuestion = (type: IVisitFormQuestionType) => {
    const question = newQuestion(type);
    setQuestions((qs) => {
      const at = qs.findIndex((q) => q.id === selectedId) + 1 || qs.length;
      return [...qs.slice(0, at), question, ...qs.slice(at)];
    });
    setSelectedId(question.id);
  };

  const duplicateQuestion = (id: string) => {
    const copyId = newId("q");
    setQuestions((qs) => {
      const at = qs.findIndex((q) => q.id === id);
      if (at < 0) return qs;
      return [
        ...qs.slice(0, at + 1),
        { ...structuredClone(qs[at]), id: copyId },
        ...qs.slice(at + 1)
      ];
    });
    setSelectedId(copyId);
  };

  const removeQuestion = (id: string) => {
    const at = draft.questions.findIndex((q) => q.id === id);
    const rest = draft.questions.filter((q) => q.id !== id);
    setQuestions(() => rest);
    setSelectedId(rest[Math.min(at, rest.length - 1)]?.id ?? null);
  };

  /** Suelta la pregunta en la posición `to`, contada antes de sacarla de su lugar. */
  const moveQuestion = (id: string, to: number) =>
    setQuestions((qs) => {
      const from = qs.findIndex((q) => q.id === id);
      if (from < 0) return qs;
      const next = [...qs];
      const [moved] = next.splice(from, 1);
      next.splice(to > from ? to - 1 : to, 0, moved);
      return next;
    });

  /** Subir (-1) o bajar (1) una posición. */
  const moveBy = (id: string, delta: -1 | 1) =>
    setQuestions((qs) => {
      const from = qs.findIndex((q) => q.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= qs.length) return qs;
      const next = [...qs];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });

  /** Sin `after` agrega "Opción N" al final; con `after` deja una vacía debajo. Devuelve su id. */
  const addOption = (id: string, after?: number) => {
    const count = draft.questions.find((q) => q.id === id)?.options?.length ?? 0;
    const option = newOption(after === undefined ? `Opción ${count + 1}` : "");
    patchQuestion(id, (q) => {
      const options = q.options ?? [];
      const at = after === undefined ? options.length : after + 1;
      return { ...q, options: [...options.slice(0, at), option, ...options.slice(at)] };
    });
    return option.id;
  };

  const updateOption = (id: string, optionId: string, label: string) =>
    patchQuestion(id, (q) => ({
      ...q,
      options: q.options?.map((o) => (o.id === optionId ? { ...o, label } : o))
    }));

  /** Una pregunta de selección conserva al menos una opción. */
  const removeOption = (id: string, optionId: string) =>
    patchQuestion(id, (q) =>
      (q.options?.length ?? 0) > 1
        ? { ...q, options: q.options?.filter((o) => o.id !== optionId) }
        : q
    );

  /** POST con todo; PUT solo con lo que cambió. */
  const buildBody = (): IUpsertVisitFormBody => {
    const definition = toDefinition(draft.questions);
    const description = draft.description?.trim() || null;
    if (!form) return { name: draft.name.trim(), description, status: draft.status, definition };
    return {
      ...(draft.name !== initial.name ? { name: draft.name.trim() } : {}),
      ...(draft.description !== initial.description ? { description } : {}),
      ...(draft.status !== initial.status ? { status: draft.status } : {}),
      ...(JSON.stringify(draft.questions) !== JSON.stringify(initial.questions)
        ? { definition }
        : {})
    };
  };

  /** Revisa lo básico, guarda y avisa. Devuelve la encuesta guardada, o null si no se pudo. */
  const publish = async (): Promise<IVisitForm | null> => {
    const problem = firstProblem(draft);
    if (problem) {
      showMessage("warning", problem);
      return null;
    }
    setIsSaving(true);
    setErrors([]);
    try {
      const response = await saveForm(buildBody());
      setInitial(draft);
      showMessage("success", form ? response.message : "Encuesta publicada");
      return response.data;
    } catch (err) {
      // 400 "Formulario inválido" trae en data.errors qué falló en cada pregunta.
      if (err instanceof ApiError && Array.isArray(err.data?.errors)) setErrors(err.data.errors);
      showMessage("error", err instanceof Error ? err.message : "No se pudo publicar la encuesta");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const discard = () => {
    setDraft(initial);
    setErrors([]);
  };

  return {
    form,
    error,
    isLoading,
    draft,
    isDirty,
    selectedId,
    isSaving,
    errors,
    select: setSelectedId,
    setField,
    updateQuestion,
    updateValidation,
    changeType,
    addQuestion,
    duplicateQuestion,
    removeQuestion,
    moveQuestion,
    moveBy,
    addOption,
    updateOption,
    removeOption,
    publish,
    discard,
    clearErrors: () => setErrors([])
  };
};

export type SurveyEditor = ReturnType<typeof useSurveyEditor>;
