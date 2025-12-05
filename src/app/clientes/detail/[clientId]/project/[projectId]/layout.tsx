"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Flex, Spin } from "antd";
import { CaretLeft } from "phosphor-react";

import { extractSingleParam } from "@/utils/utils";
import { useMessageApi, MessageProvider } from "@/context/MessageContext";
import { SelectedPaymentsProvider } from "@/context/SelectedPaymentsContext";
import { useClientDetails } from "@/modules/clients/hooks/client-details/client-details.hook";
import { useFinancialDiscounts } from "@/hooks/useFinancialDiscounts";

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

    router.push(`/clientes/detail/${clientId}/project/${projectId}/${key}`);
  };

  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "cartera", label: "Cartera" },
    { key: "ajustes", label: "Ajustes contables" },
    { key: "pagos", label: "Pagos" },
    { key: "aplicacion", label: "Aplicación" },
    { key: "contactos", label: "Contactos" },
    { key: "historial", label: "Historial" }
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
          <main className={styles.mainDetail}>
            <Flex vertical className={styles.containerDetailClient}>
              <Flex className={styles.stickyHeader} align="center" justify="space-between">
                <Flex className={styles.infoHeader} align="center" justify="space-between">
                  <Link href={`/clientes/all`}>
                    <Button
                      type="text"
                      size="large"
                      className={styles.buttonGoBack}
                      icon={<CaretLeft size={"1.6rem"} />}
                    >
                      {portfolioData ? portfolioData?.data_wallet?.client_name : "Loading..."}
                    </Button>
                  </Link>
                  <FilterClientPortfolio setSelectedFilters={setFilters} />
                </Flex>
              </Flex>

              <UiTab tabs={items} sticky onChangeTab={handleTabChange} activeKey={activeTab} />

              {!portfolioData ? (
                <Spin style={{ margin: "1rem auto", display: "block" }} />
              ) : (
                <div>{children}</div>
              )}
            </Flex>
          </main>
          {showInvoiceActionsModal && <InvoiceActionsModal />}
        </ClientDetailsContext.Provider>
      </MessageProvider>
    </SelectedPaymentsProvider>
  );
};

export default ClientDetailsLayout;
