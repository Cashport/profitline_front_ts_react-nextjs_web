import { Col, Flex, Radio, Row, Typography } from "antd";
import styles from "./FeatByOrder.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Plus } from "phosphor-react";
import RangesRow from "../../rangesRow/RangesRow";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import ProductList from "../../productList/ProductList";
import { DiscountSchema } from "../../../../resolvers/generalResolver";
import { typesWithMinByOrder } from "@/components/organisms/discounts/constants/discountTypes";
import useDiscountFeats from "../hooks/useDiscountFeats";
import { useMemo } from "react";
import { useTranslations } from "use-intl";

const { Title, Text } = Typography;

type FeatByOrderProps = {
  discountType: number;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  statusForm: "create" | "edit" | "review";
};

export default function FeatByOrder({ discountType, form, statusForm }: FeatByOrderProps) {
  const t = useTranslations("discounts.byOrder");
  const {
    formState: { errors },
    control,
    setValue,
    watch,
    register
  } = form;
  const { lines, onChange, isLoading } = useDiscountFeats({ setValue });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ranges"
  });

  const handleGetLabels = (discountType: number) => {
    if (discountType === 1) {
      return {
        unitsFrom: t("labels.minQuantity"),
        unitsTo: t("labels.maxQuantity")
      };
    } else if (discountType === 2) {
      return {
        unitsFrom: t("labels.minAmount"),
        unitsTo: t("labels.maxAmount")
      };
    } else if (discountType === 3) {
      return {
        unitsFrom: t("labels.minBrands"),
        unitsTo: t("labels.minUnitsPerBrand")
      };
    } else {
      return {
        unitsFrom: t("labels.minSkus"),
        unitsTo: t("labels.minUnitsPerSku")
      };
    }
  };

  const principalStyle = useMemo(() => {
    if (typesWithMinByOrder.includes(discountType)) return styles.principalContainer;
    else return "";
  }, [discountType]);

  return (
    <Flex className={principalStyle} vertical gap={20}>
      {typesWithMinByOrder.includes(discountType) && (
        <>
          <Title style={{ marginBottom: 0 }} level={5}>
            {t("minOrderQuantity")}
          </Title>
          <InputForm
            control={control}
            nameInput="min_order"
            error={errors.min_order}
            placeholder="0"
            className={styles.input}
          />
        </>
      )}
      <ProductList
        lines={lines}
        loading={isLoading}
        form={form}
        statusForm={statusForm}
      ></ProductList>
      <Radio.Group
        onChange={onChange}
        value={watch("computation_type")}
        className={styles.radioGroup}
        disabled={statusForm === "review"}
      >
        <Radio value={1}>{t("percentage")}</Radio>
        <Radio value={2}>{t("fixedAmount")}</Radio>
      </Radio.Group>
      <Text type="danger" hidden={!errors?.computation_type}>
        {errors?.computation_type?.message}
      </Text>
      <Flex className={styles.rangesContainer} vertical>
        <Flex className={styles.rangesSubContainer} gap={10} vertical>
          <Row>
            <Col span={8}>{handleGetLabels(watch("discount_type") || 0).unitsFrom}</Col>
            <Col span={8}>{handleGetLabels(watch("discount_type") || 0).unitsTo}</Col>
            <Col span={8}>{t("discountToApply")}</Col>
          </Row>
          <hr />
          {fields.map((_, index) => (
            <RangesRow
              errors={errors}
              control={control}
              register={register}
              key={"range - " + index}
              id={index}
              remove={
                index == fields.length - 1 && statusForm !== "review"
                  ? () => remove(index)
                  : undefined
              }
            />
          ))}
          <Text type="danger" hidden={!errors?.ranges}>
            {errors?.ranges?.message}
          </Text>
        </Flex>
        {statusForm !== "review" && (
          <Flex className={styles.rangesContainer} justify="flex-end">
            <PrincipalButton
              onClick={() => append({ id: 0, unitsMin: 0, unitsMax: 0, discount: 0 })}
              className={styles.button}
              icon={<Plus />}
              iconPosition="end"
            >
              {t("addRange")}
            </PrincipalButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
