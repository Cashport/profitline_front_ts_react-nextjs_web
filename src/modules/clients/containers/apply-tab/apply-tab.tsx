import React, { useCallback, useMemo, useState } from "react";
import { DotsThree, Plus } from "phosphor-react";
import { Button, Flex, Spin } from "antd";

import { useApplicationTable } from "@/hooks/useApplicationTable";
import Collapse from "@/components/ui/collapse";
import LabelCollapse from "@/components/ui/label-collapse";
import { useParams } from "next/navigation";

import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";
import {
  addItemsToTable,
  removeItemsFromTable,
  saveApplication
} from "@/services/applyTabClients/applyTabClients";
import { useMessageApi } from "@/context/MessageContext";
// import { useSelectedPayments } from "@/context/SelectedPaymentsContext";

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

import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

import "./apply-tab.scss";

interface ISelectedRowKeys {
  invoices: React.Key[];
  payments: React.Key[];
  discounts: React.Key[];
}

export interface IModalAddToTableOpen {
  isOpen: boolean;
  adding?: "invoices" | "payments";
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

const ApplyTab: React.FC = () => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const [searchQuery, setSearchQuery] = useState("");
  const { showMessage } = useMessageApi();
  const [loadingSave, setLoadingSave] = useState(false);
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
  const [openEvidenceModal, setOpenEvidenceModal] = useState(false);
  const [commentary, setCommentary] = useState<string>();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);

  const { data: applicationData, isLoading, mutate, isValidating } = useApplicationTable();
  const showModal = (adding_type: "invoices" | "payments") => {
    setIsModalAddToTableOpen({
      isOpen: true,
      adding: adding_type
    });
  };

  const handleCancel = () => {
    setIsModalAddToTableOpen({
      isOpen: false
    });
  };

  const handleAdd = async (
    adding_type: "invoices" | "payments" | "discounts",
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

  const handlePrintSelectedRows = () => {
    // I leave this here for future use
    for (const key in selectedRowKeys) {
      if (selectedRowKeys.hasOwnProperty(key)) {
        const typedKey = key as keyof ISelectedRowKeys; // Type assertion to avoid TS error
        const selectedRows = selectedRowKeys[typedKey];
        if (selectedRows.length > 0) {
          console.info(`Selected ${key}:`, selectedRows);
        }
      }
    }
  };

  const saveApp = async () => {
    setLoadingSave(true);
    try {
      await saveApplication(projectId, clientId, commentary ?? "", selectedEvidence[0]);
      showMessage("success", "Se ha guardado la aplicación correctamente");
      mutate();
      setOpenEvidenceModal(false);
    } catch (error) {
      showMessage("error", "Ha ocurrido un error al guardar la aplicación");
    }
    setLoadingSave(false);
  };

  const handleSave = () => {
    setOpenEvidenceModal(true);
  };

  const filteredData = useMemo(() => {
    if (!applicationData) return { invoices: [], payments: [], discounts: [] };

    const filteredInvoices = applicationData.invoices.filter((invoice) =>
      invoice?.id_erp?.toString().toLowerCase().includes(searchQuery)
    );

    const filteredPayments = applicationData.payments.filter((payment) =>
      payment?.payment_id?.toString().toLowerCase().includes(searchQuery)
    );

    const filteredDiscounts = applicationData.discounts.filter((discount) =>
      discount?.financial_discount_id?.toString().toLowerCase().includes(searchQuery)
    );

    return {
      invoices: filteredInvoices,
      payments: filteredPayments,
      discounts: filteredDiscounts
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

    const discounts = {
      statusName: "ajustes",
      color: "#E53261",
      statusId: 3,
      itemsList: filteredData?.discounts,
      total: filteredData?.discounts.length && applicationData?.summary.total_discounts,
      count: filteredData?.discounts.length
    };

    return [invoices, payments, discounts];
  }, [filteredData]);

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

  return (
    <>
      <ModalResultAppy
        invoices={applicationData?.summary.total_invoices}
        desconts={applicationData?.summary.total_discounts}
        payments={applicationData?.summary.total_payments}
        total={applicationData?.summary.total_balance}
      />
      <div className="applyContainerTab">
        <Flex justify="space-between" className="applyContainerTab__header clientStickyHeader">
          <Flex gap={"0.5rem"}>
            <UiSearchInput
              className="search"
              placeholder="Buscar"
              onChange={(event) => {
                setSearchQuery(event.target.value.toLowerCase());
              }}
            />
            <Button
              className="button__actions"
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              onClick={handlePrintSelectedRows}
            >
              Generar acción
            </Button>
          </Flex>
          <Button type="primary" className="save-btn" onClick={handleSave}>
            Guardar
          </Button>
        </Flex>

        {isLoading || isValidating ? (
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

                  <Flex
                    className="buttonActionApply"
                    onClick={() => {
                      if (section.statusName === "facturas") {
                        showModal("invoices");
                      }
                      if (section.statusName === "pagos") {
                        showModal("payments");
                      }
                      if (section.statusName === "ajustes") {
                        setModalAdjustmentsState(
                          modalAdjustmentsState.isOpen
                            ? { isOpen: false, modal: 1 }
                            : { isOpen: true, modal: 1 }
                        );
                      }
                    }}
                  >
                    <Plus />
                    <h5 className="">Agregar {`${section.statusName}`}</h5>
                  </Flex>
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
                    />
                  )}
                  {section.statusName === "pagos" && (
                    <PaymentsTable
                      data={section.itemsList}
                      handleDeleteRow={handleRemoveRow}
                      handleEditRow={handleEditRow}
                      rowSelection={rowSelection("payments")}
                    />
                  )}
                  {section.statusName === "ajustes" && (
                    <DiscountTable
                      data={section.itemsList}
                      handleDeleteRow={handleRemoveRow}
                      rowSelection={rowSelection("discounts")}
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
        isOpen={openEvidenceModal}
        setShowEvidenceModal={setOpenEvidenceModal}
        loading={loadingSave}
        handleCancel={() => setOpenEvidenceModal(false)}
      />
    </>
  );
};

export default ApplyTab;
