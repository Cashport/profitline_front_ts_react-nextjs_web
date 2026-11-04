import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, message } from "antd";
import { useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";
import { useZone } from "@/hooks/useZone";

import "./inputcreatezone.scss";

export type ZoneType = {
  zone: string;
};
interface Props {
  isEditAvailable: boolean;
}
export const InputCreateZone = ({ isEditAvailable = false }: Props) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { createZone } = useZone();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ZoneType>({
    defaultValues: { zone: "" },
    disabled: !isEditAvailable
  });
  const onSubmit = async (data: ZoneType) => {
    setIsLoading(true);
    await createZone(data.zone, messageApi);
    setIsLoading(false);
  };
  return (
    <>
      <form className="inputcreatezone" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="zone"
          error={errors.zone}
          customStyle={{
            width: "96%",
            backgroundColor: "transparent !important",
            border: "1px solid white",
            borderRadius: ".8rem"
          }}
          placeholder={t("zonePlaceholder")}
        />
        <Button htmlType="submit" loading={isLoading} className="createButtonZone">
          {tCommon("actions.create")}{" "}
        </Button>
      </form>
    </>
  );
};
