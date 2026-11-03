import { useTranslations } from "use-intl";
import { Flex, Select, Typography } from "antd";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";

import "../commonInputStyles.scss";
import { useLocations } from "@/hooks/useLocations";
import axios from "axios";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props<T extends FieldValues> {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<T, any>;
  disabled?: boolean;
}

export const SelectLocations = <T extends FieldValues>({ errors, field, disabled }: Props<T>) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useLocations();
  if (axios.isAxiosError(data)) {
    return null;
  }

  const options = data?.map((location) => ({
    value: location.id,
    label: location.city,
    className: "selectOptions"
  }));

  const filterOption = (input: string, option?: { label: string; value: number }) => {
    return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
  };

  return (
    <Flex vertical>
      <h4 className="inputTitle">{t("city")}</h4>
      <Select
        showSearch
        placeholder={t("selectCity")}
        className={errors ? "selectInputError" : "selectInputCustom"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        popupClassName="selectDrop"
        options={options}
        labelInValue
        filterOption={filterOption}
        disabled={disabled}
      />
      {errors && <Typography.Text className="textError">{t("cityRequired")}</Typography.Text>}
    </Flex>
  );
};
