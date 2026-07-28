import { GenericResponse } from "@/types/global/IGlobal";

export interface IFilterItem {
  id: string;
  name: string;
}
export interface IDashboardSalesFilter {
  entity: string;
  items: IFilterItem[];
}

export interface IKpiMetric {
  value: number;
  vs_goal_pct: number | null;
}
export interface IOrdersInProcessKpi {
  value: number;
  count: number;
}
export interface IDashboardSalesKpisMeta {
  period: { start: string; end: string };
  total_goal: number;
}
export interface IDashboardSalesKpis {
  total_revenue: IKpiMetric;
  avg_ticket: IKpiMetric;
  total_orders: IKpiMetric;
  unique_customers: IKpiMetric;
  orders_in_process: IOrdersInProcessKpi;
  meta: IDashboardSalesKpisMeta;
}
export type IDashboardSalesKpisResponse = GenericResponse<IDashboardSalesKpis>;

export interface IDashboardSalesEvolucionPoint {
  date: string;
  value: number;
}
export interface IDashboardSalesEvolucion {
  series: IDashboardSalesEvolucionPoint[];
  period: { start: string; end: string };
  frequency: string;
  cumulative: boolean;
}
export type IDashboardSalesEvolucionResponse = GenericResponse<IDashboardSalesEvolucion>;

export interface IDashboardSalesRankingItem {
  rank: number;
  name: string;
  orders: number;
  units: number;
  sales: number;
  participation_pct: number;
}
export interface IDashboardSalesRanking {
  dimension: string;
  total_entities: number;
  pareto_count: number;
  grand_total: number;
  items: IDashboardSalesRankingItem[];
  period: { start: string; end: string };
}
export type IDashboardSalesRankingResponse = GenericResponse<IDashboardSalesRanking>;

export interface IDashboardSalesClientDetailItem {
  client_id: string;
  client_name: string;
  ventas_mes: number;
  meta: number;
  meta_pct: number | null;
  prom_mensual: number;
  prom_mensual_pct: number | null;
  mes_anterior: number;
  mes_anterior_pct: number | null;
  ytd_anterior: number;
  ytd_actual: number;
  roi_ytd_pct: number | null;
}
export interface IDashboardSalesClientDetail {
  items: IDashboardSalesClientDetailItem[];
  total: number;
  limit: number;
  offset: number;
  periods: Record<
    "mes_actual" | "mes_anterior" | "ytd_actual" | "ytd_anterior",
    { start: string; end: string }
  >;
}
export type IDashboardSalesClientDetailResponse = GenericResponse<IDashboardSalesClientDetail>;

export interface IDashboardSalesTreemapChild {
  key: string;
  value: number;
  percentage: number;
}
export interface IDashboardSalesTreemapGroup {
  key: string;
  value: number;
  percentage: number;
  children: IDashboardSalesTreemapChild[];
}
export interface IDashboardSalesTreemap {
  total: number;
  dim1: string;
  dim2: string;
  revenue_basis: string;
  groups: IDashboardSalesTreemapGroup[];
  period: { start: string; end: string };
}
export type IDashboardSalesTreemapResponse = GenericResponse<IDashboardSalesTreemap>;
