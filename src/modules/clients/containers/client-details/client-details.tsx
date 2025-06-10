import { Dispatch, FC, SetStateAction, createContext, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Flex, Spin } from "antd";
import { CaretLeft } from "phosphor-react";

import { extractSingleParam } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import { useClientDetails } from "../../hooks/client-details/client-details.hook";
import { useFinancialDiscounts } from "@/hooks/useFinancialDiscounts";

import { WalletTab } from "@/components/organisms/Customers/WalletTab/WalletTab";
import Dashboard from "../dashboard";
import InvoiceActionsModal from "../invoice-actions-modal";
import UiTab from "@/components/ui/ui-tab";
import { InvoiceAction } from "../../constants/invoice-actions.constants";
import AccountingAdjustmentsTab from "../accounting-adjustments-tab";
import PaymentsTab from "@/modules/clients/containers/payments-tab";
import ContactsTab from "../contacts-tab";
import HistoryTab from "../history-tab";
import {
  IClientPortfolioFilters,
  FilterClientPortfolio
} from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";
import ApplyTab from "../apply-tab";

import { IDataSection } from "@/types/portfolios/IPortfolios";

import styles from "./client-details.module.scss";

type ClientDetailsContextType = {
  selectedOption: InvoiceAction;
  setSelectedOption: Dispatch<SetStateAction<InvoiceAction>>;
  showInvoiceActionsModal: boolean;
  setShowInvoiceActionsModal: Dispatch<SetStateAction<boolean>>;
  portfolioData: IDataSection | undefined;
};
interface ClientDetailsProps {}
export const ClientDetailsContext = createContext<ClientDetailsContextType>(
  {} as ClientDetailsContextType
);

export const ClientDetails: FC<ClientDetailsProps> = () => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";

  const [filters, setFilters] = useState<IClientPortfolioFilters>({
    zones: [],
    lines: [],
    sublines: [],
    channels: [],
    radicado: false,
    novedad: false
  });

  const { data: portfolioData, error, mutate } = useClientDetails(filters);
  const { mutate: mutateFinancialDiscounts } = useFinancialDiscounts({ clientId });
  const { showMessage } = useMessageApi();

  const [showInvoiceActionsModal, setShowInvoiceActionsModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<InvoiceAction>(InvoiceAction.GenerateAction);
  const [activeTab, setActiveTab] = useState<string>("1");

  useEffect(() => {
    if (error) {
      showMessage("error", error);
    }
  }, [error]);

  const onChangeTab = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === "1") {
      mutate();
    }

    if (activeKey === "3") {
      mutateFinancialDiscounts();
    }
  };

  const items = [
    {
      key: "1",
      label: "Dashboard",
      children: portfolioData ? (
        <Dashboard />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "2",
      label: "Cartera",
      children: portfolioData ? (
        <WalletTab />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "3",
      label: "Ajustes contables",
      children: portfolioData ? (
        <AccountingAdjustmentsTab />
      ) : (
        <Spin style={{ margin: "1rem auto", display: "block" }} />
      )
    },
    {
      key: "4",
      label: "Pagos",
      children: <PaymentsTab onChangeTab={onChangeTab} />
    },
    {
      key: "5",
      label: "Aplicación",
      children: <ApplyTab />
    },
    {
      key: "6",
      label: "Contactos",
      children: <ContactsTab />
    },
    {
      key: "7",
      label: "Historial",
      children: <HistoryTab />
    }
  ];

  const ClientDetailObject: ClientDetailsContextType = useMemo(
    () => ({
      selectedOption,
      setSelectedOption,
      showInvoiceActionsModal,
      setShowInvoiceActionsModal,
      portfolioData
    }),
    [portfolioData, selectedOption, showInvoiceActionsModal]
  );

  return (
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

          <UiTab tabs={items} sticky onChangeTab={onChangeTab} activeKey={activeTab} />
        </Flex>
      </main>
      {showInvoiceActionsModal && <InvoiceActionsModal />}
    </ClientDetailsContext.Provider>
  );
};

export default ClientDetails;
