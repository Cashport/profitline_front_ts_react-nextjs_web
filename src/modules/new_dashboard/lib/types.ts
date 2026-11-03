export interface CityMetric {
  city: string;
  total: number;
  percentage: number;
  current: number;
  d0_30: number;
  d30_60: number;
  d60_90: number;
  d90_180: number;
  gt180: number;
}

export interface CustomerRisk {
  id: string;
  name: string;
  portfolio: number;
  overdue: number;
  overduePercentage: number;
  visits: number;
  news: number;
  risk: "Alto" | "Medio alto" | "Medio" | "Medio bajo" | "Bajo";
  lat: number;
  lng: number;
}

export interface CollectionData {
  day: number;
  goal: number;
  actual: number | null;
  forecast: number | null;
}

/** Tramo de edad de cartera: su nombre sale de `newDashboard.ages.<clave>`. */
export type PortfolioAgeKey = "current" | "d0_30" | "d30_60" | "d60_90" | "gt90";

export interface PortfolioAge {
  key: PortfolioAgeKey;
  value: number;
  color: string;
}

export enum Tab {
  COLLECTION = "collection", // Recaudo
  PORTFOLIO = "portfolio", // Cartera
  MANAGEMENT = "management", // Gestión
  MAP = "map" // Mapa
}
