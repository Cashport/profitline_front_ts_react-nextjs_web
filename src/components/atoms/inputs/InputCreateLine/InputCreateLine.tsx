import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, message } from "antd";
import { useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";
import { useStructureBR } from "@/hooks/useBusinessRules";

import "./inputcreateline.scss";

export type LineType = {
  line: string;
};
interface Props {
  isEditAvailable: boolean;
  idChannel: string;
}
export const InputCreateLine = ({ isEditAvailable = false, idChannel }: Props) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const { addLine } = useStructureBR();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LineType>({
    defaultValues: { line: "" },
    disabled: !isEditAvailable
  });
  const onSubmit = async (data: LineType) => {
    setIsLoading(true);
    await addLine(idChannel, data.line, messageApi);
    reset();
    setIsLoading(false);
  };
  return (
    <>
      <form className="inputcreateline" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="line"
          error={errors.line}
          customStyle={{
            width: "96%",
            backgroundColor: "transparent !important",
            border: "1px solid white",
            borderRadius: ".8rem"
          }}
          placeholder={t("linePlaceholder")}
        />
        <Button htmlType="submit" loading={isLoading} className="createButtonZone">
          {tCommon("actions.create")}{" "}
        </Button>
      </form>
    </>
  );
};
