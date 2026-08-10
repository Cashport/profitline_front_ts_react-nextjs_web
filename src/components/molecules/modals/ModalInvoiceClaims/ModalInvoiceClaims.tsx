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

import { ClaimsForm, ClaimTableRow } from "./types";
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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Values of the row being edited, kept to restore them when the edit is cancelled
  const editSnapshot = useRef<ClaimsForm["claims"][number] | null>(null);
  // Index of a row just added or duplicated, so it opens in edit mode once RHF registers it
  const pendingEditIndex = useRef<number | null>(null);

  const { claims, loading, isActionLoading, addClaim, editClaim, removeClaim } = useInvoiceClaims({
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
    setEditingId(null);
    setEstadoFilter(ALL_ESTADOS);
    setSearch("");
  }, [isOpen, invoice?.id]);

  // Seeds the table from the server. Skipped while there is unsaved work on screen so a background
  // revalidation cannot wipe a row the user is in the middle of.
  useEffect(() => {
    if (!isOpen) return;
    const hasUnsavedRows = getValues("claims")?.some((claim) => claim._new);
    if (editingId || pendingEditIndex.current !== null || hasUnsavedRows) return;
    reset({ claims: claims.map(mapClaimToRow) });
  }, [claims, isOpen]);

  useEffect(() => {
    const target = pendingEditIndex.current;
    if (target === null || !fields[target]) return;
    pendingEditIndex.current = null;
    setEditingId(fields[target].fieldId);
  }, [fields.length]);

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

  // The estado filter is resolved server side, only the search is applied here
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return rows;
    return rows.filter((row) => {
      // the row being edited stays visible even if its new values no longer match the search
      if (row.fieldId === editingId) return true;
      return (
        row.claimNumber?.toLowerCase().includes(query) ||
        row.concepto?.toLowerCase().includes(query) ||
        row.observacion?.toLowerCase().includes(query)
      );
    });
  }, [rows, search, editingId]);

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

  const editingIndex = fields.findIndex((field) => field.fieldId === editingId);

  const handleStartEdit = (row: ClaimTableRow) => {
    editSnapshot.current = getValues(`claims.${row.index}`);
    setEditingId(row.fieldId);
  };

  const handleSave = async () => {
    if (editingIndex < 0 || !invoice) return;
    const isValid = await trigger(`claims.${editingIndex}`);
    if (!isValid) return;

    const row = getValues(`claims.${editingIndex}`);
    if (!row.concepto.trim()) return showMessage("error", "El concepto es obligatorio");
    if (!row.monto || row.monto <= 0) return showMessage("error", "El monto debe ser mayor a cero");

    const success = row.claimId
      ? await editClaim(row.claimId, rowToPayload(row), showMessage)
      : await addClaim(rowToCreatePayload(row, invoice.id), showMessage);
    if (!success) return;

    // a created row is dropped from the form: it comes back from the refetch with its server id
    if (!row.claimId) remove(editingIndex);
    editSnapshot.current = null;
    setEditingId(null);
  };

  const handleCancel = () => {
    if (editingIndex < 0) return;
    if (getValues(`claims.${editingIndex}._new`)) {
      remove(editingIndex);
    } else if (editSnapshot.current) {
      setValue(`claims.${editingIndex}`, editSnapshot.current);
    }
    editSnapshot.current = null;
    setEditingId(null);
  };

  const handleDelete = (row: ClaimTableRow) => {
    if (row.fieldId === editingId) setEditingId(null);
    // never saved rows only exist in the form, nothing to delete server side
    if (!row.claimId) return remove(row.index);

    Modal.confirm({
      title: "Eliminar glosa",
      content: `¿Deseas eliminar la glosa ${row.claimNumber}? Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      onOk: () => removeClaim(row.claimId as number, showMessage)
    });
  };

  // A duplicate is inserted unsaved so nothing hits the API until the user confirms it
  const handleDuplicate = (row: ClaimTableRow) => {
    const values = getValues(`claims.${row.index}`);
    pendingEditIndex.current = row.index + 1;
    insert(row.index + 1, { ...values, claimId: null, claimNumber: "", _new: true });
  };

  const handleAddRow = () => {
    if (!invoice) return;
    pendingEditIndex.current = fields.length;
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
          editingId,
          isSaving: isActionLoading,
          formatMoney,
          onStartEdit: handleStartEdit,
          onSave: handleSave,
          onCancel: handleCancel,
          onDelete: handleDelete,
          onDuplicate: handleDuplicate
        })}
        dataSource={filteredRows}
        loading={loading}
        rowClassName={(record) => (record.fieldId === editingId ? "editingRow" : "")}
        pagination={false}
        size="small"
        scroll={{ y: "40vh", x: 1250 }}
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
