import { useTranslations } from "use-intl";
import { Select, Typography } from "antd";
import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { IRoles } from "@/types/roles/IRoles";

import "./selectroles.scss";
import { FieldErrorsImpl, Merge, FieldError as OriginalFieldError } from "react-hook-form";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: number; label: string }>>;

interface Props {
  errors: ExtendedFieldError | undefined;
  field: any;
}

export const SelectRoles = ({ errors, field }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, isLoading } = useSWR<IRoles>("/role", fetcher, {});
  // doesn't show super admin role
  const filteredOptions = data?.data.filter((rol) => rol.ID !== 1);
  const options = filteredOptions?.map((option) => {
    return {
      value: option.ID,
      label: option.ROL_NAME
    };
  });

  return (
    <>
      <Select
        placeholder={t("selectRoles")}
        className={errors ? "selectInputRolesError" : "selectInputRoles"}
        loading={isLoading}
        variant="borderless"
        optionLabelProp="label"
        {...field}
        options={options}
        labelInValue
      />
      {errors && <Typography.Text className="textError">{t("roleRequired")}</Typography.Text>}
    </>
  );
};
