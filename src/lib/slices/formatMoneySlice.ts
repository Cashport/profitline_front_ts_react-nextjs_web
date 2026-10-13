/* eslint-disable no-unused-vars */

interface IFormatMoneyOptions {
  hideCurrencySymbol?: boolean;
  locale?: string;
  currency?: string;
  hideDecimals?: boolean;
  scale?: number; // Scale factor
}
export interface IFormatMoneyStore {
  locale: string; // Global default locale
  currency: string; // Global default currency
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  formatMoney: (
    amount: string | number | undefined | null,
    options?: IFormatMoneyOptions
  ) => string;
}

export const formatMoneySlice = (set: any, get: any): IFormatMoneyStore => ({
  locale: "es-CO",
  currency: "COP",
  setLocale: (locale: string) => set({ locale }),
  setCurrency: (currency: string) => set({ currency }),
  formatMoney: (
    amount: string | number | undefined | null,

    options?: IFormatMoneyOptions
  ): string => {
    const {
      locale,
      currency,
      hideCurrencySymbol = false,
      hideDecimals = false,
      scale
    } = options || {};

    const finalLocale = locale || get().locale;
    const finalCurrency = currency || get().currency;
    const finalHideCurrencySymbol = hideCurrencySymbol;
    const scaleFactor = scale ?? 0;

    try {
      const formatter = new Intl.NumberFormat(finalLocale, {
        style: "currency",
        currency: finalCurrency,
        maximumFractionDigits: hideDecimals ? 0 : 2
      });

      if (!amount) {
        if (finalHideCurrencySymbol) {
          return formatter.format(0).replace(/[^\d.,-]/g, "");
        }
        return formatter.format(0);
      }

      const parsedNum = typeof amount === "string" ? parseFloat(amount) : amount;
      let number = parsedNum;
      for (let i = 0; i < scaleFactor; i++) {
        number /= 10; // divides
      }

      if (finalHideCurrencySymbol) {
        return formatter.format(number).replace(/[^\d.,-]/g, "");
      }

      if (hideDecimals) {
        const noDecimalNumber = Math.floor(number);
        return formatter.format(noDecimalNumber);
      }

      return formatter.format(number);
    } catch (error) {
      console.error("Error formatting money", error);
      return amount?.toString() || "0";
    }
  }
});
