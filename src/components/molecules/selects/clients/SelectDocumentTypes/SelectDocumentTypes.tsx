import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import useSWR from "swr";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";

import { fetcher } from "@/utils/api/api";

import { IDocumentsTypes } from "@/types/documentTypes/IDocumentsTypes";
import { ClientFormType } from "@/types/clients/IClients";

import "../commonInputStyles.scss";

// Extend the existing FieldError type
type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<ClientFormType, "infoClient.document_type">;
}

export const SelectDocumentTypes = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<IDocumentsTypes>("/document-type", fetcher, {});
  const options = data?.data.map((option) => {
    return {
      value: option.id,
      label: option.document_name,
      className: "selectOptions"
    };
  });

  return (
    <>
      <Select
        placeholder={t("selectDocumentType")}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
      />
      {errors && (
        <Typography.Text className="textError">{t("documentTypeRequired")}</Typography.Text>
      )}
    </>
  );
};
