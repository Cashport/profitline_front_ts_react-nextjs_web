import { useMemo, useState } from "react";
import useSWR from "swr";

import { ApiError, fetcher } from "@/utils/api/api";
import { createClaim, deleteClaim, updateClaim } from "@/services/claims/claims";

import { MessageType } from "@/context/MessageContext";
import { GenericResponsePage } from "@/types/global/IGlobal";
import {
  ClaimStatus,
  IClaim,
  ICreateClaimPayload,
  IUpdateClaimPayload
} from "@/types/claims/IClaims";

// eslint-disable-next-line no-unused-vars
type ShowMessage = (type: MessageType, content: string) => void;

interface UseInvoiceClaimsProps {
  invoiceId?: number;
  status?: ClaimStatus;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * The endpoint is paginated but the modal needs every claim at once: its footer compares the sum of
 * all the claims against the invoice value, and a partial page would silently understate it.
 */
const DEFAULT_LIMIT = 50;

export const useInvoiceClaims = ({
  invoiceId,
  status,
  page = 1,
  limit = DEFAULT_LIMIT,
  enabled = true
}: UseInvoiceClaimsProps) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const statusParam = status ? `&status=${status}` : "";

  const { data, isLoading, error, mutate } = useSWR<GenericResponsePage<IClaim[]>>(
    enabled && invoiceId
      ? `/invoice/${invoiceId}/claims?page=${page}&limit=${limit}${statusParam}`
      : null,
    fetcher
  );

  const addClaim = async (payload: ICreateClaimPayload, showMessage: ShowMessage) => {
    setIsActionLoading(true);
    try {
      await createClaim(payload);
      showMessage("success", "Glosa creada exitosamente");
    } catch (err) {
      showMessage("error", err instanceof ApiError ? err.message : "Error al crear la glosa");
      return false;
    } finally {
      mutate();
      setIsActionLoading(false);
    }
    return true;
  };

  const editClaim = async (
    claimId: number,
    payload: IUpdateClaimPayload,
    showMessage: ShowMessage
  ) => {
    setIsActionLoading(true);
    try {
      await updateClaim(claimId, payload);
      showMessage("success", "Glosa actualizada exitosamente");
    } catch (err) {
      showMessage("error", err instanceof ApiError ? err.message : "Error al actualizar la glosa");
      return false;
    } finally {
      mutate();
      setIsActionLoading(false);
    }
    return true;
  };

  const removeClaim = async (claimId: number, showMessage: ShowMessage) => {
    setIsActionLoading(true);
    try {
      await deleteClaim(claimId);
      showMessage("success", "Glosa eliminada exitosamente");
    } catch (err) {
      showMessage("error", err instanceof ApiError ? err.message : "Error al eliminar la glosa");
      return false;
    } finally {
      mutate();
      setIsActionLoading(false);
    }
    return true;
  };

  // memoized so consumers can depend on it in an effect without looping
  const claims = useMemo(() => data?.data ?? [], [data]);

  return {
    claims,
    pagination: data?.pagination ?? {
      actualPage: page,
      rowsperpage: limit,
      totalPages: 0,
      totalRows: 0
    },
    loading: isLoading,
    error,
    mutate,
    isActionLoading,
    addClaim,
    editClaim,
    removeClaim
  };
};
