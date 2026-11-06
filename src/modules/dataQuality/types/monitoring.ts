export type MonitoringFileState = "received" | "novelty" | "pending";
export type MonitoringSeverity = "critical" | "late" | "novelty" | "received";
export type MonitoringAlertType = "password" | "no_email" | "format" | "automation" | "missing";
export type MonitoringPeriodicity = "Daily" | "Weekly" | "Monthly";

export interface IMonitoringFileCounts {
  expected_files: number;
  received_files: number;
  novelty_files: number;
  pending_files: number;
}

export interface IMonitoringClientRow extends IMonitoringFileCounts {
  client_id: number;
  client_name: string;
  status: MonitoringFileState;
  severity: MonitoringSeverity;
  periodicity: MonitoringPeriodicity | null;
  channel: string | null;
  last_received: string | null;
  oldest_missing_date: string | null;
  days_late: number;
  missing_files: number;
  alert_type: MonitoringAlertType | null;
}

export interface IMonitoringSummary {
  country: { id: number; name: string };
  period: { month: string; from: string; cutoff: string };
  clients_total: number;
  reception: IMonitoringFileCounts & {
    missing_files: number;
    received_pct: number | null;
    late_over_5_days: { clients: number; files: number };
    late_1_to_5_days: { clients: number; files: number };
    by_periodicity: Array<
      IMonitoringFileCounts & { periodicity: MonitoringPeriodicity; clients: number }
    >;
  };
  quality: {
    units_total: number;
    unhomologated_units: number;
    homologated_pct: number | null;
    top_impact: Array<{ client_id: number; client_name: string; unhomologated_units: number }>;
  };
  anomalies: {
    threshold_pct: number;
    baseline_months: number;
    increases: number;
    decreases: number;
    items: Array<{
      client_id: number;
      client_name: string;
      current_units: number;
      average_units: number;
      variation_pct: number;
    }>;
  };
  alerts: {
    total: number;
    by_type: Record<MonitoringAlertType, number>;
    items: Array<{
      client_id: number;
      client_name: string;
      type: MonitoringAlertType;
      since: string;
      days_late: number;
      pending_files: number;
    }>;
  };
  clients: IMonitoringClientRow[];
}

export interface IMonitoringSubscription {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string | null;
  email: string;
  country_id: number;
  country_name: string | null;
  send_email: boolean;
  send_teams: boolean;
  is_active: boolean;
}

export interface IMonitoringSubscriptionsData {
  subscriptions: IMonitoringSubscription[];
  users: Array<{ id: number; name: string; email: string }>;
  teams_enabled: boolean;
}

export interface IMonitoringSubscriptionInput {
  user_id: number;
  country_id: number;
  send_email: boolean;
  send_teams: boolean;
  is_active?: boolean;
}

export type MonitoringTestResult = Record<"email" | "teams", string | null>;
