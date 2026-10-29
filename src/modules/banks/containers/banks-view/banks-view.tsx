"use client";
import { FC, useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { BanksChromeContext } from "../../contexts/banks-chrome-context";

import styles from "./banks-view.module.scss";
import ActivePaymentsTab from "../active-payments-tab";
import PaymentApplicationsTab from "../payment-applications-tab";
import WalletPaymentsTab from "../wallet-payments-tab";
import { PaymentTransactionType } from "@/modules/banks/constants/paymentTransactionType";

const TAB_KEYS = {
  activePayments: "active-payments",
  paymentApplications: "payment-applications",
  paymentApplicationsInformal: "payment-applications-informal",
  legalizaciones: "legalizaciones",
  walletPayments: "wallet-payments"
};

const VALID_TABS = new Set<string>(Object.values(TAB_KEYS));

export const BanksView: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Espacios donde la pestaña activa pinta sus controles (ver banks-chrome-context).
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const [tabsSlot, setTabsSlot] = useState<HTMLElement | null>(null);

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
      children: <ActivePaymentsTab isActive={activeKey === TAB_KEYS.activePayments} />
    },
    {
      key: TAB_KEYS.walletPayments,
      label: "Otros pagos",
      children: <WalletPaymentsTab isActive={activeKey === TAB_KEYS.walletPayments} />
    },
    {
      key: TAB_KEYS.paymentApplications,
      label: "Aplicaciones de pago",
      children: (
        <PaymentApplicationsTab
          isActive={activeKey === TAB_KEYS.paymentApplications}
          transactionType={[PaymentTransactionType.Formal, PaymentTransactionType.Homemarket]}
        />
      )
    },
    {
      key: TAB_KEYS.paymentApplicationsInformal,
      label: "Aplicación de pago Informal",
      children: (
        <PaymentApplicationsTab
          isActive={activeKey === TAB_KEYS.paymentApplicationsInformal}
          transactionType={[PaymentTransactionType.Informal, PaymentTransactionType.Wallet]}
        />
      )
    },
    {
      key: TAB_KEYS.legalizaciones,
      label: "Legalizaciones",
      children: (
        <PaymentApplicationsTab
          isActive={activeKey === TAB_KEYS.legalizaciones}
          transactionType={[PaymentTransactionType.Legalizacion]}
        />
      )
    }
  ];

  return (
    <BanksChromeContext.Provider value={{ headerSlot, tabsSlot }}>
      <div className="cp-page">
        <Header
          title="Bancos"
          actionsExtra={<div ref={setHeaderSlot} className="cp-on-page flex items-center gap-2" />}
        />
        <div className={styles.banksView}>
          <UiTab
            tabs={items}
            sticky
            stickyOffset="0"
            activeKey={activeKey}
            onChangeTab={handleChangeTab}
            tabBarExtraContent={<div ref={setTabsSlot} className="flex items-center gap-2" />}
          />
        </div>
      </div>
    </BanksChromeContext.Provider>
  );
};

export default BanksView;
