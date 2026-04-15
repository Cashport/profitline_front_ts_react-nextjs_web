import { FC } from "react";
import UiTab from "@/components/ui/ui-tab";

import styles from "./banks-view.module.scss";
import ActivePaymentsTab from "../active-payments-tab";
import PaymentApplicationsTab from "../payment-applications-tab";

export const BanksView: FC = () => {
  const items = [
    {
      key: "1",
      label: "Pagos activos",
      children: <ActivePaymentsTab />
    },
    {
      key: "2",
      label: "Aplicaciones de pago",
      children: <PaymentApplicationsTab />
    }
  ];

  return (
    <>
      <div className={styles.banksView}>
        <UiTab tabs={items} sticky stickyOffset="-1rem" />
      </div>
    </>
  );
};

export default BanksView;
