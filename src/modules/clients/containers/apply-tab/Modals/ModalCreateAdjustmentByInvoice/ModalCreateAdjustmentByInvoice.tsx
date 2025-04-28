import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Flex, Modal, Table } from "antd";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CaretLeft, CopySimple, Plus } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import {
  createGlobalAdjustment,
  ICreateGlobalAdjustment
} from "@/services/applyTabClients/applyTabClients";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { useAcountingAdjustment } from "@/hooks/useAcountingAdjustment";
import { extractSingleParam, toNumberOrZero } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSelect from "@/components/ui/general-select";

import "./modalCreateAdjustmentByInvoice.scss";

interface ISelect {
  value: string;
  label: string;
}

interface IAdjustment {
  adjustment?: ISelect;
}

interface IColumn {
  title: string;
  dataIndex: string;
  key: string;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  render?: (text: any, record: any, index: number) => React.ReactNode;
}

interface ModalCreateAdjustmentByInvoiceProps {
  // eslint-disable-next-line no-unused-vars
  onCancel: (created?: Boolean) => void;
  isOpen: boolean;
}

const ModalCreateAdjustmentByInvoice: React.FC<ModalCreateAdjustmentByInvoiceProps> = ({
  isOpen,
  onCancel
}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const height = useScreenHeight();
  const { showMessage } = useMessageApi();
  const { mutate } = useAcountingAdjustment(clientId.toString(), projectId.toString(), 2);
  const { data: motives } = useFinancialDiscountMotives();

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(0); // Estado para forzar la actualización
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [dataSource, setDataSource] = useState<{ [key: string]: string | any }[]>([]);
  const [processedData, setProcessedData] = useState<{
    total: number | string;
    invoice: string;
    // a key that can be with any string name baut value its a number
    [key: string]: number | string;
  }>({
    total: 0, // Default value for total
    invoice: "" // Default value for invoice
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch
  } = useForm<{ adjustments: IAdjustment[] }>({
    mode: "onChange",
    defaultValues: { adjustments: [] }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "adjustments"
  });

  const adjustments = watch("adjustments");

  useEffect(() => {
    if (isOpen) {
      reset();
      append({ adjustment: undefined });
    }
  }, [isOpen, append, reset]);

  useEffect(() => {
    const dynamicColumns = adjustments
      .filter((adj) => adj.adjustment)
      .map((adj) => ({
        title: adj.adjustment?.label || "",
        dataIndex: adj.adjustment?.label.split(" ").join("_") || "",
        key: adj.adjustment?.value || "",
        render: (text: any) => formatMoney(text)
      }));

    setColumns([
      {
        title: "ID Factura",
        dataIndex: "invoice",
        key: "invoice",
        className: "invoiceId"
      },
      ...dynamicColumns
    ]);
  }, [adjustments, updateFlag]);

  useEffect(() => {
    if (isOpen) {
      reset(); // Clear the form when modal opens
      append({ adjustment: undefined });
      setDataSource([]);
      setProcessed(false);
      setProcessedData({ total: 0, invoice: "" });
    }
  }, [isOpen, append, reset]);

  const onSubmit = async (data: { adjustments: IAdjustment[] }) => {
    setLoadingCreate(true);

    if (processed) {
      const finalAdjustments = dataSource.flatMap((row) => {
        return data.adjustments
          .filter((adj) => adj.adjustment)
          .map((adj) => {
            const labelKey = adj.adjustment?.label?.split(" ").join("_") ?? "";
            const amount = row[labelKey];
            if (!amount) return null;

            return {
              motive: parseInt(adj.adjustment?.value || "0"),
              amount: toNumberOrZero(amount),
              invoice_id: row.invoice,
              description: "Adjustment by invoice created in Application Tab"
            };
          })
          .filter(Boolean) as ICreateGlobalAdjustment[]; // elimina los nulls si alguna fila no tenía monto
      });

      try {
        await createGlobalAdjustment(
          projectId,
          clientId,
          finalAdjustments.filter((adjustment) => adjustment !== null)
        );
        showMessage("success", "Ajuste(s) creado correctamente");
        mutate();
        onCancel(true);
      } catch (error) {
        showMessage("error", "Error al crear el ajuste(s)");
      }
      return setLoadingCreate(false);
    }

    try {
      const proccessedData: any = dataSource.reduce((acc, row) => {
        Object.entries(row).forEach(([key, value]) => {
          if (key === "invoice") return acc[key] ? (acc[key] += 1) : (acc[key] = 1);
          if (value) {
            acc[key] = acc[key]
              ? toNumberOrZero(acc[key]) + toNumberOrZero(value)
              : toNumberOrZero(value);
            acc["total"] = acc["total"]
              ? toNumberOrZero(acc["total"]) + toNumberOrZero(value)
              : toNumberOrZero(value);
          }
        });
        return acc;
      }, {});
      setProcessedData(proccessedData);
      setProcessed(true);
    } catch (error) {
      showMessage("error", "Error al crear el ajuste(s)");
    }
    setLoadingCreate(false);
  };

  const handlePasteInvoices = async () => {
    try {
      const text = await navigator.clipboard.readText();

      const rows = text.split("\n").map((row) => row.trim());
      const vals = rows.map((row) => row.split("\t").map((val) => val.trim()));

      const data = vals.map((val) => {
        const obj: { [key: string]: string } = {};
        columns.forEach((col, index) => {
          obj[col.dataIndex] = val[index] || "";
        });
        return obj;
      });

      setDataSource(data);
    } catch (err) {
      console.error("Error pasting invoices:", err);
      showMessage("error", "Error al pegar facturas. Por favor, inténtelo de nuevo.");
    }
  };

  const handleSelectChange = () => {
    setUpdateFlag((prev) => prev + 1); // Forzar la actualización
  };

  const handleCancel = () => {
    if (processed) {
      return setProcessed(false);
    }
    onCancel();
  };
  return (
    <>
      <Modal
        className="modalCreateAdjustmentByInvoice"
        width={"60%"}
        open={isOpen}
        closeIcon={false}
        onCancel={() => onCancel()}
        footer={null}
      >
        <div onClick={() => onCancel()} className="header">
          <CaretLeft size={24} />
          <h2>Crear ajuste</h2>
        </div>

        {processed ? (
          <div className="modalCreateAdjustmentByInvoice__summary">
            <Flex justify="space-between">
              <p>Facturas ({processedData?.invoice})</p>
              <p>{formatMoney(processedData?.total)}</p>
            </Flex>

            {Object.keys(processedData).map((key) => {
              if (key === "invoice" || key === "total") return null;
              return (
                <Flex justify="space-between" key={key}>
                  <p>{key.split("_").join(" ")}</p>
                  <p>{formatMoney(processedData[key])}</p>
                </Flex>
              );
            })}
            {/* TO DO IF API IS CREATED FOR COMPARISON */}
            {/* <Flex justify="space-between" className="total">
              <p>Pendiente</p>
              <p>$XXX.XXX.XXX</p>
            </Flex> */}
          </div>
        ) : (
          <>
            <div className="modalCreateAdjustmentByInvoice__allAdjustments">
              {fields.map((field, index) => (
                <Controller
                  key={field.id}
                  name={`adjustments.${index}.adjustment`}
                  control={control}
                  rules={{ required: "Tipo de ajuste es obligatorio" }}
                  render={({ field }) => (
                    <GeneralSelect
                      errors={errors?.adjustments?.[index]?.adjustment}
                      field={{
                        ...field,
                        onChange: (selectedOption) => {
                          field.onChange(selectedOption);
                          handleSelectChange();
                        }
                      }}
                      title="Tipo de ajuste"
                      placeholder="Seleccionar tipo de ajuste"
                      options={
                        motives?.map((motive) => ({ value: motive.id, label: motive.name })) || []
                      }
                      showSearch
                      customStyleContainer={{ width: "100%" }}
                      customStyleTitle={{ marginBottom: "4px" }}
                    />
                  )}
                />
              ))}
            </div>

            <button
              className="modalCreateAdjustmentByInvoice__addAdjustment"
              onClick={() => append({ adjustment: undefined })}
            >
              <Plus />
              Agregar otro ajuste
            </button>

            <div className="pasteInvoices" onClick={handlePasteInvoices}>
              <CopySimple size={20} />
              Pegar desde excel
            </div>
          </>
        )}

        <Table
          className="AdjustmentsTable"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          scroll={{ y: height - 520, x: 100 }}
        />

        <div className="modal-footer">
          <SecondaryButton fullWidth onClick={handleCancel}>
            Cancelar
          </SecondaryButton>

          <PrincipalButton
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
            fullWidth
            loading={loadingCreate}
          >
            {processed ? "Aplicar" : "Procesar"}
          </PrincipalButton>
        </div>
      </Modal>
    </>
  );
};

export default ModalCreateAdjustmentByInvoice;
