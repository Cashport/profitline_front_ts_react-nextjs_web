import useSWR from "swr";

import {
  getBalancesByFinancialRecord,
  IInvoiceBalance
} from "@/services/balances/balances";

/**
 * HU Galderma — "Ver Saldos": balances (`balances.financial_record_id`)
 * asociados a una factura. Solo lectura.
 */
export const useInvoiceBalances = (invoiceId?: number, enabled = true) => {
  const { data, isLoading, error, mutate } = useSWR<IInvoiceBalance[]>(
    enabled && invoiceId ? ["invoice-balances", invoiceId] : null,
    () =>
      getBalancesByFinancialRecord(invoiceId as number).then(
        (response) => response.data ?? []
      )
  );

  return {
    balances: data ?? [],
    loading: isLoading,
    error,
    mutate
  };
};
