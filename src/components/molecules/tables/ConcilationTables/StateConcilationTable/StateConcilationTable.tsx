import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useModalDetail } from "@/context/ModalContext";
import { useAppStore } from "@/lib/store/store";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { invoiceCreateIncident } from "@/services/concilation/concilation";

import LabelCollapse from "@/components/ui/label-collapse";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { Button, Collapse, Flex, message, Select, Typography } from "antd";
import { ConcilationTable } from "../ConcilationTable/ConcilationTable";
import { ModalEstimatedConcilation } from "@/components/molecules/modals/ModalEstimatedConcilation/ModalEstimatedConcilation";
import InvoiceDetailModal from "@/modules/clients/containers/invoice-detail-modal";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";

import {
  IInvoiceConcilation,
  InfoConcilation,
  InvoicesConcilation
} from "@/types/concilation/concilation";

import "./stateConcilationTable.scss";

const { Text } = Typography;

interface Props {
  invoices: InfoConcilation | undefined;
  clientId: string;
  setInvoices: Dispatch<SetStateAction<InfoConcilation | undefined>>;
}

export const StateConcilationTable = ({ invoices, clientId, setInvoices }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [IdErp, setIderp] = useState<string>("");
  const [isRegisterNewsOpen, setIsRegisterNewsOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState({
    isOpen: false,
    invoiceId: 0
  });
  const [selectedRows, setSelectedRows] = useState<IInvoiceConcilation[] | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: motives, isLoading } = useInvoiceIncidentMotives();
  const { openModal } = useModalDetail();
  const router = useRouter();

  // Función auxiliar para obtener todas las facturas
  useEffect(() => {
    if (invoices) {
      const keys = Object.keys(invoices);
      setActiveKeys(keys.slice(1));
    }
  }, [invoices]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    const cleanedIds = value
      .split(/[\n\r\s,]+/)
      .filter((id) => id.trim() !== "")
      .map((id) => id.trim());
    const formattedValue = cleanedIds.join(",");
    setSearchTerm(formattedValue);
  };

  const filteredInvoices = (invoiceCategory: InvoicesConcilation) => {
    if (!searchTerm) return invoiceCategory;

    const searchIds = searchTerm.split(",").filter(Boolean);

    return {
      ...invoiceCategory,
      invoices: invoiceCategory?.invoices.filter((invoice) => {
        return searchIds.some(
          (searchId) =>
            invoice?.id_erp?.toString().includes(searchId) ||
            invoice?.id?.toString().includes(searchId)
        );
      })
    };
  };

  const addSelectMotive = (invoiceId: number, motiveId: number) => {
    if (invoices) {
      const updatedInvoices = { ...invoices };
      for (const categoryKey in updatedInvoices) {
        if (Object.prototype.hasOwnProperty.call(updatedInvoices, categoryKey)) {
          const category = updatedInvoices[categoryKey as keyof InfoConcilation];
          category.invoices = category.invoices.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, motive_id: motiveId } : invoice
          );
        }
      }
      setInvoices(updatedInvoices);
    }
  };

  const handleRowSelection = (
    newSelectedRowKeys: React.Key[],
    newSelectedRows: IInvoiceConcilation[],
    category: keyof InfoConcilation
  ) => {
    const currentCategoryInvoices = invoices?.[category].invoices || [];

    // Determine which rows were deselected
    const deselectedRows =
      selectedRows?.filter(
        (row) =>
          currentCategoryInvoices.some((invoice) => invoice.id === row.id) &&
          !newSelectedRows.some((newRow) => newRow.id === row.id)
      ) || [];

    // Remove deselected rows and add newly selected rows
    const updatedSelectedRows = [
      ...(selectedRows?.filter((row) => !deselectedRows.includes(row)) || []),
      ...newSelectedRows.filter(
        (row) => !selectedRows?.some((selectedRow) => selectedRow.id === row.id)
      )
    ];

    // Update selectedRowKeys
    const updatedSelectedRowKeys = Array.from(
      new Set([
        ...selectedRowKeys.filter((key) => !deselectedRows.some((row) => row.id === key)),
        ...newSelectedRowKeys.filter((key) => !selectedRowKeys.includes(key))
      ])
    );

    setSelectedRows(updatedSelectedRows);
    setSelectedRowKeys(updatedSelectedRowKeys);
  };

  const addSelectMotiveToAll = (motiveId: number) => {
    if (selectedRows && invoices) {
      const updatedInvoices = { ...invoices };
      const selectedIds = new Set(selectedRows.map((row) => row.id));

      for (const categoryKey in updatedInvoices) {
        if (Object.prototype.hasOwnProperty.call(updatedInvoices, categoryKey)) {
          const category = updatedInvoices[categoryKey as keyof InfoConcilation];
          category.invoices = category.invoices.map((invoice) =>
            selectedIds.has(invoice.id) ? { ...invoice, motive_id: motiveId } : invoice
          );
        }
      }
      setInvoices(updatedInvoices);
    }
  };

  const onSubmitConcilation = async () => {
    if (!invoices) return;
    const categoriesToValidate = ["invoices_not_found", "invoices_with_differences"];
    for (const category of categoriesToValidate) {
      const invoiceCategory = invoices[category as keyof InfoConcilation];
      if (invoiceCategory) {
        for (const invoice of invoiceCategory.invoices) {
          if (invoice.motive_id == null) {
            messageApi.error(
              "Por favor seleccione un motivo para todas las facturas no encontradas y con diferencias"
            );
            return;
          }
        }
      }
    }
    setIsRegisterNewsOpen(true);
  };

  useEffect(() => {
    if (!invoices) return;
    const categoriesToValidate = ["invoices_not_found", "invoices_with_differences"];
    let allInvoicesHaveMotive = true;

    for (const category of categoriesToValidate) {
      const invoiceCategory = invoices[category as keyof InfoConcilation];
      if (invoiceCategory) {
        for (const invoice of invoiceCategory.invoices) {
          if (invoice.motive_id == null) {
            allInvoicesHaveMotive = false;
            break;
          }
        }
      }
    }

    setIsValid(allInvoicesHaveMotive);
  }, [invoices]);

  useEffect(() => {
    if (!isRegisterNewsOpen) {
      setSelectedEvidence([]);
      setCommentary(undefined);
    }
  }, [isRegisterNewsOpen]);

  const handleSubmitConcilationEvidence = async () => {
    setIsSubmitting(true);

    if (!invoices) return;
    const invoiceList = Object.entries(invoices).flatMap(([key, category]) =>
      category.invoices.map(
        (invoice: {
          id: string;
          motive_id: string;
          difference_amount: string;
          observation?: string;
        }) => ({
          invoice_id: invoice.id,
          motive_id: invoice.motive_id,
          difference: invoice.difference_amount,
          status: key,
          observation: invoice.observation
        })
      )
    );
    try {
      const response = await invoiceCreateIncident(
        selectedEvidence,
        invoiceList,
        commentary || "",
        clientId || ""
      );

      if (response.status == 200) {
        setIsRegisterNewsOpen(false);
        setSelectedEvidence([]);
        setCommentary("");

        openModal("sendEmail", {
          event_id: "massConciliation",
          onFinalOk: () => {
            router.push(`/clientes/detail/${clientId}/project/${ID}`);
          },
          customOnReject: () => {
            router.push(`/clientes/detail/${clientId}/project/${ID}`);
          }
        });
      }
    } catch (err) {
      messageApi.error("Error al adjuntar la evidencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="concilation_table">
      {contextHolder}
      {invoices && (
        <ModalEstimatedConcilation
          invoice={{
            amount: invoices.reconciled_invoices.amount,
            quantity: invoices.reconciled_invoices.quantity
          }}
          notFoundInvoices={{
            amount: invoices.invoices_not_found.amount,
            quantity: invoices.invoices_not_found.quantity
          }}
          differenceInvoices={{
            amount: invoices.invoices_with_differences.amount,
            quantity: invoices.invoices_with_differences.quantity
          }}
        />
      )}
      <Flex justify="space-between" className="concilation_table__header">
        <Flex className="searchBar__container">
          <UiSearchInput
            className="search"
            placeholder="Buscar por factura"
            onChange={handleSearchChange}
          />
          <Button
            className={`button__actions ${isValid ? "button__actions__green" : ""}`}
            size="large"
            onClick={onSubmitConcilation}
          >
            Guardar
          </Button>
          <Select
            placeholder="Seleccionar acción para todos"
            loading={isLoading}
            className="select__container"
            popupClassName="concilation_table__select__popup"
            options={motives?.map((motive) => ({ value: motive.id, label: motive.name })) || []}
            onChange={(value) => addSelectMotiveToAll(value)}
            style={{ width: "200px", marginRight: "10px" }}
            disabled={!selectedRows || selectedRows.length === 0}
            popupMatchSelectWidth={false}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {selectedRows && selectedRows.length > 0
              ? `Se aplicará a ${selectedRows.length} factura(s) seleccionada(s)`
              : "Seleccione facturas para aplicar acción"}
          </Text>
        </Flex>
      </Flex>
      <Collapse
        ghost
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(typeof keys === "string" ? [keys] : keys)}
        items={
          invoices
            ? Object.entries(invoices).map(([key, invoiceState]) => ({
                key: key,
                label: (
                  <LabelCollapse
                    status={getStatusTitle(key)}
                    total={invoiceState.amount}
                    quantity={invoiceState.quantity}
                    color={getStatusColor(key)}
                  />
                ),
                children: (
                  <ConcilationTable
                    dataSingleInvoice={filteredInvoices(invoiceState)?.invoices}
                    setShowInvoiceDetailModal={setShowInvoiceDetailModal}
                    addSelectMotive={addSelectMotive}
                    setIderp={setIderp}
                    onRowSelection={(newSelectedRowKeys, newSelectedRows) =>
                      handleRowSelection(
                        newSelectedRowKeys,
                        newSelectedRows,
                        key as keyof InfoConcilation
                      )
                    }
                    selectedRowKeys={selectedRowKeys}
                  />
                )
              }))
            : []
        }
      />
      {showInvoiceDetailModal?.isOpen && (
        <InvoiceDetailModal
          hiddenActions
          isOpen={showInvoiceDetailModal?.isOpen || false}
          onClose={() => setShowInvoiceDetailModal({ isOpen: false, invoiceId: 0 })}
          invoiceId={showInvoiceDetailModal?.invoiceId || 0}
          showId={IdErp}
          clientId={clientId}
          projectId={ID}
        />
      )}

      <ModalAttachEvidence
        isOpen={isRegisterNewsOpen}
        handleCancel={() => {
          setIsRegisterNewsOpen(false);
          setSelectedEvidence([]);
          setCommentary("");
        }}
        handleAttachEvidence={handleSubmitConcilationEvidence}
        selectedEvidence={selectedEvidence}
        setSelectedEvidence={setSelectedEvidence}
        commentary={commentary}
        setCommentary={setCommentary}
        multipleFiles
        loading={isSubmitting}
        confirmDisabled={!commentary || !selectedEvidence.length || isSubmitting}
        isMandatory={{ evidence: true, commentary: true }}
        customTexts={{
          title: "Finalizar conciliación",
          description: "Adjunta la evidencia y agrega un comentario",
          cancelButtonText: "Cancelar",
          acceptButtonText: "Finalizar conciliación"
        }}
      />
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "reconciled_invoices":
      return "#0085FF";
    case "invoices_not_found":
      return "#969696";
    case "invoices_with_differences":
      return "#E53261";
    default:
      return "gray";
  }
};

const getStatusTitle = (status: string) => {
  switch (status) {
    case "reconciled_invoices":
      return "conciliado";
    case "invoices_not_found":
      return "Facturas no encontrada";
    case "invoices_with_differences":
      return "Diferencias en montos";
    default:
      return "gray";
  }
};
