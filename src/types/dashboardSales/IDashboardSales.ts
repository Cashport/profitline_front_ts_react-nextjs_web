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
