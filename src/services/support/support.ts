import { GenericResponse } from "@/types/global/IGlobal";
import type {
  ISupportBusinessHour,
  ISupportConfig,
  ISupportDeskSummary,
  ISupportDetail,
  ISupportFormConfig,
  ISupportList,
  ISupportListParams,
  ISupportTicket,
  SupportCriticality,
  SupportStatus
} from "@/types/support/ISupport";
import { API } from "@/utils/api/api";

const qs = (p: ISupportListParams) => ({
  ...p,
  status: p.status?.join(",") || undefined,
  criticality: p.criticality?.join(",") || undefined,
  project_id: p.project_id?.join(",") || undefined,
  assigned_to: p.assigned_to?.join(",") || undefined,
  search: p.search || undefined
});

const base = (desk: boolean) => (desk ? "/support/desk/tickets" : "/support/tickets");

export const getSupportFormConfig = async () => {
  const r: GenericResponse<ISupportFormConfig> = await API.get("/support/form-config");
  return r.data;
};

export const createSupportTicket = async (input: {
  subcategory_id: number;
  title: string;
  description: string;
  tags: Record<string, string>;
  files: File[];
}) => {
  const form = new FormData();
  form.append("subcategory_id", String(input.subcategory_id));
  form.append("title", input.title);
  form.append("description", input.description);
  form.append("tags", JSON.stringify(input.tags));
  input.files.forEach((f) => form.append("files", f));
  const r: GenericResponse<ISupportTicket> = await API.post("/support/tickets", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return r.data;
};

export const getSupportTickets = async (params: ISupportListParams, desk = false) => {
  const r: GenericResponse<ISupportList> = await API.get(base(desk), { params: qs(params) });
  return r.data;
};

export const getSupportTicket = async (id: number, desk = false) => {
  const r: GenericResponse<ISupportDetail> = await API.get(`${base(desk)}/${id}`);
  return r.data;
};

export const getSupportTicketByTask = async (taskId: number) => {
  const r: GenericResponse<ISupportDetail | null> = await API.get(
    `/support/tickets/by-task/${taskId}`
  );
  return r.data;
};

export const sendSupportMessage = async (
  id: number,
  input: { body: string; internal: boolean; files: File[] },
  desk = false
) => {
  const form = new FormData();
  form.append("body", input.body);
  form.append("internal", String(input.internal));
  input.files.forEach((f) => form.append("files", f));
  const r: GenericResponse<ISupportDetail> = await API.post(`${base(desk)}/${id}/messages`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return r.data;
};

export const changeSupportStatus = async (
  id: number,
  status: SupportStatus,
  comment?: string | null,
  desk = false
) => {
  const r: GenericResponse<ISupportDetail> = await API.patch(`${base(desk)}/${id}/status`, {
    status,
    comment: comment?.trim() || null
  });
  return r.data;
};

export const reassignSupportTicket = async (id: number, userId: number, desk = false) => {
  const r: GenericResponse<ISupportDetail> = await API.patch(`${base(desk)}/${id}/assignee`, {
    user_id: userId
  });
  return r.data;
};

export const downloadSupportAttachment = async (
  ticketId: number,
  attachmentId: number,
  fileName: string,
  desk = false
) => {
  const blob: Blob = await API.get(`/support/tickets/${ticketId}/attachments/${attachmentId}`, {
    params: desk ? { desk: true } : undefined,
    responseType: "blob"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const getSupportDeskSummary = async (projectIds?: number[]) => {
  const r: GenericResponse<ISupportDeskSummary> = await API.get("/support/desk/summary", {
    params: { project_id: projectIds?.join(",") || undefined }
  });
  return r.data;
};

export const getSupportConfig = async () => {
  const r: GenericResponse<ISupportConfig> = await API.get("/support/config");
  return r.data;
};

export const saveSupportSettings = async (input: {
  owner_user_id: number;
  timezone?: string;
  use_holidays?: boolean;
  business_hours?: ISupportBusinessHour[];
  agent_user_ids?: number[];
}) => {
  const r: GenericResponse<ISupportConfig> = await API.put("/support/config/settings", input);
  return r.data;
};

export interface SupportRuleInput {
  criticality: SupportCriticality | null;
  sla_attention_min: number | null;
  sla_resolution_min: number | null;
  owner_user_id: number | null;
  is_active: boolean;
}

export const saveSupportCategory = async (categoryId: number, input: SupportRuleInput) => {
  const r: GenericResponse<ISupportConfig> = await API.put(
    `/support/config/categories/${categoryId}`,
    input
  );
  return r.data;
};

export const saveSupportSubcategory = async (
  id: number | null,
  input: SupportRuleInput & { name: string; project_category_id?: number }
) => {
  const r: GenericResponse<ISupportConfig> = id
    ? await API.put(`/support/config/subcategories/${id}`, input)
    : await API.post("/support/config/subcategories", input);
  return r.data;
};

export interface SupportTagInput {
  name: string;
  source: "MANUAL" | "DATA";
  source_key: string | null;
  is_required: boolean;
  applies_to_all: boolean;
  route_by_value: boolean;
  is_active: boolean;
  category_ids: number[];
  values: { value: string; owner_user_id: number | null }[];
}

export const saveSupportTag = async (id: number | null, input: SupportTagInput) => {
  const r: GenericResponse<ISupportConfig> = id
    ? await API.put(`/support/config/tags/${id}`, input)
    : await API.post("/support/config/tags", input);
  return r.data;
};

export const deleteSupportTag = async (id: number) => {
  const r: GenericResponse<ISupportConfig> = await API.delete(`/support/config/tags/${id}`);
  return r.data;
};

export const getSupportDataSourceValues = async (key: string) => {
  const r: GenericResponse<string[]> = await API.get(`/support/config/data-sources/${key}`);
  return r.data;
};
