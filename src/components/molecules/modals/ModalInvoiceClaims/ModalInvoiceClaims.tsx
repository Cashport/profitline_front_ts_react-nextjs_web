"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Flex, Modal, Select, Table, Typography } from "antd";
import { CheckCircle, Plus, WarningCircle, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useInvoiceClaims } from "@/hooks/useInvoiceClaims";
import { useMessageApi } from "@/context/MessageContext";

import UiSearchInput from "@/components/ui/search-input";
import { getClaimsColumns } from "./columns";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_META, CLAIM_STATUS_OPTIONS } from "./constants";
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

  // Seeds the table from the server. Skipped while there is unsaved work on screen so a background
  // revalidation cannot wipe a row the user is in the middle of.
  useEffect(() => {
    if (!isOpen) return;
    const hasUnsavedRows = getValues("claims")?.some((claim) => claim._new);
    if (editingIds.length || hasUnsavedRows) return;
    reset({ claims: claims.map(mapClaimToRow) });
  }, [claims, isOpen]);

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
    if (!isValid) return;

    const values = getValues(`claims.${row.index}`);
    if (!values.concepto.trim()) return showMessage("error", "El concepto es obligatorio");
    if (!values.monto || values.monto <= 0)
      return showMessage("error", "El monto debe ser mayor a cero");

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
    append(createEmptyRow());
  };

  return (
    <Modal
      className="modalInvoiceClaims"
      width="90%"
      centered
      footer={null}
      closable={false}
      destroyOnClose
      open={isOpen}
      onCancel={onClose}
    >
      <div className="modalInvoiceClaims__header">
        <div>
          <Title level={4}>
            Glosas de <span className="modalInvoiceClaims__invoiceId">{invoice?.id_erp}</span>
            <span className="modalInvoiceClaims__count">
              ({rows.length} {rows.length === 1 ? "registro" : "registros"})
            </span>
          </Title>
          <p className="modalInvoiceClaims__subtitle">
            Cada glosa compone una parte del valor total de la factura.
          </p>
        </div>
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
          options={[{ value: ALL_ESTADOS, label: ALL_ESTADOS }, ...CLAIM_STATUS_OPTIONS]}
        />
      </div>

      {!!Object.keys(counts).length && (
        <div className="modalInvoiceClaims__chips">
          {(Object.keys(counts) as ClaimStatus[]).map((estado) => (
            <span key={estado} className="modalInvoiceClaims__chip">
              <span
                className="modalInvoiceClaims__chipDot"
                style={{ backgroundColor: CLAIM_STATUS_META[estado]?.dot }}
              />
              {CLAIM_STATUS_LABELS[estado] ?? estado}
              <strong>{counts[estado]}</strong>
            </span>
          ))}
        </div>
      )}

      <Table
        className="modalInvoiceClaims__table"
        columns={getClaimsColumns({
          control,
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
        scroll={{ y: "40vh", x: 1350 }}
        locale={{ emptyText: "Esta factura no tiene glosas registradas." }}
        footer={() => (
          <button className="modalInvoiceClaims__addRow" onClick={handleAddRow}>
            <Plus size={16} />
            Agregar glosa
          </button>
        )}
      />

      <div className="modalInvoiceClaims__footer">
        <div className={`modalInvoiceClaims__balance ${isBalanced ? "-balanced" : "-unbalanced"}`}>
          {isBalanced ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
          {isBalanced
            ? "La suma de glosas cuadra con el valor de la factura"
            : "La suma de glosas no coincide con la factura"}
        </div>

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
