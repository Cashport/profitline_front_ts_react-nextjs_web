export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactCurrency = (value: number) => {
  if (value >= 1000000000) {
      return `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value / 1000000000)} MRD`;
  }
  if (value >= 1000000) {
      return `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value / 1000000)} M`;
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(2)} %`;
};