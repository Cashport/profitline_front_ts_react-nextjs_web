import useSWR, { useSWRConfig } from "swr";

import { createVisitForm, updateVisitForm } from "@/services/surveys/surveys";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IUpsertVisitFormBody, IVisitForm } from "@/types/surveys/ISurveys";
import { fetcher } from "@/utils/api/api";

/**
 * Una encuesta con su versión vigente (GET /visit-forms/:form_id). Sin `formId`
 * (encuesta nueva) no pide nada y `saveForm` crea en vez de actualizar.
 */
export const useVisitForm = (formId?: number) => {
  const { mutate } = useSWRConfig();
  const id = formId !== undefined && Number.isInteger(formId) && formId > 0 ? formId : null;
  const { data, error, isLoading } = useSWR<GenericResponse<IVisitForm>>(
    id !== null ? `/visit-forms/${id}` : null,
    fetcher,
    // No se pisa lo que se está editando si la pestaña recupera el foco.
    { revalidateOnFocus: false }
  );

  /** POST o PUT; deja la respuesta como el detalle en caché y refresca el listado y los creadores. */
  const saveForm = async (body: IUpsertVisitFormBody) => {
    const response = id !== null ? await updateVisitForm(id, body) : await createVisitForm(body);
    await mutate(`/visit-forms/${response.data.id}`, response, { revalidate: false });
    mutate((key) => Array.isArray(key) && key[0] === "/visit-forms");
    mutate("/visit-forms/creators");
    return response;
  };

  return { form: data?.data, error, isLoading, saveForm };
};
