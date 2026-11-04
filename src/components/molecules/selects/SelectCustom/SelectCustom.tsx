import { Flex, Select, Typography } from "antd";
import { useTranslations } from "use-intl";

import "./selectcustom.scss";

interface Props {
  titleSelect?: string;
  placeHolder?: string;
  errors: any;
  field?: any;
  options: any[];
}
const { Option } = Select;
// This component is only for layout purpose
export const SelectCustom = ({
  titleSelect = "",
  placeHolder = "",
  errors,
  options = []
}: Props) => {
  const t = useTranslations("shared.selects");
  // doesn't show super admin role
  return (
    <Flex vertical style={{ width: "48%" }}>
      {titleSelect.length > 0 && <Typography.Title level={5}>{titleSelect}</Typography.Title>}
      <Select
        placeholder={titleSelect.length > 0 ? titleSelect : placeHolder}
        className={errors ? "selectInputCustomError" : "selectInputCustom"}
        variant="borderless"
        optionLabelProp="label"
      >
        {options?.map((value) => {
          return (
            <Option value={`${value.id}-${value.name}`} key={value.id}>
              {`${value.id}-${value.name}`}
            </Option>
          );
        })}
        {errors && <Typography.Text className="textError">{t("roleRequired")}</Typography.Text>}
      </Select>
    </Flex>
  );
};
