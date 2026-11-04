import styles from "./ProductList.module.scss";
import { Typography, Flex, Checkbox, Skeleton } from "antd";
import { ProductLine } from "@/types/products/products";
import { UseFormReturn } from "react-hook-form";
import { DiscountSchema } from "../../../resolvers/generalResolver";
import { useTranslations } from "use-intl";

const { Title, Text } = Typography;

type ProductListProps = {
  lines: ProductLine[];
  loading: boolean;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  statusForm: "create" | "edit" | "review";
};
export default function ProductList({ lines, loading, form, statusForm }: ProductListProps) {
  const t = useTranslations("discounts.products");
  const {
    formState: { errors },
    watch,
    getValues,
    setValue
  } = form;

  const handleCkeck = (
    { idProduct, idLine }: { idProduct?: number; idLine?: number },
    checked: boolean
  ) => {
    const valid = { shouldValidate: true };
    const idProducts = idLine
      ? lines.find((line) => line.id === idLine)?.products.map((product) => product.id)
      : [];
    if (idProduct) {
      if (checked) {
        setValue(
          "products_category",
          [...(getValues("products_category")?.filter((x) => x !== idProduct) || [])],
          valid
        );
      } else {
        setValue(
          "products_category",
          [...(getValues("products_category") || []), idProduct],
          valid
        );
      }
    } else if (idLine) {
      if (checked) {
        setValue(
          "products_category",
          [...(getValues("products_category")?.filter((x) => !idProducts?.includes(x)) || [])],
          valid
        );
      } else {
        setValue(
          "products_category",
          [
            ...(getValues("products_category") || []),
            ...(idProducts?.filter((x) => !getValues("products_category")?.includes(x)) || [])
          ],
          valid
        );
      }
    }
  };

  return (
    <>
      <Title level={5}>{t("title")}</Title>
      {!loading ? (
        <Flex className={styles.products} gap={10} wrap>
          {lines.map((line) => (
            <Flex className={styles.line} vertical key={"line - " + line.id}>
              <Flex justify="space-between">
                {line.name}
                <Checkbox
                  checked={line.products.every((product) =>
                    watch("products_category")?.includes(product.id)
                  )}
                  disabled={statusForm === "review"}
                  onChange={() =>
                    handleCkeck(
                      { idLine: line.id },
                      line.products.every((product) =>
                        getValues("products_category")?.includes(product.id)
                      )
                    )
                  }
                />
              </Flex>
              <Flex justify="space-arround" gap={2} wrap>
                {line.products.map((product) => (
                  <label
                    className={styles.product}
                    htmlFor={"line - " + line.id + "product - " + product.id}
                    key={"product - " + product.id}
                  >
                    {product.description}
                    {"  "}
                    <Checkbox
                      id={"line - " + line.id + "product - " + product.id}
                      style={{ marginLeft: "10px" }}
                      checked={watch("products_category")?.includes(product.id)}
                      disabled={statusForm === "review"}
                      onChange={() =>
                        handleCkeck(
                          { idProduct: product.id },
                          Boolean(getValues("products_category")?.includes(product.id))
                        )
                      }
                    />
                  </label>
                ))}
              </Flex>
            </Flex>
          )) || <Text type="danger">{t("empty")}</Text>}
        </Flex>
      ) : (
        <Skeleton paragraph={{ rows: 3 }} />
      )}
      <Text type="danger" hidden={!errors.products_category?.message}>
        {errors.products_category?.message}
      </Text>
    </>
  );
}
