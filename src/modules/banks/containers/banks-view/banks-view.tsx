"use client";
import { FC, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import UiTab from "@/components/ui/ui-tab";

import styles from "./banks-view.module.scss";
import ActivePaymentsTab from "../active-payments-tab";
import PaymentApplicationsTab from "../payment-applications-tab";

const TAB_KEYS = {
  activePayments: "active-payments",
  paymentApplications: "payment-applications"
};

const VALID_TABS = new Set<string>(Object.values(TAB_KEYS));

export const BanksView: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const activeKey = tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : TAB_KEYS.activePayments;

  const handleChangeTab = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const items = [
    {
      key: TAB_KEYS.activePayments,
      label: "Pagos activos",
      children: <ActivePaymentsTab />
    },
    {
      key: TAB_KEYS.paymentApplications,
      label: "Aplicaciones de pago",
      children: <PaymentApplicationsTab />
    }
  ];

  return (
    <div className={styles.banksView}>
      <UiTab
        tabs={items}
        sticky
        stickyOffset="-1rem"
        activeKey={activeKey}
        onChangeTab={handleChangeTab}
      />
    </div>
  );
};

export default BanksView;
