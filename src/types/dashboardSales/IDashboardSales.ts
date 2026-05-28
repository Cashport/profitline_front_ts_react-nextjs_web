export interface IFilterItem {
  id: string;
  name: string;
}
export interface IDashboardSalesFilter {
  entity: string;
  items: IFilterItem[];
}
