import React from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { Checkbox, Flex, Radio, Typography } from "antd";
import { Option, QuestionType } from "../../schema";

const { Text } = Typography;

interface OptionListProps {
  control: Control<any>;
  name: string;
  type: QuestionType;
  options: Option[];
  setValue: (name: string, value: any) => void;
  error?: FieldError | undefined;
  required?: boolean;
}

const OptionList: React.FC<OptionListProps> = ({
  control,
  name,
  type,
  options,
  setValue: _setValue,
  error,
  required = false
}) => {
  console.log("error", error);
  return (
    <Flex vertical gap={"1rem"} align="flex-start">
      <Controller
        name={name}
        control={control}
        defaultValue={type === QuestionType.MULTIPLE_CHOICE ? [] : null}
        rules={{ required }}
        render={({ field }) => (
          <>
            {options.map((option, index) => (
              <Flex
                key={`${index}-${option.value}`}
                gap={8}
                align={"center"}
                style={{ width: "100%" }}
              >
                {type === QuestionType.MULTIPLE_CHOICE ? (
                  <Checkbox
                    checked={field.value.includes(option.value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newValue = checked
                        ? [...field.value, option.value] // Añade el valor si se marca
                        : field.value.filter((val: number) => val !== option.value); // Quita el valor si se desmarca
                      field.onChange(newValue);
                    }}
                    style={{ marginRight: "10px" }}
                  />
                ) : (
                  <Radio
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    style={{ marginRight: "10px" }}
                  />
                )}
                <Flex
                  style={{
                    backgroundColor: "#F7F7F7",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                    height: "40px",
                    padding: "10px 12px"
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 300 }}>{option.label}</Text>
                </Flex>
              </Flex>
            ))}
          </>
        )}
      />
      <Text type="danger">{error ? "Debes elegir por lo menos una opción" : ""}</Text>
    </Flex>
  );
};

export default OptionList;
