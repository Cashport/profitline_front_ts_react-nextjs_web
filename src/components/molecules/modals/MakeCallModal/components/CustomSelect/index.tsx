import React from "react";
import { Button, Select, SelectProps, Tag, Typography } from "antd";
import { Flex } from "antd";
import styles from "./CustomSelect.module.scss"; // Archivo de estilos opcional
import { UserPhoneOption } from "@/types/makeCall";
import { PhoneCall, X } from "phosphor-react";

const { Text } = Typography;

interface CustomSelectProps {
  value: UserPhoneOption | null; // Ahora solo una opción
  onChange: (value: UserPhoneOption | null) => void;
  options: UserPhoneOption[];
  label?: string;
  selectProps?: SelectProps;
  onClickIcon?: () => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label = "Seleccionar",
  selectProps = {},
  onClickIcon
}) => {
  const handleChange = (selectedPhone: string) => {
    const selectedOption = options.find((opt) => opt.phone === selectedPhone);
    if (selectedOption) {
      onChange(selectedOption);
    }
  };
  const handleRemove = () => {
    onChange(null);
  };
  return (
    <Flex gap={16} className={styles.customSelect}>
      <span className={styles.label}>{label}</span>
      <Select
        value={value ? value.phone : undefined}
        onChange={handleChange}
        options={options.map((opt) => ({
          value: opt.phone,
          label: (
            <Tag
              style={{
                marginInlineEnd: 4,
                border: "1px solid #D9D9D9",
                backgroundColor: "transparent"
              }}
              closeIcon={<X />}
               onClose={handleRemove}
            >
              {opt.name}
            </Tag>
          )
        }))}
        className={styles.select}
        variant="borderless"
        {...selectProps}
        suffixIcon={<PhoneCall onClick={onClickIcon} />}
        style={{ borderBottom: "1px solid #D9D9D9", height: 40 }}
        optionRender={(option) => {
          const selectedOption = options.find((o) => o.phone === option.data.value);
          return (
            <Flex vertical key={option.data.value}>
              <Text style={{ fontSize: 14 }}>
                {selectedOption ? selectedOption.name : option.data.value}
              </Text>
              <Text style={{ fontSize: 10, color: "#14141452" }}>
                {selectedOption ? selectedOption.companyPosition : "Correo personalizado"}
              </Text>
            </Flex>
          );
        }}
      />
      {/* Botón flotante sobre el Select */}
      <Button
        type="text"
        onClick={onClickIcon}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)"
        }}
      >
        <PhoneCall size={18} />
      </Button>
    </Flex>
  );
};

export default CustomSelect;
