import { useRef } from "react";

import { IBalanceRow, IGetBalances } from "@/types/financialDiscounts/IFinancialDiscounts";

// The saldos context only stores ids, so every row seen is cached to keep the selection
// total stable while a search, filter or refetch drops selected rows from `groups`.
export const useSelectedBalances = (groups: IGetBalances[] | undefined, selectedIds: string[]) => {
  const seenBalances = useRef(new Map<string, IBalanceRow>());

  groups?.forEach((group) =>
    group.balances.forEach((balance) => seenBalances.current.set(String(balance.id), balance))
  );

  const selectedBalances = selectedIds
    .map((id) => seenBalances.current.get(id))
    .filter((balance): balance is IBalanceRow => balance !== undefined);

  // pending_amount is a SQL decimal that may arrive as a string
  const totalPending = selectedBalances.reduce(
    (acc, balance) => acc + Number(balance.pending_amount),
    0
  );

  return { selectedBalances, totalPending };
};
