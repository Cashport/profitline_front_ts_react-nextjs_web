import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, message } from "antd";
import { useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";
import { useStructureBR } from "@/hooks/useBusinessRules";

import "./inputcreatechannel.scss";

export type ChannelType = {
  channel: string;
};
interface Props {
  isEditAvailable: boolean;
}
export const InputCreateChannel = ({ isEditAvailable = false }: Props) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const { addChannel } = useStructureBR();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChannelType>({
    defaultValues: { channel: "" },
    disabled: !isEditAvailable
  });
  const onSubmit = async (data: ChannelType) => {
    setIsLoading(true);
    await addChannel(data.channel, messageApi);
    reset();
    setIsLoading(false);
  };
  return (
    <>
      <form className="inputcreatezone" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="channel"
          error={errors.channel}
          customStyle={{
            width: "96%",
            backgroundColor: "transparent !important",
            borderRadius: ".8rem"
          }}
          placeholder={t("channelPlaceholder")}
        />
        <Button htmlType="submit" loading={isLoading} className="createButtonZone">
          {tCommon("actions.create")}{" "}
        </Button>
      </form>
    </>
  );
};
