import style from "./AnnualFeatures.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { Button, Flex, Select, Typography } from "antd";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn
} from "react-hook-form";
import { Plus, Trash } from "phosphor-react";
import { DiscountSchema } from "../../../resolvers/generalResolver";
import useAnnualFeatures from "./hooks/useAnnualFeatures";
import { useTranslations } from "use-intl";

const { Text } = Typography;

type AnnualFeaturesProps = {
  form: UseFormReturn<DiscountSchema, any, undefined>;
  fields: FieldArrayWithId<DiscountSchema, "annual_ranges", "id">[];
  append: UseFieldArrayAppend<DiscountSchema, "annual_ranges">;
  remove: UseFieldArrayRemove;
  statusForm: "create" | "edit" | "review";
};

export default function AnnualFeatures({
  form,
  fields,
  append,
  remove,
  statusForm
}: Readonly<AnnualFeaturesProps>) {
  const t = useTranslations("discounts.annual");
  const {
    control,
    register,
    watch,
    formState: { errors },
    setValue
  } = form;

  const { options, isLoadingOption, clientWithoutProducts } = useAnnualFeatures({ form });

  const getFilteredProducts = (idLine: number | undefined) => {
    const optionSelectedIndex = options.findIndex((line) => line.value === idLine);
    return options[optionSelectedIndex]?.productsAvailable || [];
  };

  const watchIdLines = watch("annual_ranges");

  if (clientWithoutProducts) {
    return <div>{t("noProducts")}</div>;
  }
  return (
    <Flex className={style.container} vertical gap={12}>
      {fields.map((field, index) => {
        const idLine = watchIdLines?.[index]?.idLine;
        const filteredProducts = getFilteredProducts(idLine);

        return (
          <Flex key={`row-${index}`} vertical gap={12}>
            <Flex gap={12} align="center">
              <Flex vertical gap={4}>
                <span className={style.columnHeader}>{t("line")}</span>
                <Controller
                  control={control}
                  {...register(`annual_ranges.${index}.idLine`)}
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        variant="borderless"
                        className={`${style.selectInput}`}
                        loading={isLoadingOption}
                        options={options}
                        placeholder={t("selectLine")}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue(`annual_ranges.${index}.idProduct`, undefined);
                        }}
                      />
                    );
                  }}
                />
                <Text type="danger" hidden={!errors?.annual_ranges?.[index]?.idLine}>
                  {errors?.annual_ranges?.[index]?.idLine?.message}
                </Text>
              </Flex>
              <Flex vertical gap={4}>
                <span className={style.columnHeader}>{t("product")}</span>
                <Controller
                  control={control}
                  {...register(`annual_ranges.${index}.idProduct`)}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={t("selectProduct")}
                      variant="borderless"
                      className={`${style.selectInput}`}
                      value={field.value}
                      disabled={filteredProducts?.length === 0 || statusForm === "review"}
                    >
                      {filteredProducts?.map((product) => (
                        <Select.Option key={product.id} value={product.id}>
                          {product.description}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
                <Text type="danger" hidden={!errors?.annual_ranges?.[index]?.units}>
                  {errors?.annual_ranges?.[index]?.idProduct?.message}
                </Text>
              </Flex>
              <Flex vertical gap={4}>
                <span className={style.columnHeader}>{t("units")}</span>
                <InputForm
                  hiddenTitle={true}
                  control={control}
                  error={undefined}
                  nameInput={`annual_ranges.${index}.units`}
                  className={style.input}
                />
                <Text type="danger" hidden={!errors?.annual_ranges?.[index]?.units}>
                  {errors?.annual_ranges?.[index]?.units?.message}
                </Text>
              </Flex>
              <Flex vertical gap={4}>
                <span className={style.columnHeader}>{t("discount")}</span>
                <InputForm
                  hiddenTitle={true}
                  control={control}
                  error={undefined}
                  nameInput={`annual_ranges.${index}.discount`}
                  className={style.input}
                />
                <Text type="danger" hidden={!errors?.annual_ranges?.[index]?.units}>
                  {errors?.annual_ranges?.[index]?.discount?.message}
                </Text>
              </Flex>
              {statusForm !== "review" && (
                <Button type="text" onClick={() => remove(index)} aria-label={t("removeRow")}>
                  <Trash size={20} />
                </Button>
              )}
            </Flex>
            <hr />
          </Flex>
        );
      })}
      {statusForm !== "review" && (
        <Flex justify="end">
          <PrincipalButton
            onClick={() =>
              append({ id: 0, idLine: undefined, idProduct: undefined, units: 0, discount: 0 })
            }
            className={style.button}
            icon={<Plus />}
            iconPosition="end"
          >
            {t("addDiscount")}
          </PrincipalButton>
        </Flex>
      )}
    </Flex>
  );
}
