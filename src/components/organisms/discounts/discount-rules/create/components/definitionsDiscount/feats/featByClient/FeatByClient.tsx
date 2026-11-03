import styles from "./FeatByClient.module.scss";
import { Flex, Radio, Typography } from "antd";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { UseFormReturn } from "react-hook-form";
import ProductList from "../../productList/ProductList";
import GroupClients from "../../groupClients/GroupClients";
import useDiscountFeats from "../hooks/useDiscountFeats";
import { DiscountSchema } from "../../../../resolvers/generalResolver";
import { useClientsGroups } from "@/hooks/useClientsGroups";
import { useTranslations } from "use-intl";

const { Title, Text } = Typography;

type FeatByOrderProps = {
  discountType: number;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  statusForm: "create" | "edit" | "review";
};

export default function FeatByCient({ form, statusForm }: FeatByOrderProps) {
  const t = useTranslations("discounts");
  const {
    setValue,
    watch,
    control,
    formState: { errors }
  } = form;
  const { lines, onChange, isLoading } = useDiscountFeats({ setValue });
  const { data, error, loading } = useClientsGroups({
    noLimit: true
  });

  return (
    <Flex className={styles.principalContainer} vertical gap={20}>
      <Title level={5}>{t("byClient.applicableDiscount")}</Title>
      <Radio.Group
        onChange={onChange}
        value={watch("computation_type")}
        className={styles.radioGroup}
        disabled={statusForm === "review"}
      >
        <Radio value={1}>{t("byOrder.percentage")}</Radio>
        <Radio value={2}>{t("byOrder.fixedAmount")}</Radio>
      </Radio.Group>
      <Text type="danger" hidden={!errors?.computation_type}>
        {errors?.computation_type?.message}
      </Text>
      <InputForm
        control={control}
        nameInput="discount"
        error={errors?.discount}
        placeholder="0%"
        className={styles.input}
      />
      <Title level={5}>{t("byClient.selectCustomerGroup")}</Title>
      <GroupClients
        clients={data?.data}
        error={error}
        loading={loading}
        form={form}
        statusForm={statusForm}
      ></GroupClients>
      <ProductList
        lines={lines}
        loading={isLoading}
        form={form}
        statusForm={statusForm}
      ></ProductList>
    </Flex>
  );
}
