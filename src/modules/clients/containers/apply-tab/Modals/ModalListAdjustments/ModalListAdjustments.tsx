import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Modal, Pagination, Spin } from "antd";
import { CaretLeft, Plus } from "phosphor-react";

import { IFinancialDiscount } from "@/hooks/useAcountingAdjustment";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";
import { getApplicationAdjustments } from "@/services/applyTabClients/applyTabClients";

import UiSearchInputLong from "@/components/ui/search-input-long";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import CheckboxColoredValues from "@/components/ui/checkbox-colored-values/checkbox-colored-values";
import ModalApplySpecificAdjustment from "../ModalApplySpecificAdjustment/ModalApplySpecificAdjustment";

import { IModalAdjustmentsState } from "../../apply-tab";
import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

import "./modalListAdjustments.scss";

interface ModalListAdjustmentsProps {
  visible: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (actionAplied?: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  setModalAction: (modalAction: number) => void;
  addGlobalAdjustment: (
    // eslint-disable-next-line no-unused-vars
    adding_type: "invoices" | "payments" | "discounts",
    // eslint-disable-next-line no-unused-vars
    selectedIds: number[]
  ) => Promise<void>;
  modalAdjustmentsState: IModalAdjustmentsState;
  selectedInvoices?: IApplyTabRecord[];
}

const ModalListAdjustments: React.FC<ModalListAdjustmentsProps> = ({
  visible,
  onCancel,
  setModalAction,
  addGlobalAdjustment,
  modalAdjustmentsState,
  selectedInvoices
}) => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { showMessage } = useMessageApi();
  const [adjustments, setAdjustments] = useState<IFinancialDiscount[]>();
  const [selectedRows, setSelectedRows] = useState<IFinancialDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const [isApplyingSpecificAdjustment, setIsApplyingSpecificAdjustment] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoadingData(true);
      const response = await getApplicationAdjustments(projectId, clientId);
      setAdjustments(response.map((item) => item.financial_discounts).flat());
      setLoadingData(false);
    };
    try {
      fetchDiscounts();
    } catch (error) {
      console.error("error fetchDiscounts", error);
    }
  }, [projectId, clientId, visible]);

  useEffect(() => {
    return () => {
      setSelectedRows([]);
      setSearchQuery("");
      setCurrentPage(1);
    };
  }, [visible]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateAdjustments = () => {
    if (modalAdjustmentsState.adjustmentType === "global") {
      setModalAction(3);
    } else if (modalAdjustmentsState.adjustmentType === "byInvoice") {
      setModalAction(4);
    }
  };

  const handleSelectOne = (checked: boolean, row: IFinancialDiscount) => {
    setSelectedRows((prevSelectedRows) =>
      checked
        ? [...prevSelectedRows, row]
        : prevSelectedRows.filter((selected) => selected.id !== row.id)
    );
  };

  const handleAddAdjustments = async () => {
    setLoading(true);
    if (modalAdjustmentsState.adjustmentType === "global") {
      await addGlobalAdjustment(
        "discounts",
        selectedRows.map((row) => row.id)
      );
    } else if (modalAdjustmentsState.adjustmentType === "byInvoice") {
      // rectify there are invoices selected
      if (!selectedInvoices?.length || !selectedInvoices[0].id_erp) {
        showMessage("error", "No hay facturas seleccionadas");
        setLoading(false);
        return;
      }

      setIsApplyingSpecificAdjustment(true);
    }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!adjustments) return [];
    return adjustments.filter((row) => row.id.toString().includes(searchQuery));
  }, [adjustments, searchQuery]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData?.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {!isApplyingSpecificAdjustment ? (
        <Modal
          open={visible}
          onCancel={() => onCancel()}
          footer={null}
          width={700}
          className="modal-list-adjustments"
        >
          <div onClick={() => onCancel()} className="header">
            <CaretLeft size={24} />
            <h2>Agregar ajuste</h2>
          </div>
          <h2 className="modal-subtitle">Selecciona los ajustes a aplicar</h2>
          <div className="search-container">
            <UiSearchInputLong
              placeholder="Buscar"
              className={"custom-input"}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {loadingData ? (
            <Flex justify="center" style={{ width: "100%", margin: "2rem 0" }}>
              <Spin />
            </Flex>
          ) : (
            <>
              <div className="adjustments-list">
                {paginatedRows?.map((row) => (
                  <CheckboxColoredValues
                    customStyles={{ height: "76px" }}
                    customStyleDivider={{ width: "6px", height: "44px", alignSelf: "center" }}
                    key={row.id}
                    onChangeCheckbox={(e) => {
                      handleSelectOne(e.target.checked, row);
                    }}
                    checked={selectedRows.some((selected) => selected.id === row.id)}
                    content={
                      <Flex style={{ width: "100%" }} justify="space-between" align="center">
                        <Flex vertical>
                          <h4 className="adjustments-list__title">Nota crédito {row.id}</h4>
                          {row.comment && (
                          <p className="adjustments-list__subtitle">{row.comment}</p>
                        )}
                        </Flex>

                        <Flex vertical>
                          <h3 className="adjustments-list__amount">
                            {formatMoney(row.current_value)}
                          </h3>
                          <p className="adjustments-list__subvalue">
                            {formatMoney(row.initial_value)}
                          </p>
                        </Flex>
                      </Flex>
                    }
                  />
                ))}
              </div>
              <Pagination
                pageSize={ITEMS_PER_PAGE}
                current={currentPage}
                onChange={handlePageChange}
                total={filteredData?.length}
                showSizeChanger={false}
                style={{ textAlign: "right", margin: ".5rem 0" }}
              />
            </>
          )}
          <div className="create-adjustment">
            <button onClick={handleCreateAdjustments} className="create-adjustment-btn">
              <Plus size={20} />
              Crear ajuste
            </button>
          </div>

          <div className="modal-footer">
            <SecondaryButton fullWidth onClick={() => onCancel()}>
              Cancelar
            </SecondaryButton>
            <PrincipalButton
              fullWidth
              onClick={handleAddAdjustments}
              loading={loading}
              disabled={!selectedRows.length}
            >
              Agregar
            </PrincipalButton>
          </div>
        </Modal>
      ) : (
        <ModalApplySpecificAdjustment
          open={isApplyingSpecificAdjustment}
          onCancel={(succesfullyApplied?: boolean) => {
            setIsApplyingSpecificAdjustment(false);
            if (succesfullyApplied) {
              onCancel(true);
            }
          }}
          selectedAdjustments={selectedRows}
          selectedInvoices={selectedInvoices}
        />
      )}
    </>
  );
};

export default ModalListAdjustments;
