import React from "react";
import { useFieldArray, Controller, Control } from "react-hook-form";
import { Checkbox, Button, Flex, Radio } from "antd";
import { Plus, Trash } from "phosphor-react";
import { useTranslations } from "use-intl";
import { InputForm } from "../Input";
import { QuestionType } from "../../controllers/formSchema";

interface Item {
  isChecked: boolean;
  name: string;
}

interface ReusableListProps {
  control: Control<any>;
  name: string;
  initialItems?: Item[];
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  type: QuestionType;
}

const ReusableList: React.FC<ReusableListProps> = ({ control, name, onAdd, onRemove, type }) => {
  const t = useTranslations("projects.forms.question");
  const { fields, append, remove } = useFieldArray({
    control,
    name
  });
  console.log("name REUSABLE LIST", name);
  console.log("fields en REUSABLE LIST", fields);
  return (
    <Flex vertical gap={"1rem"} align="flex-start">
      {fields.map((field, index) => (
        <Flex key={field.id} gap={8} align={"center"} style={{ width: "100%" }}>
          <Controller
            name={`${name}.${index}.isChecked`}
            control={control}
            render={({ field }) => {
              if (type === QuestionType.MULTIPLE_CHOICE) {
                return (
                  <Checkbox
                    {...field}
                    checked={false}
                    onChange={() => {}}
                    style={{ marginRight: "10px" }}
                    disabled={true}
                  />
                );
              } else
                return (
                  <Radio
                    {...field}
                    checked={false}
                    onChange={() => {}}
                    style={{ marginRight: "10px" }}
                    disabled={true}
                  />
                );
            }}
          />
          <Flex
            style={{
              backgroundColor: "#F7F7F7",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between"
            }}
          >
            <InputForm
              hiddenTitle
              {...field}
              placeholder={t("option", { number: index + 1 })}
              control={control}
              nameInput={`${name}.${index}.label`}
              customStyle={{ width: "100%" }}
            />
            <Button
              type="text"
              icon={<Trash size={20} />}
              aria-label={t("deleteOption")}
              onClick={() => {
                remove(index);
                onRemove && onRemove(index);
              }}
              style={{ zIndex: 1, marginRight: "0.5rem" }}
            />
          </Flex>
        </Flex>
      ))}
      <Button
        type="dashed"
        style={{ border: "none", boxShadow: "none", fontWeight: 500, paddingLeft: 0 }}
        onClick={() => {
          append({ isChecked: false, name: "" });
          onAdd && onAdd();
        }}
        icon={<Plus size={16} />}
      >
        {t("addOption")}
      </Button>
    </Flex>
  );
};

export default ReusableList;
