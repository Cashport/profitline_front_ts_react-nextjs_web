import React, { useState } from "react";
import { Select, SelectProps, Tag, Tooltip, Typography } from "antd";
import { Flex } from "antd";
import styles from "./MultiSelect.module.scss"; // Archivo de estilos opcional
import { EmailOption } from "@/types/sendEmail";

const { Text } = Typography;

interface MultiSelectProps {
  value: EmailOption[]; // Ahora almacenamos el objeto completo
  onChange: (values: EmailOption[]) => void; // También enviamos objetos completos
  options: EmailOption[];
  label?: string;
  selectProps?: SelectProps;
}

type TagRender = SelectProps["tagRender"];

const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  onChange,
  options,
  label = "Seleccionar",
  selectProps = {}
}) => {
  const [customOptions, setCustomOptions] = useState<EmailOption[]>(options);

  const tagRender: TagRender = (props) => {
    const { label, value, closable } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tooltip title={value} arrow={false} className={styles.tooltip}>
        <Tag
          onMouseDown={onPreventMouseDown}
          closable={closable}
          onClose={() => handleRemove(value)}
          style={{
            marginInlineEnd: 4,
            border: "1px solid #D9D9D9",
            backgroundColor: "transparent"
          }}
        >
          {label}
        </Tag>
      </Tooltip>
    );
  };
  const handleRemove = (email: string) => {
    const newValue = value.filter((v) => v.email !== email);
    setCustomOptions(options);
    onChange(newValue);
  };
  const handleChange = (selectedEmails: string[]) => {
    const updatedSelections: EmailOption[] = selectedEmails.map((email) => {
      const existingOption = customOptions.find((opt) => opt.email === email);
      if (existingOption) {
        return existingOption;
      } else {
        // Agregar la nueva opción si no existe
        const newOption: EmailOption = {
          id: Date.now(), // Generar un ID único
          email,
          name: email, // Se usa el email como nombre predeterminado
          companyPosition: "No especificado"
        };
        setCustomOptions((prev) => [...prev, newOption]); // Agregar nueva opción a la lista
        return newOption;
      }
    });
    onChange(updatedSelections);
  };

  return (
    <Flex gap={16} className={styles.multiSelect}>
      <span className={styles.label}>{label}</span>
      <Select
        mode="tags"
        variant="borderless"
        value={value.map((v) => v.email)} // Se mapea para que funcione con Select
        onChange={handleChange}
        options={[
          ...customOptions.map((opt) => ({
            value: opt.email,
            label: opt.name
          }))
        ]}
        className={styles.select}
        tagRender={tagRender}
        {...selectProps}
        suffixIcon={null}
        style={{ borderBottom: "1px solid #D9D9D9" }}
        optionRender={(option) => {
          const selectedOption = options.find((o) => o.email === option.data.value);
          return (
            <Flex vertical key={option.data.value}>
              <Text style={{ fontSize: 14 }}>
                {selectedOption ? selectedOption.name : option.data.value}
              </Text>
              <Text style={{ fontSize: 13, color: "#14141452" }}>
                {selectedOption ? selectedOption.companyPosition : "Correo personalizado"}
              </Text>
            </Flex>
          );
        }}
      />
    </Flex>
  );
};

export default MultiSelect;
