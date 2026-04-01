import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./applynoveltymodal.scss";
import { ISelectedAccountingAdjustment } from "../ModalActionDiscountCredit/ModalActionDiscountCredit";
import UiTabs from "@/components/ui/ui-tabs";
import ItemApplyModal from "@/components/atoms/ItemsApplyModal/ItemsApplyModal";
import Table, { ColumnsType } from "antd/es/table";
import { Flex, InputNumber, Spin } from "antd";
import { applyAccountingAdjustment } from "@/services/accountingAdjustment/accountingAdjustment";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";
import { MessageInstance } from "antd/es/message/interface";
import { IIncidentDetail } from "@/hooks/useNoveltyDetail";

interface Props {
  type: number;
  selectedRows: ISelectedAccountingAdjustment[];
  setCurrentView: Dispatch<SetStateAction<string>>;
  invoiceSelected?: IIncidentDetail[];
  messageApi: MessageInstance;
  onClosePrincipalModal?: () => void;
  selectedEvidence: File | null;
  onResolve: (data: { file?: File; comment: string }) => void;
  comment?: string;
}

interface IcurrentInvoices {
  id: number;
  current_value: number;
  newBalance: number;
}

interface NormalizedValue {
  invoice_id: number;
  discounts: {
    id: number;
    balanceToApply: number;
  }[];
}

export const ApplyNoveltyModal = ({
  type,
  selectedRows: selectedNotes,
  setCurrentView,
  messageApi,
  onClosePrincipalModal,
  selectedEvidence,
  onResolve,
  comment,
  invoiceSelected = []
}: Props) => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const [selectTab, setSelectTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInvoices, setCurrentInvoices] = useState<IcurrentInvoices[]>([]);
  const [currentAdjustment, setCurrentAdjustment] = useState(
    selectedNotes.map((row) => row.current_value)
  );
  const [currentAdjustmentStatic, _setCurrentAdjustmentStatic] = useState(
    selectedNotes.map((row) => row.current_value)
  );
  const [applyValues, setApplyValues] = useState<{
    [key: string]: {
      balanceToApply: number;
      idAdjustment: number;
    }[];
  }>({});

  useEffect(() => {
    setCurrentInvoices(
      invoiceSelected.map((invoice) => ({
        id: invoice.invoice_id,
        current_value: invoice.invoice_cashport_value,
        newBalance: invoice.invoice_cashport_value
      }))
    );
  }, [invoiceSelected]);

  const handleValueChange = (valueApplied: number, index: number, record: IcurrentInvoices) => {
    setCurrentAdjustment((prev) => {
      const previousValue =
        applyValues[record.id]?.find((apply) => apply.idAdjustment === selectedNotes[index].id)
          ?.balanceToApply ?? 0;

      let newValue: number;
      if (record.newBalance < valueApplied) {
        newValue = prev[index] - record.newBalance;
      } else {
        newValue = prev[index] + previousValue - valueApplied;
      }
      return prev.map((value, i) => (i === index ? Math.max(0, newValue) : value));
    });
  };

  const handleApplyValueChange = (value: number | null, record: IcurrentInvoices) => {
    const previousValue =
      applyValues[record.id]?.find((apply) => apply.idAdjustment === selectedNotes[selectTab].id)
        ?.balanceToApply ?? 0;
    if (value && value > currentAdjustment[selectTab] && previousValue <= 0) {
      value = 0;
    }
    if (value && value > selectedNotes[selectTab].current_value) {
      value = 0;
    }
    if (value && value > previousValue && value > currentAdjustment[selectTab] + previousValue) {
      value = previousValue;
    }
    const maxApplicableValue = Math.min(value ?? 0, record.newBalance + previousValue);

    setApplyValues((prev) => ({
      ...prev,
      [record.id]: [
        ...(prev[record.id] ?? []).filter(
          (apply) => apply.idAdjustment !== selectedNotes[selectTab].id
        ),
        { balanceToApply: maxApplicableValue, idAdjustment: selectedNotes[selectTab].id }
      ]
    }));

    setCurrentInvoices((prev) => {
      return prev.map((invoice) => {
        if (invoice.id === record.id) {
          const difference = maxApplicableValue - previousValue;
          return {
            ...invoice,
            newBalance: invoice.newBalance - difference
          };
        }
        return invoice;
      });
    });
    handleValueChange(value ?? 0, selectTab, record);
  };

  const normalizarApplyValues = (applyValues: {
    [key: string]: { balanceToApply: number; idAdjustment: number }[];
  }): NormalizedValue[] => {
    return Object.keys(applyValues).map((key) => ({
      invoice_id: parseInt(key),
      discounts: applyValues[key].map((value) => ({
        id: value.idAdjustment,
        balanceToApply: value.balanceToApply
      }))
    }));
  };

  const handleAttachEvidence = async () => {
    setIsLoading(true);
    try {
      const normalizedData = normalizarApplyValues(applyValues);
      const adjustmentData = JSON.stringify(normalizedData);
      onResolve({
        file: selectedEvidence || undefined,
        comment: comment || ""
      });
      if (!selectedEvidence) {
        setIsLoading(false);
        return;
      }
      const typeAjustment = type === 2 ? 9 : type === 1 ? 10 : 11;
      const response = await applyAccountingAdjustment(
        adjustmentData,
        [selectedEvidence],
        projectIdParam as string,
        clientIdParam as string,
        typeAjustment,
        comment
      );
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "Ajuste contable aplicado correctamente"
        });
        onClosePrincipalModal && onClosePrincipalModal();
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error al aplicar el ajuste contable"
      });
      console.error("Error applying accounting adjustment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnsType<IcurrentInvoices> = [
    {
      title: "ID Factura",
      dataIndex: "id",
      key: "id",
      render: (text) => <a target="_blank">{text}</a>
    },
    {
      title: "Pendiente",
      dataIndex: "current_value",
      key: "current_value",
      render: (text) => `$${text || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    {
      title: "Saldo nuevo",
      dataIndex: "newBalance",
      key: "newBalance",
      render: (text) => `$${text || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    {
      title: "Valor a aplicar",
      key: "applyValue",
      className: "column__apply__value",
      render: (_, record) => (
        <InputNumber
          min={0}
          value={
            applyValues[record.id]?.find(
              (apply) => apply.idAdjustment === selectedNotes[selectTab]?.id
            )?.balanceToApply
          }
          max={currentAdjustmentStatic[selectTab] + 1}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          onBlur={(event) => {
            const rawValue = event.target.value.replace(/,/g, "");
            const parsedValue = parseFloat(rawValue);
            handleApplyValueChange(isNaN(parsedValue) ? 0 : parsedValue, record);
          }}
          className="button__number__adjustment"
          disabled={record.current_value === 0 || record.newBalance === 0}
        />
      )
    }
  ];

  return (
    <div className="modalContentApply">
      <p className="subTitleModalApply">Define el monto a aplicar a cada factura</p>
      {selectedNotes.length > 1 && (
        <UiTabs
          tabs={selectedNotes.map((row) => row.id.toString())}
          onTabClick={(index) => setSelectTab(index)}
          initialTabIndex={selectTab}
          className="scrollableTabs"
        />
      )}
      <ItemApplyModal
        type={type}
        item={selectedNotes.length > 1 ? selectedNotes[selectTab] : selectedNotes[0]}
        availableValue={currentAdjustment[selectTab]}
      />
      <Table dataSource={currentInvoices} columns={columns} pagination={false} />
      <Flex gap="8px">
        <button
          type="button"
          className="button__action__text button__action__text__white"
          onClick={() => setCurrentView("selectNote")}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`button__action__text ${selectedNotes.length > 0 ? "button__action__text__green" : ""}`}
          onClick={() => handleAttachEvidence()}
          disabled={Object.keys(applyValues).length === 0}
        >
          {isLoading ? <Spin size="small" /> : "Continuar"}
        </button>
      </Flex>
    </div>
  );
};
