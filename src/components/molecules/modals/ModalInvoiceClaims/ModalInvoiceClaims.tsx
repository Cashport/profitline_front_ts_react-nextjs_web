"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import { ConfigProvider, Flex, Modal, Select, Table, Typography } from "antd";
import { Plus, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useInvoiceClaims } from "@/hooks/useInvoiceClaims";
import { useMessageApi } from "@/context/MessageContext";
import { getClaimStatuses } from "@/services/claims/claims";

import UiSearchInput from "@/components/ui/search-input";
import { getClaimsColumns } from "./columns";
import { FALLBACK_STATUS_COLOR } from "./constants";
import { createEmptyRow, mapClaimToRow, rowToCreatePayload, rowToPayload } from "./utils";

import { ClaimsForm, ClaimTableRow, IInvoiceClaimRow } from "./types";
import { ClaimStatus } from "@/types/claims/IClaims";
import { IInvoice } from "@/types/invoices/IInvoices";

import "./modalInvoiceClaims.scss";

const { Title } = Typography;

interface ModalInvoiceClaimsProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IInvoice | null;
}

const ALL_ESTADOS = "Todos";

export const ModalInvoiceClaims = ({ isOpen, onClose, invoice }: ModalInvoiceClaimsProps) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { showMessage } = useMessageApi();

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<ClaimStatus | typeof ALL_ESTADOS>(ALL_ESTADOS);
  // Several rows can be open at once, so each is tracked by its fieldId — stable when
  // removing a row shifts the indexes of the ones after it
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Values of each row being edited, kept to restore them when the edit is cancelled
  const editSnapshots = useRef(new Map<string, IInvoiceClaimRow>());

  const { claims, loading, addClaim, editClaim, removeClaim } = useInvoiceClaims({
    invoiceId: invoice?.id,
    status: estadoFilter === ALL_ESTADOS ? undefined : estadoFilter,
    enabled: isOpen
  });

  // The catalog is static and the modal remounts on every open (destroyOnClose), so it is cached
  const {
    data: statusesData,
    isLoading: statusesLoading,
    error: statusesError
  } = useSWR("/claims/statuses", getClaimStatuses, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000
  });

  const statuses = useMemo(() => statusesData?.data ?? [], [statusesData]);

  const statusOptions = useMemo(
    () => statuses.map((status) => ({ value: status.description, label: status.status_name })),
    [statuses]
  );

  const statusByCode = useMemo(
    () => new Map(statuses.map((status) => [status.description, status])),
    [statuses]
  );

  /** New rows are seeded with the first catalog entry, empty while it is still loading */
  const defaultStatus = statuses[0]?.description ?? "";

  const { control, watch, reset, trigger, getValues, setValue } = useForm<ClaimsForm>({
    mode: "onChange",
    defaultValues: { claims: [] }
  });

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "claims",
    keyName: "fieldId"
  });

  useEffect(() => {
    if (!isOpen) return;
    setEditingIds([]);
    editSnapshots.current.clear();
    setEstadoFilter(ALL_ESTADOS);
    setSearch("");
  }, [isOpen, invoice?.id]);

  // Without the catalog the Estado cell has nothing to offer, which would otherwise fail silently
  useEffect(() => {
    if (isOpen && statusesError) showMessage("error", "No se pudieron cargar los estados de glosa");
  }, [isOpen, statusesError]);

  // Seeds the table from the server. Skipped while there is unsaved work on screen so a background
  // revalidation cannot wipe a row the user is in the middle of.
  useEffect(() => {
    if (!isOpen) return;
    const hasUnsavedRows = getValues("claims")?.some((claim) => claim._new);
    if (editingIds.length || hasUnsavedRows) return;
    reset({ claims: claims.map((claim) => mapClaimToRow(claim, defaultStatus)) });
  }, [claims, isOpen, defaultStatus]);

  const formClaims = watch("claims");

  const rows: ClaimTableRow[] = useMemo(
    () =>
      fields.map((field, index) => ({
        ...field,
        ...formClaims[index],
        fieldId: field.fieldId,
        index,
        key: field.fieldId
      })),
    [fields, formClaims]
  );

  // A row that was never saved is unsaved by definition, so it is always open for editing
  const isRowEditing = (row: ClaimTableRow) => !!row._new || editingIds.includes(row.fieldId);

  // The estado filter is resolved server side, only the search is applied here
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return rows;
    return rows.filter((row) => {
      // rows being edited stay visible even if their new values no longer match the search
      if (isRowEditing(row)) return true;
      return (
        row.claimNumber?.toLowerCase().includes(query) ||
        row.concepto?.toLowerCase().includes(query) ||
        row.observacion?.toLowerCase().includes(query)
      );
    });
  }, [rows, search, editingIds]);

  const counts = useMemo(
    () =>
      rows.reduce<Partial<Record<ClaimStatus, number>>>((acc, row) => {
        acc[row.estado] = (acc[row.estado] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  const claimsTotal = rows.reduce((sum, row) => sum + (row.monto || 0), 0);
  const invoiceTotal = invoice?.current_value || 0;
  const isBalanced = claimsTotal === invoiceTotal;

  const closeEdit = (fieldId: string) => {
    editSnapshots.current.delete(fieldId);
    setEditingIds((prev) => prev.filter((id) => id !== fieldId));
  };

  const handleStartEdit = (row: ClaimTableRow) => {
    // cloned: getValues hands back the live row object, which the inputs mutate in place
    editSnapshots.current.set(row.fieldId, { ...getValues(`claims.${row.index}`) });
    setEditingIds((prev) => [...prev, row.fieldId]);
  };

  const handleSave = async (row: ClaimTableRow) => {
    if (!invoice) return;
    const isValid = await trigger(`claims.${row.index}`);
    if (!isValid) return showMessage("error", "Completa los campos obligatorios");

    const values = getValues(`claims.${row.index}`);

    setSavingId(row.fieldId);
    try {
      if (values.claimId) {
        const updated = await editClaim(values.claimId, rowToPayload(values), showMessage);
        if (!updated) return;
      } else {
        const created = await addClaim(rowToCreatePayload(values, invoice.id), showMessage);
        if (!created) return;
        if (created.id) {
          // stamped in place so the row keeps its position while its siblings are still unsaved
          setValue(`claims.${row.index}`, {
            ...values,
            claimId: created.id,
            claimNumber: created.claim_number,
            _new: false
          });
        } else {
          // the API did not echo the claim, drop the row and let the refetch be the source of
          // truth — saving it again would create a duplicate
          remove(row.index);
        }
      }
      closeEdit(row.fieldId);
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = (row: ClaimTableRow) => {
    const snapshot = editSnapshots.current.get(row.fieldId);
    if (getValues(`claims.${row.index}._new`)) {
      remove(row.index);
    } else if (snapshot) {
      setValue(`claims.${row.index}`, snapshot);
    }
    closeEdit(row.fieldId);
  };

  const handleDelete = (row: ClaimTableRow) => {
    closeEdit(row.fieldId);
    // never saved rows only exist in the form, nothing to delete server side
    if (!row.claimId) return remove(row.index);

    Modal.confirm({
      title: "Eliminar glosa",
      content: `¿Deseas eliminar la glosa ${row.claimNumber}? Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      onOk: async () => {
        const success = await removeClaim(row.claimId as number, showMessage);
        // dropped locally too: the refetch cannot reseed the table while other rows are unsaved
        if (success) remove(row.index);
      }
    });
  };

  // A duplicate is inserted unsaved so nothing hits the API until the user confirms it
  const handleDuplicate = (row: ClaimTableRow) => {
    const values = getValues(`claims.${row.index}`);
    insert(row.index + 1, { ...values, claimId: null, claimNumber: "", _new: true });
  };

  const handleAddRow = () => {
    if (!invoice) return;
    // defaultStatus is "" when the catalog is unavailable — the row is still added, and its Estado
    // shows the required error instead of the button being silently dead
    append(createEmptyRow(defaultStatus));
  };

  return (
    <Modal
      className="modalInvoiceClaims"
      width="95%"
      centered
      footer={null}
      closable={false}
      destroyOnClose
      open={isOpen}
      onCancel={onClose}
    >
      <div className="modalInvoiceClaims__header">
        <Title level={4}>
          Glosas de <span className="modalInvoiceClaims__invoiceId">{invoice?.id_erp}</span>
        </Title>
        <button className="modalInvoiceClaims__closeBtn" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>

      <div className="modalInvoiceClaims__toolbar">
        <UiSearchInput
          placeholder="Buscar glosa o concepto"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          className="modalInvoiceClaims__estadoFilter"
          value={estadoFilter}
          onChange={setEstadoFilter}
          loading={statusesLoading}
          options={[{ value: ALL_ESTADOS, label: ALL_ESTADOS }, ...statusOptions]}
        />
      </div>

      {/* The app theme makes every DatePicker 47px, which is 15px taller than the other controls
          in the same row. Overridden here only, so no picker outside this modal changes. */}
      <ConfigProvider theme={{ components: { DatePicker: { controlHeight: 32 } } }}>
        <Table
          className="modalInvoiceClaims__table"
          columns={getClaimsColumns({
            control,
            statusOptions,
            statusByCode,
            isEditing: isRowEditing,
            savingId,
            formatMoney,
            onStartEdit: handleStartEdit,
            onSave: handleSave,
            onCancel: handleCancel,
            onDelete: handleDelete,
            onDuplicate: handleDuplicate
          })}
          dataSource={filteredRows}
          loading={loading}
          rowClassName={(record) => (isRowEditing(record) ? "editingRow" : "")}
          pagination={false}
          size="small"
          scroll={{ y: "40vh", x: 1050 }}
          locale={{ emptyText: "Esta factura no tiene glosas registradas." }}
          footer={() => (
            <button
              className="modalInvoiceClaims__addRow"
              onClick={handleAddRow}
              disabled={statusesLoading}
            >
              <Plus size={16} />
              Agregar glosa
            </button>
          )}
        />
      </ConfigProvider>

      <div className="modalInvoiceClaims__footer">
        {!!Object.keys(counts).length && (
          <div className="modalInvoiceClaims__chips">
            {(Object.keys(counts) as ClaimStatus[]).map((estado) => {
              const status = statusByCode.get(estado);
              return (
                <span key={estado} className="modalInvoiceClaims__chip">
                  <span
                    className="modalInvoiceClaims__chipDot"
                    style={{ backgroundColor: status?.color ?? FALLBACK_STATUS_COLOR }}
                  />
                  {status?.status_name ?? estado}
                  <strong>{counts[estado]}</strong>
                </span>
              );
            })}
          </div>
        )}

        <Flex gap={"1.5rem"} className="modalInvoiceClaims__totals">
          <p>
            Total glosas:{" "}
            <strong className={isBalanced ? "" : "-unbalanced"}>{formatMoney(claimsTotal)}</strong>
          </p>
          <p>
            Factura: <strong>{formatMoney(invoiceTotal)}</strong>
          </p>
        </Flex>
      </div>
    </Modal>
  );
};
