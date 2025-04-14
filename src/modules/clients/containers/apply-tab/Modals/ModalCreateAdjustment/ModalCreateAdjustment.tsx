import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Modal } from "antd";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CaretLeft, Plus } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { createGlobalAdjustment } from "@/services/applyTabClients/applyTabClients";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { useAcountingAdjustment } from "@/hooks/useAcountingAdjustment";
import { extractSingleParam } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSelect from "@/components/ui/general-select";
import InputMoney from "@/components/atoms/inputs/InputMoney/InputMoney";

import "./modalCreateAdjustment.scss";

interface ISelect {
  value: string;
  label: string;
}

interface IAdjustment {
  motive?: ISelect;
  detail?: string;
  amount?: string;
}
interface ModalCreateAdjustmentProps {
  // eslint-disable-next-line no-unused-vars
  onCancel: (created?: Boolean) => void;
  isOpen: boolean;
}

const ModalCreateAdjustment: React.FC<ModalCreateAdjustmentProps> = ({ isOpen, onCancel }) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const { showMessage } = useMessageApi();
  const { mutate } = useAcountingAdjustment(clientId.toString(), projectId.toString(), 2);
  const { data: motives } = useFinancialDiscountMotives();

  const [loadingCreate, setLoadingCreate] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<{ adjustments: IAdjustment[] }>({
    mode: "onChange",
    defaultValues: { adjustments: [] }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "adjustments"
  });

  useEffect(() => {
    if (isOpen) {
      reset(); // Clear the form when modal opens
      append({ motive: undefined, detail: undefined, amount: undefined });
    }
  }, [isOpen, append, reset]);

  const onSubmit = async (data: { adjustments: IAdjustment[] }) => {
    setLoadingCreate(true);
    const adjustments = data.adjustments.map((adjustment) => ({
      motive: parseInt(adjustment?.motive?.value || "0"),
      amount: Number(adjustment.amount?.replaceAll(".", "").replaceAll(",", ".")) || 0,
      description: adjustment.detail || ""
    }));
    try {
      await createGlobalAdjustment(projectId, clientId, adjustments);
      showMessage("success", "Ajuste(s) creado correctamente");
      mutate();
      onCancel(true);
      console.log("Ajustes creados:", adjustments);
    } catch (error) {
      showMessage("error", "Error al crear el ajuste(s)");
    }
    setLoadingCreate(false);
  };

  return (
    <>
      <Modal
        className="modalCreateAdjustment"
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

        <div className="modalCreateAdjustment__allAdjustments">
          {fields.map((field, index) => (
            <div key={field.id} className="modalCreateAdjustment__adjustment">
              <Controller
                name={`adjustments.${index}.motive`}
                control={control}
                rules={{ required: "Motivo es obligatorio" }}
                render={({ field }) => (
                  <GeneralSelect
                    errors={errors?.adjustments?.[index]?.motive}
                    field={field}
                    title="Motivo"
                    placeholder="Ingresar Motivo"
                    options={
                      motives?.map((motive) => ({ value: motive.id, label: motive.name })) || []
                    }
                    showSearch
                    customStyleContainer={{ width: "100%" }}
                    customStyleTitle={{ marginBottom: "4px" }}
                  />
                )}
              />

              <InputForm
                titleInput="Detalle"
                control={control}
                nameInput={`adjustments.${index}.detail`}
                error={errors?.adjustments?.[index]?.detail}
              />
              <InputMoney
                name={`adjustments.${index}.amount`}
                control={control}
                titleInput="Valor"
                placeholder="Valor"
                validationRules={{
                  required: "Valor es obligatorio",
                  validate: (value) => parseFloat(value) != 0 || "El valor debe ser distinto a 0"
                }}
                allowNegative={true}
                error={errors?.adjustments?.[index]?.amount}
                fixedDecimalScale={true}
              />
            </div>
          ))}
        </div>

        <button
          className="modalCreateAdjustment__addAdjustment"
          onClick={() => append({ motive: undefined, detail: undefined, amount: undefined })}
        >
          <Plus />
          Agregar ajuste
        </button>

        <div className="modal-footer">
          <SecondaryButton fullWidth onClick={() => onCancel()}>
            Cancelar
          </SecondaryButton>

          <PrincipalButton
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
            fullWidth
            loading={loadingCreate}
          >
            Crear ajuste
          </PrincipalButton>
        </div>
      </Modal>
    </>
  );
};

export default ModalCreateAdjustment;
