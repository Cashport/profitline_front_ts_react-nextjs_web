import { Flex, Select, Typography } from "antd";
import "../commonInputStyles.scss";

interface Props {
  titleSelect?: string;
  placeHolder?: string;
  options: any[];
  orderRadioValue: string | undefined;
  setValueSelected: (event: string) => void;
  disabled: boolean;
}
const { Option } = Select;
export const SelectBillingPeriod = ({
  titleSelect = "",
  placeHolder = "",
  options = [],
  orderRadioValue,
  setValueSelected,
  disabled
}: Props) => {
  const onChangeSelect = (value: string) => setValueSelected(value);

  return (
    <Flex vertical style={{ width: "100%" }}>
      {titleSelect.length > 0 && <Typography.Title level={5}>{titleSelect}</Typography.Title>}
      <Select
        placeholder={titleSelect.length > 0 ? titleSelect : placeHolder}
        className="selectInputCustom"
        variant="borderless"
        optionLabelProp="label"
        onChange={onChangeSelect}
        value={orderRadioValue}
        disabled={disabled}
      >
        {options?.map((value) => {
          return (
            <Option value={value} key={value}>
              {value}
            </Option>
          );
        })}
      </Select>
    </Flex>
  );
};
