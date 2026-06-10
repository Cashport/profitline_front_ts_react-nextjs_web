import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DotsThree, Plus, Sparkle } from "phosphor-react";
import { Button, Flex, Spin } from "antd";

import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";
import { useApplicationTable } from "@/hooks/useApplicationTable";
import {
  addItemsToTable,
  getApplicationsExcelLog,
  markPaymentsAsUnidentified,
  removeItemsFromTable,
  removeMultipleRows,
  saveApplication
} from "@/services/applyTabClients/applyTabClients";
import { useMessageApi } from "@/context/MessageContext";
// import { useSelectedPayments } from "@/context/SelectedPaymentsContext";

import LabelCollapse from "@/components/ui/label-collapse";
import Collapse from "@/components/ui/collapse";
import UiSearchInput from "@/components/ui/search-input/search-input";
import InvoiceTable from "./tables/InvoiceTable";
import PaymentsTable from "./tables/PaymentsTable";
import DiscountTable from "./tables/DiscountTable";
import { ModalResultAppy } from "./Modals/ModalResultApply/ModalResultAppy";
import ModalAddToTables from "./Modals/ModalAddToTables/ModalAddToTables";
import { ModalSelectAjustements } from "./Modals/ModalSelectAjustements/ModalSelectAjustements";
import ModalListAdjustments from "./Modals/ModalListAdjustments/ModalListAdjustments";
import ModalCreateAdjustment from "./Modals/ModalCreateAdjustment/ModalCreateAdjustment";
import ModalEditRow from "./Modals/ModalEditRow/ModalEditRow";
import ModalCreateAdjustmentByInvoice from "./Modals/ModalCreateAdjustmentByInvoice/ModalCreateAdjustmentByInvoice";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";
import ModalApplyAI from "./Modals/ModalApplyAI/ModalApplyAI";
import { ModalGenerateActionApplyTab } from "./Modals/ModalGenerateActionApplyTab/ModalGenerateActionApplyTab";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ModalEditAdjustments from "../accounting-adjustments-tab/Modals/ModalEditAdjustments/ModalEditAdjustments";
import { ModalChangeAIPrompt } from "./Modals/ModalChangeAIPrompt/ModalChangeAIPrompt";

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

import "./apply-tab.scss";
import { CLIENTUUID_DEMO } from "@/utils/constants/globalConstants";

interface ISelectedRowKeys {
  invoices: React.Key[];
  payments: React.Key[];
  discounts: React.Key[];
}

export interface IModalAddToTableOpen {
  isOpen: boolean;
  adding?: "invoices" | "payments" | "credit_notes";
}

export interface IModalAdjustmentsState {
  isOpen: boolean;
  modal: number;
  adjustmentType?: "global" | "byInvoice";
}
interface IEditingRowState {
  isOpen: boolean;
  row?: IApplyTabRecord;
  editing_type?: "invoice" | "payment" | "discount";
}

interface IApplyTabProps {
  className?: string;
  defaultPositionDragModal?: { x: number; y: number };
  isInApplyModule?: boolean;
  clientUUID?: string;
}

const ApplyTab: React.FC<IApplyTabProps> = ({
  className,
  defaultPositionDragModal,
  isInApplyModule = false,
  clientUUID
}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const rawClientId = extractSingleParam(params?.clientId);
  const clientId = isInApplyModule ? clientUUID || CLIENTUUID_DEMO : rawClientId || CLIENTUUID_DEMO;
  const [searchQuery, setSearchQuery] = useState("");
  const { showMessage } = useMessageApi();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  //TODO this is the context that is not being used
  // const { selectedPayments } = useSelectedPayments();

  const [isModalAddToTableOpen, setIsModalAddToTableOpen] = useState<IModalAddToTableOpen>(
    {} as IModalAddToTableOpen
  );

  const [modalAdjustmentsState, setModalAdjustmentsState] = useState({} as IModalAdjustmentsState);
  const [editingRow, setEditingRow] = useState<IEditingRowState>({
    isOpen: false,
    row: undefined,
    editing_type: undefined
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<ISelectedRowKeys>({
    invoices: [],
    payments: [],
    discounts: []
  });
  const [selectedRows, setSelectedRows] = useState<IApplyTabRecord[]>();
  const [isModalOpen, setIsModalOpen] = useState({ selected: 0 });
  const [commentary, setCommentary] = useState<string>();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [useDefaultFileInEvidence, setUseDefaultFileInEvidence] = useState(false);

  const {
    data: applicationData,
    isLoading,
    mutate,
    isValidating,
    setPreventRevalidation
  } = useApplicationTable();
  const showModal = (adding_type: "invoices" | "payments" | "credit_notes") => {
    setIsModalAddToTableOpen({
      isOpen: true,
      adding: adding_type
    });
  };

  useEffect(() => {
    if (isModalOpen.selected === 1) {
      setUseDefaultFileInEvidence(Boolean(applicationData?.summary?.url_attachment));
    }
  }, [isModalOpen.selected]);

  const handleCancel = () => {
    setIsModalAddToTableOpen({
      isOpen: false
    });
  };

  const handleAdd = async (
    adding_type: "invoices" | "payments" | "discounts" | "credit_notes",
    selectedIds: number[]
  ) => {
    // Handle adding selected
    try {
      await addItemsToTable(projectId, clientId, adding_type, selectedIds);

      showMessage("success", "Se han agregado los elementos correctamente");
      if (adding_type !== "discounts") {
        setIsModalAddToTableOpen({
          isOpen: false
        });
      } else {
        setModalAdjustmentsState({
          isOpen: false,
          modal: 0,
          adjustmentType: undefined
        });
      }

      mutate();
    } catch (error) {
      showMessage("error", "Ha ocurrido un error al agregar los elementos");
    }
  };

  const handleRemoveRow = async (row_id: number) => {
    // Handle removing selected
    try {
      await removeItemsFromTable(row_id);
      showMessage("success", `Se ha eliminado el elemento correctamente ${row_id}`);
      mutate();
    } catch (error) {
      showMessage("error", "Ha ocurrido un error al eliminar el elemento");
    }
  };

  const handleEditRow = (
    row: IApplyTabRecord,
    editing_type: "invoice" | "payment" | "discount"
  ) => {
    setEditingRow({
      isOpen: true,
      row: row,
      editing_type
    });
  };

  const handlePaymentUnidentified = async (row: IApplyTabRecord) => {
    try {
      await markPaymentsAsUnidentified([row.payment_id]);
      showMessage("success", "Pago marcado como no identificado");
      mutate();
    } catch (error) {
      showMessage("error", "Ha ocurrido un error al marcar el pago como no identificado");
    }
  };

  const handleSelectChange = useCallback(
    (tableKey: keyof ISelectedRowKeys, newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(() => {
        const updatedSelectedRowKeys: ISelectedRowKeys = {
          payments: [],
          invoices: [],
          discounts: []
        };
        updatedSelectedRowKeys[tableKey] = newSelectedRowKeys;
        return updatedSelectedRowKeys;
      });
    },
    []
  );

  const rowSelection = (tableKey: keyof ISelectedRowKeys) => ({
    selectedRowKeys: selectedRowKeys[tableKey],
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: any) => {
      setSelectedRows(newSelectedRows);
      return handleSelectChange(tableKey, newSelectedRowKeys);
    }
  });

  const saveApp = async () => {
    setPreventRevalidation(true);
    setLoadingSave(true);
    try {
      await saveApplication({
        project_id: projectId,
        client_id: clientId,
        comment: commentary ?? "",
        file: selectedEvidence[0],
        useExistingFile: useDefaultFileInEvidence
      });
      showMessage("success", "Se ha guardado la aplicación correctamente");
      mutate();
      setIsModalOpen({ selected: 0 });
    } catch (error) {
      const errormessage =
        error instanceof Error ? error.message : "Ha ocurrido un error al guardar la aplicación";
      showMessage("error", errormessage);
    }
    setLoadingSave(false);
    setPreventRevalidation(false);
  };

  const handleSave = () => {
    setIsModalOpen({ selected: 1 });
  };

  const filteredData = useMemo(() => {
    if (!applicationData) return { invoices: [], payments: [], discounts: [], balances: [] };

    const filteredInvoices = applicationData.invoices.filter((invoice) =>
      invoice?.id_erp?.toString().toLowerCase().includes(searchQuery)
    );

    const filteredPayments = applicationData.payments.filter((payment) =>
      payment?.payment_id?.toString().toLowerCase().includes(searchQuery)
    );

    const filteredDiscounts = applicationData.discounts.filter((discount) =>
      discount?.financial_discount_id?.toString().toLowerCase().includes(searchQuery)
    );

    const filteredBalances = applicationData.balances.filter((balance) =>
      balance?.balance_id?.toString().toLowerCase().includes(searchQuery)
    );

    return {
      invoices: filteredInvoices,
      payments: filteredPayments,
      discounts: filteredDiscounts,
      balances: filteredBalances
    };
  }, [applicationData, searchQuery]);

  const dataForCollapse = useMemo(() => {
    const invoices = {
      statusName: "facturas",
      color: "#FF7A00",
      statusId: 1,
      itemsList: filteredData?.invoices,
      total: filteredData?.invoices.length && applicationData?.summary.total_invoices,
      count: filteredData?.invoices.length
    };

    const payments = {
      statusName: "pagos",
      color: "#0085FF",
      statusId: 2,
      itemsList: filteredData?.payments,
      total: filteredData?.payments.length && applicationData?.summary.total_payments,
      count: filteredData?.payments.length
    };

    const concDiscountsAndBalances = (filteredData?.discounts || []).concat(
      filteredData?.balances || []
    );

    const discounts = {
      statusName: "notas crédito",
      color: "#E53261",
      statusId: 3,
      itemsList: concDiscountsAndBalances, // Concatenamos los descuentos con los balances para mostrarlos juntos en la sección de ajustes
      total: concDiscountsAndBalances.length && applicationData?.summary.total_discounts,
      count: concDiscountsAndBalances.length
    };

    const balances = {
      statusName: "saldos",
      color: "#000000",
      statusId: 4,
      itemsList: filteredData?.balances,
      total: filteredData?.balances.length && applicationData?.summary.total_balance,
      count: filteredData?.balances.length
    };

    return [invoices, payments, discounts, balances];
  }, [filteredData]);

  const allRows = useMemo(
    () => [
      ...filteredData.invoices,
      ...filteredData.payments,
      ...filteredData.discounts,
      ...filteredData.balances
    ],
    [filteredData]
  );

  const handleCreateAdjustment = (openedRow: IApplyTabRecord) => {
    //close modal edit row
    setEditingRow({
      isOpen: false,
      row: undefined
    });

    //open modal list adjustments as by invoice
    setModalAdjustmentsState({
      isOpen: true,
      modal: 2,
      adjustmentType: "byInvoice"
    });

    // set selected rows to the opened row
    setSelectedRows([openedRow]);
    handleSelectChange("invoices", [openedRow.id]);
  };

  const handleOpenModal = (modalNumber: number) =>
    setIsModalOpen({
      selected: modalNumber
    });

  const handleDeleteMultipleRows = async () => {
    setLoadingRequest(true);
    if (selectedRows && selectedRows.length > 0) {
      try {
        await removeMultipleRows(selectedRows.map((row) => row.id));
        showMessage("success", "Se han eliminado las filas correctamente");
        setIsModalOpen({ selected: 0 });
        deselectAllRows();
        mutate();
      } catch (error) {
        showMessage(
          "error",
          `Error al eliminar ${selectedRows.length} fila${selectedRows.length > 1 ? "s" : ""} `
        );
      }
    }
    setLoadingRequest(false);
  };

  const handleDownloadLog = () => {
    try {
      if (applicationData?.summary?.url_log) {
        window.open(applicationData.summary.url_log, "_blank");
        setIsModalOpen({ selected: 0 });
      } else {
        showMessage("error", "No hay log disponible para descargar");
      }
    } catch (error) {
      showMessage("error", "Error al descargar el log");
    }
  };

  const handleDownloadExcelLog = async () => {
    try {
      const data = await getApplicationsExcelLog(projectId, clientId);

      if (data?.excel_url) {
        window.open(data.excel_url, "_blank");
        setIsModalOpen({ selected: 0 });
      } else {
        showMessage("error", "No se pudo obtener el excel log");
      }
    } catch (error) {
      showMessage("error", "Error al descargar el excel log");
    }
  };

  const deselectAllRows = () => {
    setSelectedRowKeys({
      invoices: [],
      payments: [],
      discounts: []
    });
    setSelectedRows([]);
  };

  const handleDeleteAllRows = async () => {
    setLoadingRequest(true);
    const allRowsIds = [
      ...(applicationData?.payments?.map((payment) => payment.id) ?? []),
      ...(applicationData?.invoices?.map((invoice) => invoice.id) ?? []),
      ...(applicationData?.discounts?.map((discount) => discount.id) ?? []),
      ...(applicationData?.balances?.map((balance) => balance.id) ?? [])
    ];

    try {
      await removeMultipleRows(allRowsIds);
      showMessage("success", "Se ha eliminado todo correctamente");
      setIsModalOpen({ selected: 0 });
      deselectAllRows();
      mutate();
    } catch (error) {
      showMessage("error", "Error al eliminar todo");
    }
    setLoadingRequest(false);
  };

  const isConfirmDisabled = useMemo(() => {
    if (useDefaultFileInEvidence) {
      return isValidating || !commentary;
    }
    return isValidating || !selectedEvidence.length || !commentary;
  }, [isValidating, selectedEvidence.length, commentary, useDefaultFileInEvidence]);

  return (
    <>
      <ModalResultAppy
        invoices={applicationData?.summary.total_invoices}
        desconts={applicationData?.summary.total_discounts}
        payments={applicationData?.summary.total_payments}
        total={applicationData?.summary.total_balance}
        defaultPosition={defaultPositionDragModal}
      />
      <div className={`applyContainerTab ${className}`}>
        <Flex justify="space-between" className="applyContainerTab__header clientStickyHeader">
          <Flex gap={"0.5rem"} align="center">
            <UiSearchInput
              className="standardSearch"
              placeholder="Buscar"
              onChange={(event) => {
                setSearchQuery(event.target.value.toLowerCase());
              }}
            />
            <Button
              className="button__actions"
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              onClick={() => handleOpenModal(3)}
            >
              Generar acción
            </Button>
            <Button className="iaButton" onClick={() => setIsModalOpen({ selected: 2 })}>
              <Sparkle size={14} color="#5b21b6" weight="fill" />
              <span className="textNormal">
                Aplicar con{" "}
                <span
                  className="cashportIATextGradient"
                  style={{
                    fontWeight: 500
                  }}
                >
                  CashportAI
                </span>
              </span>
            </Button>
          </Flex>
          <Button
            type="primary"
            disabled={allRows.length === 0 || (applicationData?.summary.total_balance ?? 1) !== 0}
            className="save-btn"
            onClick={handleSave}
          >
            Guardar
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" style={{ height: "3rem", marginTop: "1rem" }}>
            <Spin />
          </Flex>
        ) : (
          <Collapse
            stickyLabel
            items={dataForCollapse?.map((section) => ({
              key: section.statusId,
              label: (
                <Flex>
                  <LabelCollapse
                    status={section.statusName}
                    color={section.color}
                    total={section.total}
                    quantity={section.count}
                  />
                  {!isInApplyModule ? (
                    <button
                      className="buttonActionApply"
                      onClick={() => {
                        if (section.statusName === "facturas") {
                          showModal("invoices");
                        }
                        if (section.statusName === "pagos") {
                          showModal("payments");
                        }
                        if (section.statusName === "notas crédito") {
                          showModal("credit_notes");
                        }
                        if (section.statusName === "saldos") {
                          setModalAdjustmentsState(
                            modalAdjustmentsState.isOpen
                              ? { isOpen: false, modal: 1 }
                              : { isOpen: true, modal: 1 }
                          );
                        }
                      }}
                    >
                      <Plus />
                      <p>Agregar {`${section.statusName}`}</p>
                    </button>
                  ) : null}
                </Flex>
              ),
              children: (
                <div>
                  {section.statusName === "facturas" && (
                    <InvoiceTable
                      data={section.itemsList}
                      handleDeleteRow={handleRemoveRow}
                      handleEditRow={handleEditRow}
                      rowSelection={rowSelection("invoices")}
                      clientId={clientId}
                      projectId={projectId}
                    />
                  )}
                  {section.statusName === "pagos" && (
                    <PaymentsTable
                      data={section.itemsList}
                      handleDeleteRow={handleRemoveRow}
                      handleEditRow={handleEditRow}
                      rowSelection={rowSelection("payments")}
                      markPaymentAsUnidentified={handlePaymentUnidentified}
                    />
                  )}
                  {section.statusName === "ajustes" && (
                    <DiscountTable
                      data={section.itemsList}
                      handleDeleteRow={handleRemoveRow}
                      rowSelection={rowSelection("discounts")}
                      handleEditRow={(row) => handleEditRow(row, "discount")}
                      clientId={clientId}
                      projectId={projectId}
                    />
                  )}
                </div>
              )
            }))}
          />
        )}
      </div>
      <ModalAddToTables
        onCancel={handleCancel}
        onAdd={handleAdd}
        isModalAddToTableOpen={isModalAddToTableOpen}
      />
      <ModalSelectAjustements
        isOpen={
          modalAdjustmentsState && modalAdjustmentsState.isOpen && modalAdjustmentsState.modal === 1
        }
        onClose={() =>
          setModalAdjustmentsState({
            isOpen: false,
            modal: 1
          })
        }
        setModalAction={(e: number, adjustmentType: "global" | "byInvoice") => {
          setModalAdjustmentsState({
            isOpen: true,
            modal: e,
            adjustmentType
          });
        }}
      />
      <ModalListAdjustments
        visible={
          modalAdjustmentsState && modalAdjustmentsState.isOpen && modalAdjustmentsState.modal === 2
        }
        onCancel={(succesfullyApplied) => {
          if (succesfullyApplied) {
            mutate();
            setModalAdjustmentsState({
              isOpen: false,
              modal: 0
            });
          } else {
            setModalAdjustmentsState({
              isOpen: true,
              modal: 1
            });
          }
        }}
        setModalAction={(e: number) => {
          setModalAdjustmentsState((prev) => {
            return { ...prev, isOpen: true, modal: e };
          });
        }}
        addGlobalAdjustment={handleAdd}
        modalAdjustmentsState={modalAdjustmentsState}
        selectedInvoices={selectedRows}
      />
      <ModalCreateAdjustment
        isOpen={
          modalAdjustmentsState && modalAdjustmentsState.isOpen && modalAdjustmentsState.modal === 3
        }
        onCancel={(created?: Boolean) => {
          if (created) {
            setModalAdjustmentsState({ isOpen: false, modal: 0 });
            mutate();
          } else {
            setModalAdjustmentsState((prev) => {
              return { ...prev, isOpen: true, modal: 2 };
            });
          }
        }}
      />
      <ModalCreateAdjustmentByInvoice
        isOpen={
          modalAdjustmentsState && modalAdjustmentsState.isOpen && modalAdjustmentsState.modal === 4
        }
        onCancel={(created?: Boolean) => {
          if (created) {
            setModalAdjustmentsState({ isOpen: false, modal: 0 });
            mutate();
          } else {
            setModalAdjustmentsState((prev) => {
              return { ...prev, isOpen: true, modal: 2 };
            });
          }
        }}
      />
      <ModalEditRow
        visible={editingRow.isOpen}
        row={editingRow.row}
        editing_type={editingRow.editing_type}
        onCancel={(succesfullyApplied) => {
          setEditingRow({
            isOpen: false,
            row: undefined
          });
          if (succesfullyApplied) mutate();
        }}
        handleCreateAdjustment={handleCreateAdjustment}
      />
      <ModalAttachEvidence
        selectedEvidence={selectedEvidence}
        setSelectedEvidence={setSelectedEvidence}
        handleAttachEvidence={saveApp}
        commentary={commentary}
        setCommentary={setCommentary}
        isOpen={isModalOpen.selected === 1}
        loading={loadingSave}
        handleCancel={() => setIsModalOpen({ selected: 0 })}
        confirmDisabled={isConfirmDisabled}
        isMandatory={{ evidence: true, commentary: true }}
        defaultEvidenceFile={
          applicationData?.summary?.attachment_name && applicationData?.summary?.url_attachment
            ? {
                name: applicationData.summary.attachment_name,
                url: applicationData.summary.url_attachment
              }
            : undefined
        }
        showDefaultFile={useDefaultFileInEvidence}
        setShowDefaultFile={setUseDefaultFileInEvidence}
      />
      <ModalApplyAI
        isOpen={isModalOpen.selected === 2}
        onClose={() => setIsModalOpen({ selected: 0 })}
        mutate={mutate}
      />

      <ModalGenerateActionApplyTab
        isOpen={isModalOpen.selected === 3}
        onClose={() => setIsModalOpen({ selected: 0 })}
        handleOpenModal={handleOpenModal}
        selectedRows={selectedRows}
        downloadLog={handleDownloadLog}
        downloadExcelLog={handleDownloadExcelLog}
      />

      <ModalConfirmAction
        isOpen={isModalOpen.selected === 4}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
        }}
        onOk={handleDeleteMultipleRows}
        title={`¿Está seguro de eliminar ${selectedRows?.length ?? 0} fila${(selectedRows?.length ?? 0) > 1 ? "s" : ""}?`}
        okText="Eliminar"
        okLoading={loadingRequest}
      />

      <ModalEditAdjustments
        isOpen={isModalOpen.selected === 5}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            setIsModalOpen({ selected: 3 });
          } else {
            setIsModalOpen({ selected: 0 });
            deselectAllRows();
            mutate();
          }
        }}
        selectedRows={selectedRows}
        handleDeleteRow={handleRemoveRow}
      />

      <ModalConfirmAction
        isOpen={isModalOpen.selected === 6}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
        }}
        onOk={handleDeleteAllRows}
        title={`¿Está seguro de eliminar todo?`}
        okText="Eliminar"
        okLoading={loadingRequest}
      />
      <ModalChangeAIPrompt
        isOpen={isModalOpen.selected === 7}
        onClose={() => setIsModalOpen({ selected: 0 })}
      />
    </>
  );
};

export default ApplyTab;
