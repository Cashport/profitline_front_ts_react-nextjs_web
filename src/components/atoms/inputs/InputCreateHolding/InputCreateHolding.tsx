import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, message } from "antd";
import { useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";
import { useHolding } from "@/hooks/useHolding";

import "./inputcreateholding.scss";

export type HoldingType = {
  holding: string;
};
interface Props {
  isEditAvailable: boolean;
}
export const InputCreateHolding = ({ isEditAvailable = false }: Props) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { createHolding } = useHolding();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<HoldingType>({
    defaultValues: { holding: "" },
    disabled: !isEditAvailable
  });
  const onSubmit = async (data: HoldingType) => {
    setIsLoading(true);
    await createHolding(data.holding, messageApi);
    setIsLoading(false);
  };
  return (
    <>
      <form className="inputcreateholding" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="holding"
          error={errors.holding}
          customStyle={{
            width: "96%",
            backgroundColor: "transparent !important",
            border: "1px solid white",
            borderRadius: ".8rem"
          }}
          placeholder={t("holdingPlaceholder")}
        />
        <Button htmlType="submit" loading={isLoading} className="createButtonHolding">
          {tCommon("actions.create")}{" "}
        </Button>
      </form>
    </>
  );
};
