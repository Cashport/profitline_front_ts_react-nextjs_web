import React, { useMemo, useState } from "react";
import { useTranslations } from "use-intl";
import "./createDiscount.scss";
import { FieldError, useForm } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import * as yup from "yup";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { yupResolver } from "@hookform/resolvers/yup";
import { createAccountingAdjustment } from "@/services/accountingAdjustment/accountingAdjustment";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { formatDateBars } from "@/utils/utils";
import { InputDateRange } from "@/components/atoms/inputs/InputDateRange/InputDateRange";
import { MessageInstance } from "antd/es/message/interface";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

interface IformDiscount {
  motive: string;
  percentage: number;
  amount: number;
  validity_range?: (Date | undefined)[];
  expedition_date: Date;
}

interface Props {
  onClose: () => void;
  messageApi: MessageInstance;
  projectIdParam?: string;
  clientIdParam?: string;
}

type CreateAdjustmentT = ReturnType<typeof useTranslations<"modals.createAdjustment">>;

const buildSchema = (t: CreateAdjustmentT) =>
  yup.object().shape({
    motive: yup.string().required(t("required")),
    percentage: yup.number().max(100, t("percentageMax")).required(t("required")),
    amount: yup.number().min(0, t("negative")).required(t("required")),
    validity_range: yup.array().of(yup.date()).optional(),
    expedition_date: yup.date().required(t("required"))
  });

export const CreateDiscount = ({ onClose, messageApi, projectIdParam, clientIdParam }: Props) => {
  const t = useTranslations("modals.createAdjustment");
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IformDiscount>({
    resolver: yupResolver(schema)
  });
  const { data: motives, isLoading, isError } = useFinancialDiscountMotives();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = async (data: IformDiscount) => {
    setIsSubmitting(true);
    try {
      await createAccountingAdjustment({
        type: 3,
        motive: motives?.find((motive) => motive.name === data.motive)?.id || 1,
        ammount: data.amount,
        percentage: data.percentage,
        date_of_issue: formatDateBars(data.expedition_date.toISOString()),
        validity_range: data.validity_range
          ? {
              start:
                data.validity_range && data.validity_range[0]
                  ? formatDateBars(data.validity_range[0].toISOString())
                  : "",
              end:
                data.validity_range && data.validity_range[1]
                  ? formatDateBars(data.validity_range[1].toISOString())
                  : ""
            }
          : undefined,
        users_aproved: [142, 146], // TODO: users_aproved esta mal escrito ya que el back lo pide asi
        project_id: projectIdParam || "19",
        client_id: clientIdParam || "98765232" // TODO: agregar cliente
      });
      messageApi.open({
        type: "success",
        content: t("discount.success")
      });
      onClose();
    } catch (error) {
      messageApi.open({
        type: "error",
        content: t("discount.error")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createDiscountCustom">
      <p className="subTitleModalAction">{t("discount.subtitle")}</p>
      <form className="modalContent" onSubmit={handleSubmit(handleSubmitForm)}>
        <div className="containterForm">
          <InputSelect
            titleInput={t("reason")}
            nameInput="motive"
            control={control}
            error={errors.motive}
            options={motives?.map((motive) => ({ value: motive.name, label: motive.name })) || []}
            loading={isLoading}
            isError={isError}
            placeholder={t("reasonPlaceholder")}
          />
          <div />
          <InputFormMoney
            titleInput={t("totalAmount")}
            nameInput="amount"
            control={control}
            error={errors.amount}
            placeholder={t("amountPlaceholder")}
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <InputForm
            titleInput={t("percentage")}
            nameInput="percentage"
            control={control}
            error={errors.percentage}
            placeholder={t("amountPlaceholder")}
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <InputDateForm
            titleInput={t("issueDate")}
            nameInput="expedition_date"
            placeholder={t("issueDatePlaceholder")}
            control={control}
            error={errors.expedition_date}
          />
          <InputDateRange
            titleInput={t("validityRange")}
            nameInput="validity_range"
            control={control}
            error={errors.validity_range as FieldError}
            optional
          />
        </div>
        <FooterButtons
          handleOk={handleSubmit(handleSubmitForm)}
          onClose={onClose}
          isConfirmDisabled={!isValid || isSubmitting}
          titleConfirm={t("discount.submit")}
          className="createDiscountCustom__footer"
        />
      </form>
    </div>
  );
};
