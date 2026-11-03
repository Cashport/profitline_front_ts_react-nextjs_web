import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, message } from "antd";
import { useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";

import "./inputCreateClientType.scss";
import { useClientTypes } from "@/hooks/useClientTypes";

export type ChannelType = {
  channel: string;
};
interface Props {
  isEditAvailable: boolean;
}
export const InputCreateClientType = ({ isEditAvailable = false }: Props) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const { addClient } = useClientTypes();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<{ clientType: string }>({
    defaultValues: { clientType: "" },
    disabled: !isEditAvailable
  });
  const onSubmit = async (data: { clientType: string }) => {
    setIsLoading(true);
    await addClient(data.clientType, messageApi);
    reset();
    setIsLoading(false);
  };
  return (
    <>
      <form className="inputCreateClientType" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="clientType"
          error={errors.clientType}
          customStyle={{
            width: "96%",
            backgroundColor: "transparent !important",
            border: "1px solid white",
            borderRadius: ".8rem"
          }}
          placeholder={t("clientTypePlaceholder")}
        />
        <Button htmlType="submit" loading={isLoading} className="createButton">
          {tCommon("actions.create")}{" "}
        </Button>
      </form>
    </>
  );
};
