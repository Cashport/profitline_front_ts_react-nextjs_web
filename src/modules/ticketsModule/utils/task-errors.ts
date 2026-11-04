import type { ITaskConfig } from "@/types/tickets/ITickets";

interface ValidationIssue {
  path?: string;
  msg?: string;
}

/**
 * Mensaje de un error al crear o editar. Si el back devuelve los campos
 * inválidos (400 "Invalid params"), los nombra con la etiqueta del formulario
 * en vez de mostrar el texto técnico.
 */
export function taskErrorMessage(error: unknown, config: ITaskConfig, fallback: string): string {
  const data = (error as { data?: unknown } | null)?.data;
  if (Array.isArray(data) && data.length) {
    const labels = Array.from(
      new Set(
        (data as ValidationIssue[])
          .map((issue) => {
            const field = config.fields.find((f) => f.body_key === issue?.path);
            return field?.label ?? issue?.path ?? "";
          })
          .filter(Boolean)
      )
    );
    if (labels.length) {
      return `Revisa ${labels.length === 1 ? "el campo" : "los campos"}: ${labels.join(", ")}`;
    }
  }
  return (error as Error | null)?.message || fallback;
}
