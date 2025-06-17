import React, { useState } from "react";
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

const schema = yup.object().shape({
  motive: yup.string().required("Campo obligatorio"),
  amount: yup.number().min(0, "El valor no puede ser negativo").required("Campo obligatorio"),
  validity_range: yup.array().of(yup.date()).optional(),
  expedition_date: yup.date().required("Campo obligatorio")
});

export const CreateDebitNote = ({ onClose, messageApi, projectIdParam, clientIdParam }: Props) => {
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
        content: "Nota débito creado con éxito"
      });
      onClose();
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error creando nota débito. Por favor, intente nuevamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createDebitCustom">
      <p className="subTitleModalAction">Ingresa la información para crear la nueva nota débito</p>
      <form className="modalContent" onSubmit={handleSubmit(handleSubmitForm)}>
        <div className="containterForm">
          <InputSelect
            titleInput="Motivo"
            nameInput="motive"
            control={control}
            error={errors.motive}
            options={motives?.map((motive) => ({ value: motive.name, label: motive.name })) || []}
            loading={isLoading}
            isError={isError}
            placeholder="Seleccionar motivo"
          />
          <InputFormMoney
            titleInput="Valor del ajuste"
            nameInput="amount"
            control={control}
            error={errors.amount}
            placeholder="Ingresar valor"
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <InputDateForm
            titleInput="Fecha de expedición"
            nameInput="expedition_date"
            placeholder="Seleccionar fecha de expiración"
            control={control}
            error={errors.expedition_date}
          />
          <InputDateRange
            titleInput="Rango de vigencia"
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
          titleConfirm="Crear Nota Débito"
          className="createDebitCustom__footer"
        />
      </form>
    </div>
  );
};
