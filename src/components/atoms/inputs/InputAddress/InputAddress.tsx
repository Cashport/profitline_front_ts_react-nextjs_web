import { Flex, Typography } from "antd";
import { useTranslations } from "use-intl";
import { InputForm } from "../InputForm/InputForm";
import { Control, FieldErrors } from "react-hook-form";
import { AddressType } from "@/components/molecules/modals/ModalShipTo/ModalAddress/ModalAddress";

interface Props {
  control: Control<AddressType, any>;
  errors: FieldErrors<AddressType>;
  disabled: boolean;
}

export const InputAddress = ({ control, errors, disabled }: Props) => {
  const t = useTranslations("components.inputAddress");
  return (
    <Flex vertical>
      <Flex align="flex-end">
        <InputForm
          titleInput={t("address")}
          control={control}
          nameInput="location.address.street_type"
          error={errors.location?.address?.street_type}
          customStyle={{ width: "75%", paddingRight: "1rem" }}
          placeholder={t("streetTypePlaceholder")}
          disabled={disabled}
        />
        <Flex align="center" gap={"0.5rem"}>
          <InputForm
            titleInput=""
            control={control}
            nameInput="location.address.number"
            error={errors.location?.address?.number}
            customStyle={{ width: "30%" }}
            placeholder="148A"
            hiddenTitle
            disabled={disabled}
          />
          <Typography.Text>#</Typography.Text>
          <InputForm
            titleInput=""
            control={control}
            nameInput="location.address.complement"
            error={errors.location?.address?.complement}
            placeholder="45Bis"
            customStyle={{ width: "30%" }}
            hiddenTitle
            disabled={disabled}
          />
          <Typography.Text>-</Typography.Text>
          <InputForm
            titleInput=""
            placeholder="39"
            control={control}
            nameInput="location.address.building_number"
            error={errors.location?.address?.building_number}
            customStyle={{ width: "30%" }}
            hiddenTitle
            typeInput="number"
            disabled={disabled}
          />
        </Flex>
      </Flex>
      <InputForm
        titleInput={t("complement")}
        placeholder={t("complementPlaceholder")}
        control={control}
        nameInput="location.complement"
        error={errors.location?.complement}
        customStyle={{ marginTop: "1rem" }}
        disabled={disabled}
      />
    </Flex>
  );
};
