import { CityMetric, CollectionData, CustomerRisk, PortfolioAge } from './types';

// Design System Colors
export const COLORS = {
  black: '#141414',
  green: '#CBE71E',
  grayLight: '#DDDDDD',
  grayLighter: '#F7F7F7',
  white: '#FFFFFF',
  // Status colors for risk
  riskHigh: '#EF4444',
  riskMediumHigh: '#F97316',
  riskMedium: '#141414',
  riskMediumLow: '#10B981',
  riskLow: '#22C55E',
};

// Mapbox Token - REPLACE THIS WITH YOUR OWN TOKEN
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrY3Z5b2w1ejBjc2oyc3F4d2x5eHp4Z2wifQ.JqJtVl-Q5y0j7_KjG2rQxQ'; // Placeholder public token, likely rate limited. Use your own.

// Mock Data: Portfolio Overview
export const PORTFOLIO_AGES: PortfolioAge[] = [
  { name: 'Corriente', value: 65, color: '#141414' },
  { name: '0 a 30', value: 15, color: '#2563EB' },
  { name: '30 a 60', value: 10, color: '#F97316' },
  { name: '60 a 90', value: 5, color: 'rgba(124, 58, 237, 1)' },
  { name: '> 90', value: 5, color: '#DB2777' },
];

export const COLLECTION_TREND: CollectionData[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const currentDay = 12; // Simulate we are on day 12
  
  // Goal: 150 Billion for 30 days => 5 Billion per day
  const goalBase = 5000000000; 
  const goal = goalBase * day;
  
  let actual: number | null = null;
  let forecast: number | null = null;

  // Logic for Actuals
  if (day <= currentDay) {
      // Simulate a random curve
      // On day 5, let's simulate a 0 value to test the "0 vs null" logic if needed, 
      // but generally keep it realistic.
      actual = goal * (0.9 + Math.random() * 0.15);
  }

  // Logic for Forecast
  if (day >= currentDay) {
      // Forecast starts from the last actual point (or projected point) to ensure visual connectivity
      if (day === currentDay) {
          // Connect to actual
          forecast = actual; 
      } else {
          // Project growth
          const previousGoal = goalBase * (day - 1);
          forecast = previousGoal * 1.1 + (goalBase * 1.1); // Simple linear projection
      }
  }
  
  return {
    day,
    goal,
    actual,
    forecast,
  };
});

export const CITY_METRICS: CityMetric[] = [
  { city: 'Bogotá', total: 197854845411, percentage: 79.23, current: 158283876329, d0_30: 15828387633, d30_60: 7914193816, d60_90: 3957096908, d90_180: 3957096908, gt180: 3957096908 },
  { city: 'Medellín', total: 11710835119, percentage: 4.69, current: 9368668095, d0_30: 936866809, d30_60: 468433405, d60_90: 234216702, d90_180: 234216702, gt180: 234216702 },
  { city: 'Cali', total: 10057328968, percentage: 4.03, current: 8045863174, d0_30: 804586317, d30_60: 402293159, d60_90: 201146579, d90_180: 201146579, gt180: 201146579 },
  { city: 'Barranquilla', total: 6632122548, percentage: 2.66, current: 5305698038, d0_30: 530569804, d30_60: 265284902, d60_90: 132642451, d90_180: 132642451, gt180: 132642451 },
  { city: 'Ibagué', total: 2917940363, percentage: 1.17, current: 2334352291, d0_30: 233435229, d30_60: 116717615, d60_90: 58358807, d90_180: 58358807, gt180: 58358807 },
  { city: 'Santa Marta', total: 2345130583, percentage: 0.94, current: 1876104466, d0_30: 187610447, d30_60: 93805223, d60_90: 46902612, d90_180: 46902612, gt180: 46902612 },
];

// Mock Data: Management
export const CUSTOMERS_RISK: CustomerRisk[] = [
  { id: '1', name: 'Carulla', portfolio: 17170706283, overdue: 11504373210, overduePercentage: 67.0, visits: 0, news: 0, risk: 'Medio alto', lat: 4.656, lng: -74.056 },
  { id: '2', name: 'Makro', portfolio: 16882122985, overdue: 12661592238, overduePercentage: 75.0, visits: 0, news: 0, risk: 'Alto', lat: 4.698, lng: -74.082 },
  { id: '3', name: 'Tiendas Ara', portfolio: 16882122985, overdue: 7765776573, overduePercentage: 46.0, visits: 0, news: 0, risk: 'Medio', lat: 6.251, lng: -75.563 },
  { id: '4', name: 'Grupo Éxito', portfolio: 16449248036, overdue: 15133308193, overduePercentage: 92.0, visits: 1, news: 3, risk: 'Alto', lat: 3.451, lng: -76.532 },
  { id: '5', name: 'Jumbo', portfolio: 15583498140, overdue: 311669962, overduePercentage: 2.0, visits: 0, news: 0, risk: 'Bajo', lat: 10.968, lng: -74.801 },
  { id: '6', name: 'Alkosto', portfolio: 15439206490, overdue: 10807444543, overduePercentage: 70.0, visits: 0, news: 0, risk: 'Alto', lat: 4.813, lng: -75.694 },
  { id: '7', name: 'Olímpica', portfolio: 15150623191, overdue: 8029830291, overduePercentage: 53.0, visits: 0, news: 0, risk: 'Medio alto', lat: 10.391, lng: -75.481 },
  { id: '8', name: 'Tiendas D1', portfolio: 15006331542, overdue: 600253261, overduePercentage: 4.0, visits: 0, news: 0, risk: 'Bajo', lat: 7.125, lng: -73.120 },
  { id: '9', name: 'Metro', portfolio: 13707706697, overdue: 3838157875, overduePercentage: 28.0, visits: 0, news: 0, risk: 'Medio', lat: 4.580, lng: -74.220 },
  { id: '10', name: 'Supermercados ABC', portfolio: 1188984848, overdue: 59449242, overduePercentage: 5.0, visits: 0, news: 0, risk: 'Bajo', lat: 4.440, lng: -75.240 },
  { id: '11', name: 'Surtimax', portfolio: 1169493293, overdue: 210508792, overduePercentage: 18.0, visits: 0, news: 0, risk: 'Medio bajo', lat: 11.240, lng: -74.200 },
  { id: '12', name: 'PriceSmart', portfolio: 1159747516, overdue: 23194950, overduePercentage: 2.0, visits: 0, news: 0, risk: 'Bajo', lat: 4.860, lng: -74.030 },
  { id: '13', name: 'Mercaldas', portfolio: 1140255961, overdue: 34207678, overduePercentage: 3.0, visits: 0, news: 0, risk: 'Bajo', lat: 5.070, lng: -75.510 },
];

export const RISK_STATS = [
  { label: 'Alto', value: 4, percentage: '4 %', color: COLORS.riskHigh },
  { label: 'Medio alto', value: 11, percentage: '11 %', color: COLORS.riskMediumHigh },
  { label: 'Medio', value: 24, percentage: '24 %', color: COLORS.riskMedium },
  { label: 'Medio bajo', value: 23, percentage: '23 %', color: COLORS.riskMediumLow },
  { label: 'Bajo', value: 38, percentage: '38 %', color: COLORS.riskLow },
];

export const STRATEGIES_DATA = [
  { type: 'Paretos', cartera: 142271566352, percentage: 52.74, visits: 1, news: 3 },
  { type: 'Superetes', cartera: 42608539004, percentage: 15.79, visits: 0, news: 0 },
  { type: 'Cadenas restaurantes', cartera: 37403392362, percentage: 13.86, visits: 0, news: 0 },
  { type: 'Tiendas', cartera: 26364419090, percentage: 9.77, visits: 696, news: 1280 },
  { type: 'Tienda mayorista', cartera: 21133620939, percentage: 7.83, visits: 3, news: 7 },
];