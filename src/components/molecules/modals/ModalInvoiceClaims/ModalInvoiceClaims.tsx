"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Flex, Modal, Select, Table, Typography } from "antd";
import { CheckCircle, Plus, WarningCircle, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useInvoiceClaims } from "@/hooks/useInvoiceClaims";

import UiSearchInput from "@/components/ui/search-input";
import { getClaimsColumns } from "./columns";
import { CLAIM_ESTADOS, CONCEPTOS, ESTADO_CLAIM_META } from "./constants";
import { getMockedClaims } from "./mocked-data";

import { ClaimEstado, ClaimsForm, ClaimTableRow } from "./types";
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

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<ClaimEstado | typeof ALL_ESTADOS>(ALL_ESTADOS);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Values of the row being edited, kept to restore them when the edit is cancelled
  const editSnapshot = useRef<ClaimsForm["claims"][number] | null>(null);
  // Set when a brand new row is appended so it opens in edit mode once RHF registers it
  const shouldEditLastRow = useRef(false);

  const { data: claimsResponse } = useInvoiceClaims({
    invoiceId: invoice?.id,
    enabled: isOpen
  });

  useEffect(() => {
    if (claimsResponse) console.info("Invoice claims response:", claimsResponse);
  }, [claimsResponse]);

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
    if (!isOpen || !invoice) return;
    reset({ claims: getMockedClaims(invoice.id_erp) });
    setEditingId(null);
    setEstadoFilter(ALL_ESTADOS);
    setSearch("");
  }, [isOpen, invoice?.id]);

  useEffect(() => {
    if (!shouldEditLastRow.current || fields.length === 0) return;
    shouldEditLastRow.current = false;
    setEditingId(fields[fields.length - 1].fieldId);
  }, [fields.length]);

  const claims = watch("claims");

  const rows: ClaimTableRow[] = useMemo(
    () =>
      fields.map((field, index) => ({
        ...field,
        ...claims[index],
        fieldId: field.fieldId,
        index,
        key: field.fieldId
      })),
    [fields, claims]
  );

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    return rows.filter((row) => {
      // the row being edited stays visible even if its new values no longer match the filters
      if (row.fieldId === editingId) return true;
      const matchSearch =
        !query ||
        row.id?.toLowerCase().includes(query) ||
        row.concepto?.toLowerCase().includes(query) ||
        row.observacion?.toLowerCase().includes(query);
      const matchEstado = estadoFilter === ALL_ESTADOS || row.estado === estadoFilter;
      return matchSearch && matchEstado;
    });
  }, [rows, search, estadoFilter, editingId]);

  const counts = useMemo(
    () =>
      rows.reduce<Partial<Record<ClaimEstado, number>>>((acc, row) => {
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
    if (editingIndex < 0) return;
    const isValid = await trigger(`claims.${editingIndex}`);
    if (!isValid) return;
    setValue(`claims.${editingIndex}._new`, false);
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
    remove(row.index);
  };

  const handleDuplicate = (row: ClaimTableRow) => {
    const values = getValues(`claims.${row.index}`);
    insert(row.index + 1, { ...values, id: `${values.id}-copia`, _new: false });
  };

  const handleAddRow = () => {
    if (!invoice) return;
    shouldEditLastRow.current = true;
    append({
      id: `${invoice.id_erp}-G${String(fields.length + 1).padStart(2, "0")}`,
      concepto: CONCEPTOS[0].label,
      codigo: CONCEPTOS[0].codigo,
      monto: 0,
      estado: "En disputa",
      fechaGlosa: null,
      fechaContestacion: null,
      observacion: "",
      _new: true
    });
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
          options={[ALL_ESTADOS, ...CLAIM_ESTADOS].map((estado) => ({
            value: estado,
            label: estado
          }))}
        />
      </div>

      <div className="modalInvoiceClaims__chips">
        {CLAIM_ESTADOS.filter((estado) => counts[estado]).map((estado) => (
          <span key={estado} className="modalInvoiceClaims__chip">
            <span
              className="modalInvoiceClaims__chipDot"
              style={{ backgroundColor: ESTADO_CLAIM_META[estado].dot }}
            />
            {estado}
            <strong>{counts[estado]}</strong>
          </span>
        ))}
      </div>

      <Table
        className="modalInvoiceClaims__table"
        columns={getClaimsColumns({
          control,
          editingId,
          formatMoney,
          onStartEdit: handleStartEdit,
          onSave: handleSave,
          onCancel: handleCancel,
          onDelete: handleDelete,
          onDuplicate: handleDuplicate
        })}
        dataSource={filteredRows}
        rowClassName={(record) => (record.fieldId === editingId ? "editingRow" : "")}
        pagination={false}
        size="small"
        scroll={{ y: "40vh", x: 1250 }}
        locale={{ emptyText: "Sin glosas para el filtro seleccionado." }}
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
