import { Flex } from "antd";
import { Files, Money } from "phosphor-react";
import { useAppStore } from "@/lib/store/store";
import { capitalize } from "@/utils/utils";
import styles from "./label-collapse.module.scss";

interface PropsLabelCollapseInvoice extends React.HTMLAttributes<HTMLDivElement> {
  status: string;
  total?: number;
  quantity?: number;
  color?: string;
  removeIcons?: boolean;
}

const randomColors = [
  "#969696",
  "#F4076A",
  "#0085FF",
  "#3D3D3D",
  "#00C2FF",
  "#FF6B00",
  "#C80000",
  "#A9BA43"
];

const LabelCollapse = ({
  status,
  total,
  quantity,
  color,
  removeIcons,
  ...rest
}: PropsLabelCollapseInvoice) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

  return (
    <Flex className={styles.labelCollapse} {...rest}>
      <h5
        className={styles.labelCollapse__status}
        style={{ background: color ? color : randomColor }}
      >
        {capitalize(status)}
      </h5>
      {!!total && (
        <Flex className={styles.labelCollapse__total} style={{ marginRight: !quantity ? '1rem' : undefined }}>
          {removeIcons ? null : <Money size={16} className={styles.labelCollapse__total__icon} />}
          <h5 className={styles.labelCollapse__total__title}>{formatMoney(total)}</h5>
        </Flex>
      )}
      {!!quantity && (
        <Flex className={styles.labelCollapse__quantity}>
          {removeIcons ? null : (
            <Files size={16} className={styles.labelCollapse__quantity__icon} />
          )}
          <h5 className={styles.labelCollapse__quantity__title}>{quantity}</h5>
        </Flex>
      )}
    </Flex>
  );
};

export default LabelCollapse;
