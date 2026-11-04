import React, { useMemo, useState } from "react";
import { useTranslations } from "use-intl";
import "./createDebitNote.scss";
import { FieldError, useForm } from "react-hook-form";
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
  amount: number;
  validity_range?: (Date | undefined)[] | undefined;
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
    amount: yup.number().min(0, t("negative")).required(t("required")),
    validity_range: yup.array().of(yup.date()).optional(),
    expedition_date: yup.date().required(t("required"))
  });

export const CreateDebitNote = ({ onClose, messageApi, projectIdParam, clientIdParam }: Props) => {
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
        type: 1,
        motive: motives?.find((motive) => motive.name === data.motive)?.id || 1,
        ammount: data.amount,
        percentage: 0,
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
        client_id: clientIdParam || "98765232"
      });

      messageApi.open({
        type: "success",
        content: t("debit.success")
      });
      onClose();
    } catch (error) {
      messageApi.open({
        type: "error",
        content: t("debit.error")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createDebitCustom">
      <p className="subTitleModalAction">{t("debit.subtitle")}</p>
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
          <InputFormMoney
            titleInput={t("adjustmentAmount")}
            nameInput="amount"
            control={control}
            error={errors.amount}
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
          titleConfirm={t("debit.submit")}
          className="createDebitCustom__footer"
        />
      </form>
    </div>
  );
};
