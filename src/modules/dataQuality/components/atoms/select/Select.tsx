import { Select as AntSelect } from "antd";
import type { ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  showSearch?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  loading?: boolean;
  notFoundContent?: ReactNode;
}

export default function Select({
  value,
  onChange,
  placeholder = "Seleccionar",
  options,
  showSearch = false,
  hasError = false,
  disabled = false,
  loading = false,
  notFoundContent
}: Props) {
  return (
    <AntSelect
      showSearch={showSearch}
      value={value || undefined}
      onChange={onChange}
      placeholder={<span style={{ color: "#666666" }}>{placeholder}</span>}
      optionFilterProp="label"
      filterOption={
        showSearch
          ? (input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          : undefined
      }
      options={options}
      style={{
        width: "100%",
        height: 36,
        borderColor: hasError ? "#ff4d4f" : "#DDDDDD"
      }}
      status={hasError ? "error" : undefined}
      dropdownStyle={{ zIndex: 10000 }}
      disabled={disabled}
      loading={loading}
      notFoundContent={notFoundContent}
    />
  );
}
