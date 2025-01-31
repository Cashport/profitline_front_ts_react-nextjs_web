import React, { useState, useMemo, useEffect } from "react";
import { Modal, Checkbox, Spin, message, Flex, Pagination } from "antd";
import { CaretLeft, CopySimple, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { extractSingleParam, formatDate } from "@/utils/utils";
import {
  getApplicationInvoices,
  getApplicationPayments
} from "@/services/applyTabClients/applyTabClients";

import UiSearchInputLong from "@/components/ui/search-input-long";
import { IModalAddToTableOpen } from "../../apply-tab";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import CheckboxColoredValues from "@/components/ui/checkbox-colored-values/checkbox-colored-values";

import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { IInvoice } from "@/types/invoices/IInvoices";

import "./modalAddToTables.scss";
import { useParams } from "next/navigation";
interface ModalAddToTablesProps {
  onCancel: () => void;
  // eslint-disable-next-line no-unused-vars
  onAdd: (adding_type: "invoices" | "payments", selectedIds: number[]) => Promise<void>;
  isModalAddToTableOpen: IModalAddToTableOpen;
}

const ModalAddToTables: React.FC<ModalAddToTablesProps> = ({
  onCancel,
  onAdd,
  isModalAddToTableOpen
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = Number(extractSingleParam(params.clientId)) || 0;
  const [allInvoices, setAllInvoices] = useState<IInvoice[]>();
  const [allPayments, setAllPayments] = useState<IClientPayment[]>();

  const [rows, setRows] = useState<(IInvoice | IClientPayment)[]>([]);
  const [selectedRows, setSelectedRows] = useState<(IInvoice | IClientPayment)[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAddToTable, setLoadingAddToTable] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (isModalAddToTableOpen.adding === "invoices") {
        setLoadingData(true);
        const res = await getApplicationInvoices(projectId, clientId);
        const fetchedInvoices = res?.map((data) => data.invoices).flat();
        setAllInvoices(fetchedInvoices);
        setLoadingData(false);
      } else if (isModalAddToTableOpen.adding === "payments") {
        setLoadingData(true);
        const res = await getApplicationPayments(projectId, clientId);
        const fetchedPayments = res?.map((data) => data.payments).flat();
        setAllPayments(fetchedPayments);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isModalAddToTableOpen.adding]);

  useEffect(() => {
    if (isModalAddToTableOpen.adding === "invoices" && allInvoices) {
      setRows(allInvoices);
    } else if (isModalAddToTableOpen.adding === "payments" && allPayments) {
      setRows(allPayments);
    }
  }, [isModalAddToTableOpen.adding, allInvoices, allPayments]);

  useEffect(() => {
    return () => {
      setSelectedRows([]);
      setRows([]);
      setNotFoundInvoices([]);
      setSearchQuery("");
      setCurrentPage(1);
    };
  }, [isModalAddToTableOpen.isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const [notFoundInvoices, setNotFoundInvoices] = useState<number[]>([]);
  const [adjustments] = useState(15000000);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (searchQuery === "") {
      setNotFoundInvoices([]);
      return;
    }
    const searchQueryArray = searchQuery.split(",").map((query) => query.trim());
    const notFoundInvoices = searchQueryArray.filter(
      (query) => !rows.some((row) => row.id.toString() === query)
    );
    setNotFoundInvoices(notFoundInvoices.map(Number));
  }, [rows, searchQuery]);

  const filteredData = useMemo(() => {
    const searchQueryArray = searchQuery.split(",").map((query) => query.trim());
    const filtered = rows.filter((row) =>
      searchQueryArray.some((query) => row.id.toString().toLowerCase().includes(query))
    );

    const sorted = filtered.sort((a, b) => {
      const aMatches = searchQueryArray.some((query) => a.id.toString().toLowerCase() === query);
      const bMatches = searchQueryArray.some((query) => b.id.toString().toLowerCase() === query);

      if (aMatches && !bMatches) return -1; // Exact match comes first
      if (!aMatches && bMatches) return 1; // Partial match comes after
      return 0; // Otherwise, keep the existing order
    });

    return sorted;
  }, [rows, searchQuery]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const handlePasteInvoices = async () => {
    try {
      const text = await navigator.clipboard.readText();

      const pastedIds = text
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row !== "" && !isNaN(+row))
        .map(Number);

      setSearchQuery(pastedIds.join(", "));
    } catch (err) {
      console.error("Error pasting invoices:", err);
      message.error("Error al pegar facturas. Por favor, inténtelo de nuevo.");
    }
  };

  const summary = useMemo(() => {
    const total = selectedRows.reduce((sum, row) => sum + row.current_value, 0);
    const pending = total - adjustments;
    return { total, adjustments, pending, count: selectedRows.length };
  }, [selectedRows, adjustments]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, ...paginatedRows]);
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.filter((selected) => !paginatedRows.some((row) => row.id === selected.id))
      );
    }
  };

  const handleSelectOne = (checked: boolean, row: IClientPayment | IInvoice) => {
    setSelectedRows((prevSelectedRows) =>
      checked
        ? [...(prevSelectedRows as (IInvoice | IClientPayment)[]), row]
        : (prevSelectedRows as (IInvoice | IClientPayment)[]).filter(
            (selected) => selected.id !== row.id
          )
    );
  };

  const handleAddToTable = async () => {
    if (!isModalAddToTableOpen.adding) return console.error("No adding type selected");
    setLoadingAddToTable(true);
    const uniqueSelectedIds = Array.from(new Set(selectedRows.map((row) => row.id)));
    await onAdd(isModalAddToTableOpen.adding, uniqueSelectedIds);
    setLoadingAddToTable(false);
  };

  const isAllChecked =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) => selectedRows.some((selected) => selected.id === row.id));

  return (
    <Modal
      open={isModalAddToTableOpen.isOpen}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="modal-add-invoice"
      closeIcon={<X className="closeIcon" size={20} onClick={onCancel} />}
    >
      <div onClick={onCancel} className="header">
        <CaretLeft size={24} onClick={onCancel} />
        <h2>{`Agregar ${isModalAddToTableOpen.adding === "invoices" ? "facturas" : "pagos"}`}</h2>
      </div>
      {summary.count > 0 && (
        <div className="summary-section">
          <div className="summary-item">
            <span>Total ({summary.count})</span>
            <span>${summary.total.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span>Ajustes</span>
            <span>${summary.adjustments.toLocaleString()}</span>
          </div>
          <div className="summary-item pending">
            <span>Pendiente</span>
            <span>${summary.pending.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="search-container">
        <UiSearchInputLong
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar"
          className={"custom-input"}
        />
      </div>
      {notFoundInvoices.length > 0 && (
        <div className="not-found-invoices">
          <Flex justify="space-between">
            <div>Facturas no encontradas</div>
            <div
              className="excel-button-container"
              onClick={() => {
                navigator.clipboard.writeText(notFoundInvoices.join(", "));
                message.success("Valores copiados");
              }}
            >
              <CopySimple size={18} />
              Copiar valores
            </div>
          </Flex>

          <div className="buld-text-excel-not-found">
            <strong> {notFoundInvoices.join(", ")}</strong>
          </div>
        </div>
      )}
      {!notFoundInvoices.length && (
        <div className="container-paste-invoice">
          <div className="excel-button-container" onClick={handlePasteInvoices}>
            <CopySimple size={18} />
            Pegar desde excel
          </div>
        </div>
      )}

      {loadingData ? (
        <Flex justify="center" style={{ width: "100%", margin: "2rem 0" }}>
          <Spin />
        </Flex>
      ) : (
        <>
          <div className="select-all">
            <Checkbox
              className="select-all__checkbox"
              onChange={(e) => handleSelectAll(e.target.checked)}
              checked={isAllChecked ? true : undefined}
            >
              Seleccionar todo
            </Checkbox>
          </div>
          <div className="invoices-list">
            {paginatedRows.map((row) => (
              <CheckboxColoredValues
                customStyles={{ height: "76px" }}
                customStyleDivider={{ width: "6px", height: "44px", alignSelf: "center" }}
                key={row.id}
                onChangeCheckbox={(e) => {
                  handleSelectOne(e.target.checked, row);
                }}
                checked={selectedRows.some((selected) => selected.id === row.id)}
                content={
                  <Flex style={{ width: "100%" }} justify="space-between">
                    <div>
                      <h4 className="invoices-list__title">
                        {isModalAddToTableOpen.adding === "invoices" ? "Factura" : "Pago"} {row.id}
                      </h4>
                      <p className="invoices-list__date">{formatDate(row.updated_at)}</p>
                    </div>
                    <h3 className="invoices-list__amount">{formatMoney(row.current_value)}</h3>
                  </Flex>
                }
              />
            ))}
          </div>
          <Pagination
            current={currentPage}
            onChange={handlePageChange}
            total={filteredData.length}
            showSizeChanger={false}
            style={{ textAlign: "right", margin: ".5rem 0" }}
          />
        </>
      )}

      <div className="modal-footer">
        <SecondaryButton fullWidth onClick={onCancel}>
          Cancelar
        </SecondaryButton>

        <PrincipalButton
          fullWidth
          loading={loadingAddToTable}
          onClick={handleAddToTable}
          disabled={!selectedRows.length}
        >
          {`Agregar ${isModalAddToTableOpen.adding === "invoices" ? "facturas" : "pagos"}`}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalAddToTables;
