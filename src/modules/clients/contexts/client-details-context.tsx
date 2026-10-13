import { Dispatch, SetStateAction, createContext } from "react";
import { InvoiceAction } from "../constants/invoice-actions.constants";
import { IClientPortfolioFilters } from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";
import { IDataSection } from "@/types/portfolios/IPortfolios";

export type ClientDetailsContextType = {
  selectedOption: InvoiceAction;
  setSelectedOption: Dispatch<SetStateAction<InvoiceAction>>;
  showInvoiceActionsModal: boolean;
  setShowInvoiceActionsModal: Dispatch<SetStateAction<boolean>>;
  portfolioData: IDataSection | undefined;
  clientFilters: IClientPortfolioFilters;
};

export const ClientDetailsContext = createContext<ClientDetailsContextType>(
  {} as ClientDetailsContextType
);
