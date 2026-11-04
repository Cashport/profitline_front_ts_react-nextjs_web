"use client";
import styles from "./HeaderDiscountType.module.scss";
import { Button, Flex, Typography } from "antd";
import { useTranslations } from "use-intl";
import discountCategories from "../../../../constants/discountTypes";

const { Title } = Typography;

type Props = {
  selectedType: number;
  // eslint-disable-next-line no-unused-vars
  handleClick: (type: number) => void;
  discountId?: number;
};

export default function HeaderDiscountType({ selectedType, handleClick, discountId }: Props) {
  const t = useTranslations("discounts");
  const canEdit = discountId === undefined;
  const handleEdit = canEdit ? handleClick : () => {};

  return (
    <Flex className={styles.HeaderContainer} justify="space-between" vertical gap={20}>
      <Flex gap={20} justify="space-between" wrap="wrap">
        <Title style={{ width: "fit-content" }} level={4}>
          {t("form.selectType")}
        </Title>
      </Flex>
      <Flex className={styles.buttonContainer} justify="center" wrap="wrap" gap={"32px"}>
        {Object.keys(discountCategories).map((key) => (
          <Button
            key={`button-for-${key}`}
            className={`${styles.buttonIcon} ${selectedType === discountCategories[key].id ? styles.active : ""}`}
            icon={discountCategories[key].Icon()}
            onClick={() => handleEdit(discountCategories[key].id)}
            disabled={!canEdit && discountCategories[key].id !== selectedType}
          >
            {t(`categories.${discountCategories[key].nameKey}`)}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}
