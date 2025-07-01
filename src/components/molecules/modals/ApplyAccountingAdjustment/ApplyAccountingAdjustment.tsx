import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./applyAccountingAdjustment.scss";
import { ISelectedAccountingAdjustment } from "../ModalActionDiscountCredit/ModalActionDiscountCredit";
import { IInvoice } from "@/types/invoices/IInvoices";
import UiTabs from "@/components/ui/ui-tabs";
import ItemApplyModal from "@/components/atoms/ItemsApplyModal/ItemsApplyModal";
import Table, { ColumnsType } from "antd/es/table";
import { Flex, InputNumber, Modal } from "antd";
import EvidenceModal from "@/modules/clients/components/wallet-tab-evidence-modal/wallet-tab-evidence-modal";
import { applyAccountingAdjustment } from "@/services/accountingAdjustment/accountingAdjustment";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";
import { MessageInstance } from "antd/es/message/interface";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

interface Props {
  type: number;
  selectedRows: ISelectedAccountingAdjustment[];
  setSelectedRows: Dispatch<SetStateAction<ISelectedAccountingAdjustment[]>>;
  setCurrentView: Dispatch<SetStateAction<string>>;
  invoiceSelected?: IInvoice[];
  messageApi: MessageInstance;
  onClosePrincipalModal?: () => void;
}
interface IcurrentInvoices {
  id: number;
  id_erp?: string;
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

interface infoObject {
  file: File;
  fileList: File[];
}

export const ApplyAccountingAdjustment = ({
  type,
  selectedRows: selectedNotes,
  setCurrentView,
  messageApi,
  onClosePrincipalModal,
  invoiceSelected = []
}: Props) => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const [selectTab, setSelectTab] = useState(0);
  const [currentInvoices, setCurrentInvoices] = useState<IcurrentInvoices[]>([]);
  const [currentAdjustment, setCurrentAdjustment] = useState(
    selectedNotes.map((row) => row.current_value)
  );
  const [currentAdjustmentStatic, setCurrentAdjustmentStatic] = useState(
    selectedNotes.map((row) => row.current_value)
  );
  const [applyValues, setApplyValues] = useState<{
    [key: string]: {
      balanceToApply: number;
      idAdjustment: number;
    }[];
  }>({});
  const [openEvidenceModal, setOpenEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setCurrentInvoices(
      invoiceSelected.map((invoice) => ({
        id: invoice.id,
        id_erp: invoice.id_erp,
        current_value: invoice.current_value,
        newBalance: invoice.current_value
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
    // validar que el valor no sea mayor al saldo disponible

    if (value && value > currentAdjustment[selectTab] && previousValue <= 0) {
      value = 0;
    }
    if (value && value > selectedNotes[selectTab].current_value) {
      value = 0;
    }
    if (value && value > previousValue && value > currentAdjustment[selectTab] + previousValue) {
      value = previousValue;
    }

    // Validación para asegurarse de que el valor a aplicar no exceda el newBalance actual
    const maxApplicableValue = Math.min(value ?? 0, record.newBalance + previousValue);

    setApplyValues((prev) => ({
      ...prev, // Toma el estado anterior
      [record.id]: [
        // Mantiene todas las aplicaciones anteriores para el mismo registro, excepto la actualmente seleccionada
        ...(prev[record.id] ?? []).filter(
          (apply) => apply.idAdjustment !== selectedNotes[selectTab].id
        ),
        // Agrega o actualiza la nueva aplicación con el valor ajustado que no excede el balance disponible
        { balanceToApply: maxApplicableValue, idAdjustment: selectedNotes[selectTab].id }
      ]
    }));

    setCurrentInvoices((prev) => {
      return prev.map((invoice) => {
        if (invoice.id === record.id) {
          const difference = maxApplicableValue - previousValue; // Calcula la diferencia entre el valor nuevo y el anterior
          return {
            ...invoice,
            newBalance: invoice.newBalance - difference
          };
        }
        return invoice; // Devuelve las facturas no modificadas
      });
    });
    handleValueChange(value ?? 0, selectTab, record);
  };

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentary(e.target.value);
  };

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
        return;
      }
      setSelectedEvidence(selectedEvidence ? [...selectedEvidence, rawFile] : [rawFile]);
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = selectedEvidence?.filter((file) => file.name !== fileName);
    setSelectedEvidence(updatedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo dse menos de 30 MB.");
        return;
      }
      setSelectedEvidence(selectedEvidence ? [...selectedEvidence, file] : [file]);
    }
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
    setIsSubmitting(true);
    try {
      const normalizedData = normalizarApplyValues(applyValues);
      const adjustmentData = JSON.stringify(normalizedData);
      if (!selectedEvidence) return;
      const typeAjustment = type === 2 ? 9 : type === 1 ? 10 : 11;
      const response = await applyAccountingAdjustment(
        adjustmentData,
        selectedEvidence,
        projectIdParam as string,
        clientIdParam as string,
        typeAjustment,
        commentary
      );
      if (response.status === 200) {
        messageApi.open({
          type: "success",
          content: "Ajuste contable aplicado correctamente"
        });
        setOpenEvidenceModal(false);
        onClosePrincipalModal && onClosePrincipalModal();
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error al aplicar el ajuste contable"
      });
      console.error("Error applying accounting adjustment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnsType<IcurrentInvoices> = [
    {
      title: "ID Factura",
      dataIndex: "id",
      key: "id",
      render: (text, record) => <a target="_blank">{record.id_erp}</a>
    },
    {
      title: "Pendiente",
      dataIndex: "current_value",
      key: "current_value",
      render: (text) => `$${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    },
    {
      title: "Saldo nuevo",
      dataIndex: "newBalance",
      key: "newBalance",
      render: (text) => `$${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          parser={(value) => parseFloat(value?.replace(/\./g, "") || "0")}
          onBlur={(event) => {
            const rawValue = event.target.value.replace(/\./g, "");
            const parsedValue = parseFloat(rawValue);
            handleApplyValueChange(isNaN(parsedValue) ? 0 : parsedValue, record);
          }}
          className="button__number__adjustment"
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

      <FooterButtons
        handleOk={() => setOpenEvidenceModal(true)}
        onClose={() => setCurrentView("select")}
        isConfirmDisabled={!selectedNotes.length}
        titleConfirm="Continuar"
      />

      <Modal
        width={"50%"}
        open={openEvidenceModal}
        onCancel={() => setOpenEvidenceModal(false)}
        footer
      >
        <EvidenceModal
          selectedEvidence={selectedEvidence}
          handleOnChangeDocument={handleOnChangeDocument}
          handleOnDeleteDocument={handleOnDeleteDocument}
          handleFileChange={handleFileChange}
          handleAttachEvidence={handleAttachEvidence}
          handleOnChangeTextArea={handleOnChangeTextArea}
          commentary={commentary}
          setIsSecondView={setOpenEvidenceModal}
          isSubmitting={isSubmitting}
          noComment
        />
      </Modal>
    </div>
  );
};
