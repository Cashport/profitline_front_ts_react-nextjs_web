import { FC } from "react";
import { CaretRight } from "phosphor-react";
import { Collapse, ConfigProvider } from "antd";
import { useTranslations } from "use-intl";
import styles from "./generate-action.module.scss";
import { useInvoiceActionsModal } from "../../../hooks/invoice-actions/invoice-actions-modal.hook";

interface GenerateActionProps {}

const GenerateAction: FC<GenerateActionProps> = () => {
  const t = useTranslations("clients.invoiceActions");
  const { options, goToOptionId } = useInvoiceActionsModal();

  const collapseItems = options.map((option) => {
    return {
      key: option.id,
      label: (
        <span className={styles.collapsibleItem}>
          <option.icon className={styles.icon} /> {option.label}
        </span>
      ),
      style: {
        borderRadius: 8,
        marginBottom: 12,
        background: "#F7F7F7",
        border: "1px solid #DDDDDD"
      },
      children: (
        <div className={styles.subOptions}>
          {option.subOptions.map((subOption) => (
            <div
              key={subOption.id}
              className={styles.subOption}
              onClick={() => goToOptionId(subOption.id)}
            >
              {subOption.label} <CaretRight className={styles.arrow} />
            </div>
          ))}
        </div>
      )
    };
  });

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: "0",
            contentPadding: "0 16px"
          }
        }
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.mainTitle}>{t("title")}</div>
        <div className={styles.title}>{t("subtitle")}</div>
        <div className={styles.list}>
          <Collapse
            items={collapseItems}
            collapsible="header"
            expandIconPosition="end"
            accordion
            className={styles.collapse}
            bordered={false}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default GenerateAction;
