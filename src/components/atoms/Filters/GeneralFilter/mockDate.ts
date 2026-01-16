// simulateApiCalls.ts

import { FilterOption } from "./GeneralFilter";

export const getFilters = (): Promise<FilterOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "location",
          name: "Ubicación"
        },
        { id: "category", name: "Categoría" },
        { id: "price", name: "Precio" }
      ]);
    }, 500);
  });
};
export const getLocations = (parentIds: string[]): Promise<FilterOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (parentIds.length === 0) {
        resolve([
          { id: "country1", name: "País 1", children: [] },
          { id: "country2", name: "País 2", children: [] }
        ]);
      } else if (parentIds.length === 1) {
        const countryId = parentIds[0];
        if (countryId === "country1") {
          resolve([
            { id: "city1_1", name: "Ciudad 1 (País 1)" },
            { id: "city1_2", name: "Ciudad 2 (País 1)" }
          ]);
        } else if (countryId === "country2") {
          resolve([
            { id: "city2_1", name: "Ciudad 1 (País 2)" },
            { id: "city2_2", name: "Ciudad 2 (País 2)" }
          ]);
        } else {
          resolve([]);
        }
      } else {
        resolve([]);
      }
    }, 500);
  });
};
export const getCategories = (parentIds: string[]): Promise<FilterOption[]> => {
  return new Promise((resolve) => {
    if (parentIds.length === 0) {
      resolve([
        { id: "cat1", name: "Categoría 1" },
        { id: "cat2", name: "Categoría 2" }
      ]);
    } else {
      resolve([]);
    }
  });
};

export const getPrices = (): Promise<FilterOption[]> => {
  return new Promise((resolve) => {
    resolve([
      { id: "low", name: "Bajo" },
      { id: "medium", name: "Medio" },
      { id: "high", name: "Alto" }
    ]);
  });
};
