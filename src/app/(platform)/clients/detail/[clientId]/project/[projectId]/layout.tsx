"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Flex, Spin } from "antd";
import { useTranslations } from "use-intl";

import { extractSingleParam } from "@/utils/utils";
import { useMessageApi, MessageProvider } from "@/context/MessageContext";
import { SelectedPaymentsProvider } from "@/context/SelectedPaymentsContext";
import { useClientDetails } from "@/modules/clients/hooks/client-details/client-details.hook";
import { useFinancialDiscounts } from "@/hooks/useFinancialDiscounts";

import Header from "@/components/organisms/header";
import UiTab from "@/components/ui/ui-tab";
import { InvoiceAction } from "@/modules/clients/constants/invoice-actions.constants";
import InvoiceActionsModal from "@/modules/clients/containers/invoice-actions-modal";
import {
  IClientPortfolioFilters,
  FilterClientPortfolio
} from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";

import {
  ClientDetailsContext,
  ClientDetailsContextType
} from "@/modules/clients/contexts/client-details-context";

import styles from "@/modules/clients/containers/client-details/client-details.module.scss";

interface ClientDetailsLayoutProps {
  children: React.ReactNode;
}

const ClientDetailsLayout: FC<ClientDetailsLayoutProps> = ({ children }) => {
  const t = useTranslations("clients.detail.tabs");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";
  const projectId = extractSingleParam(params.projectId) || "";

  // Extract active tab from URL
  const pathParts = pathname.split("/");
  const activeTab = pathParts[6] || "dashboard";

  const [filters, setFilters] = useState<IClientPortfolioFilters>({
    zones: [],
    lines: [],
    sublines: [],
    channels: [],
    radicado: false,
    novedad: false,
    paymentAgreement: null,
    radicationType: null
  });

  const { data: portfolioData, error, mutate } = useClientDetails(filters);
  const { mutate: mutateFinancialDiscounts } = useFinancialDiscounts({ clientId });
  const { showMessage } = useMessageApi();

  const [showInvoiceActionsModal, setShowInvoiceActionsModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<InvoiceAction>(InvoiceAction.GenerateAction);

  useEffect(() => {
    if (error) {
      showMessage("error", error);
    }
  }, [error]);

  const handleTabChange = (key: string) => {
    // Trigger data mutations before navigation if needed
    if (key === "dashboard") {
      mutate();
    }
    if (key === "ajustes") {
      mutateFinancialDiscounts();
    }

    router.push(`/clients/detail/${clientId}/project/${projectId}/${key}`);
  };

  const items = [
    { key: "dashboard", label: t("dashboard") },
    { key: "receivables", label: t("receivables") },
    { key: "balances", label: t("balances") },
    { key: "notes", label: t("notes") },
    { key: "payments", label: t("payments") },
    { key: "cash-application", label: t("cashApplication") },
    { key: "contacts", label: t("contacts") },
    { key: "history", label: t("history") }
  ];

  const ClientDetailObject: ClientDetailsContextType = useMemo(
    () => ({
      selectedOption,
      setSelectedOption,
      showInvoiceActionsModal,
      setShowInvoiceActionsModal,
      portfolioData,
      clientFilters: filters
    }),
    [portfolioData, selectedOption, showInvoiceActionsModal, filters]
  );

  return (
    <SelectedPaymentsProvider>
      <MessageProvider>
        <ClientDetailsContext.Provider value={ClientDetailObject}>
          <div className="cp-page">
            <Header
              title={portfolioData?.data_wallet?.client_name ?? tCommon("status.loading")}
              titleExtra={portfolioData?.data_wallet?.client_id}
              back="/clients/all"
              actionsExtra={<FilterClientPortfolio setSelectedFilters={setFilters} />}
            />
            <main className={styles.mainDetail}>
              <Flex vertical className={styles.containerDetailClient}>
                <UiTab tabs={items} sticky onChangeTab={handleTabChange} activeKey={activeTab} />

                {!portfolioData ? (
                  <Spin style={{ margin: "1rem auto", display: "block" }} />
                ) : (
                  <div>{children}</div>
                )}
              </Flex>
            </main>
          </div>
          {showInvoiceActionsModal && <InvoiceActionsModal />}
        </ClientDetailsContext.Provider>
      </MessageProvider>
    </SelectedPaymentsProvider>
  );
};

export default ClientDetailsLayout;
