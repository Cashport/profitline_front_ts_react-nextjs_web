export type SupportCriticality = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type SupportStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_CLIENT"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type SupportRole = "requester" | "agent";

export interface ISupportFormSubcategory {
  id: number;
  name: string;
  criticality: SupportCriticality;
  criticality_label: string;
  sla_attention_min: number | null;
  sla_resolution_min: number;
}

export interface ISupportFormConfig {
  enabled: boolean;
  can_attend: boolean;
  can_use_desk: boolean;
  categories: { id: number; name: string; subcategories: ISupportFormSubcategory[] }[];
  tags: {
    id: number;
    name: string;
    is_required: boolean;
    applies_to_all: boolean;
    category_ids: number[];
    values: string[];
  }[];
}

export interface ISupportSla {
  attention_min: number | null;
  resolution_min: number;
  attention_due_at: string | null;
  resolution_due_at: string;
  attention_breached: boolean;
  resolution_breached: boolean;
  resolution_used_min: number;
  resolution_left_min: number;
  paused: boolean;
}

export interface ISupportTicket {
  id: number;
  code: string;
  project_id: number;
  project_name: string | null;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  title: string;
  description: string;
  criticality: SupportCriticality;
  criticality_label: string;
  status: SupportStatus;
  status_label: string;
  created_by: { id: number; name: string | null; email: string | null };
  assigned_to: { id: number; name: string | null };
  task: { id: number; code: string | null } | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  attended_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla: ISupportSla;
  my_roles: SupportRole[];
}

export interface ISupportAttachment {
  id: number;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
}

export interface ISupportEvent {
  id: number;
  type: "MESSAGE" | "NOTE" | "AI_SUGGESTION" | "SYSTEM";
  visibility: "PUBLIC" | "INTERNAL";
  event_code: string | null;
  body: string | null;
  meta: Record<string, unknown> | null;
  created_by: { id: number; name: string | null } | null;
  created_at: string;
  attachments: ISupportAttachment[];
}

export interface ISupportDetail {
  ticket: ISupportTicket;
  tags: { tag_id: number; name: string; value: string }[];
  events: ISupportEvent[];
  permissions: {
    can_reply: boolean;
    can_add_note: boolean;
    can_reassign: boolean;
    transitions: { status: SupportStatus; label: string }[];
  };
  assignable_users: { id: number; name: string }[];
}

export interface ISupportList {
  items: ISupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export interface ISupportListParams {
  scope?: "mine" | "assigned" | "project";
  status?: SupportStatus[];
  criticality?: SupportCriticality[];
  project_id?: number[];
  assigned_to?: number[];
  sla?: "overdue" | "due_soon" | "on_time";
  search?: string;
  include_closed?: boolean;
  page?: number;
  limit?: number;
}

export interface ISupportDeskSummary {
  summary: {
    new: number;
    in_progress: number;
    waiting_client: number;
    resolved: number;
    overdue: number;
    due_soon: number;
  };
  projects: { id: number; name: string; open: number }[];
  agents: { id: number; name: string; email: string }[];
}

export interface ISupportSubcategoryConfig {
  id: number;
  project_category_id: number;
  name: string;
  criticality: SupportCriticality | null;
  sla_attention_min: number | null;
  sla_resolution_min: number | null;
  owner_user_id: number | null;
  is_active: boolean;
  effective: {
    criticality: SupportCriticality;
    sla_attention_min: number | null;
    sla_resolution_min: number;
    owner_user_id: number | null;
    owner_name: string | null;
    criticality_inherited: boolean;
    sla_inherited: boolean;
    owner_inherited: boolean;
  };
}

export interface ISupportCategoryConfig {
  category_id: number;
  code: string;
  name: string;
  project_category_id: number | null;
  enabled: boolean;
  is_active: boolean;
  criticality: SupportCriticality | null;
  sla_attention_min: number | null;
  sla_resolution_min: number | null;
  owner_user_id: number | null;
  owner_name: string | null;
  subcategories: ISupportSubcategoryConfig[];
}

export interface ISupportTagConfig {
  id: number;
  name: string;
  source: "MANUAL" | "DATA";
  source_key: string | null;
  is_required: boolean;
  applies_to_all: boolean;
  route_by_value: boolean;
  is_active: boolean;
  category_ids: number[];
  values: { value: string; owner_user_id: number | null; owner_name: string | null }[];
}

export interface ISupportBusinessHour {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface ISupportConfig {
  settings: {
    project_id: number;
    owner_user_id: number;
    owner_name: string | null;
    timezone: string;
    use_holidays: boolean;
  } | null;
  agents: { id: number; name: string }[];
  business_hours: ISupportBusinessHour[];
  business_hours_default: boolean;
  criticalities: { value: SupportCriticality; label: string }[];
  categories: ISupportCategoryConfig[];
  tags: ISupportTagConfig[];
  data_sources: { key: string; label: string }[];
  users: { id: number; name: string }[];
}
