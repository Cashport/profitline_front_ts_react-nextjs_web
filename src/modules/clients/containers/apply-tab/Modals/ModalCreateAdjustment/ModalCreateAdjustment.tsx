import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Modal } from "antd";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CaretLeft, Plus } from "phosphor-react";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("clients.applyModals");
  const tCommon = useTranslations("common");
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
      showMessage("success", t("shared.created", { count: adjustments.length }));
      mutate();
      onCancel(true);
      console.log("Ajustes creados:", adjustments);
    } catch (error) {
      showMessage("error", t("shared.createError"));
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
          <h2>{t("shared.createAdjustment")}</h2>
        </div>

        <div className="modalCreateAdjustment__allAdjustments">
          {fields.map((field, index) => (
            <div key={field.id} className="modalCreateAdjustment__adjustment">
              <Controller
                name={`adjustments.${index}.motive`}
                control={control}
                rules={{ required: t("createAdjustment.reasonRequired") }}
                render={({ field }) => (
                  <GeneralSelect
                    errors={errors?.adjustments?.[index]?.motive}
                    field={field}
                    title={tCommon("fields.reason")}
                    placeholder={t("createAdjustment.reasonPlaceholder")}
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
                titleInput={tCommon("fields.detail")}
                control={control}
                nameInput={`adjustments.${index}.detail`}
                error={errors?.adjustments?.[index]?.detail}
              />
              <InputMoney
                name={`adjustments.${index}.amount`}
                control={control}
                titleInput={tCommon("fields.value")}
                placeholder={tCommon("fields.value")}
                validationRules={{
                  required: t("createAdjustment.amountRequired"),
                  validate: (value) =>
                    parseFloat(value?.replaceAll(".", "").replaceAll(",", ".") || "0") != 0 ||
                    t("createAdjustment.amountNonZero")
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
          {t("shared.addAdjustment")}
        </button>

        <div className="modal-footer">
          <SecondaryButton fullWidth onClick={() => onCancel()}>
            {tCommon("actions.cancel")}
          </SecondaryButton>

          <PrincipalButton
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
            fullWidth
            loading={loadingCreate}
          >
            {t("shared.createAdjustment")}
          </PrincipalButton>
        </div>
      </Modal>
    </>
  );
};

export default ModalCreateAdjustment;
