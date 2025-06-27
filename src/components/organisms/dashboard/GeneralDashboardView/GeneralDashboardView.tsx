import { FC, useState } from "react";
import { Spin } from "antd";

import { useGeneralPortfolio } from "@/hooks/useGeneralPortfolio";
import GeneralDashboard from "../GeneralDashboard/GeneralDashboard";
import {
  FilterClientPortfolio,
  IClientPortfolioFilters
} from "@/components/atoms/Filters/FilterClientPortfolio/FilterClientPortfolio";

import styles from "./generalDashboardView.module.scss";

const GeneralDashboardView: FC = () => {
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

  const { data, loading } = useGeneralPortfolio(filters);

  return (
    <div className={styles.generalDashboardView}>
      <div className={styles.filterContainer}>
        <FilterClientPortfolio setSelectedFilters={setFilters} />
      </div>
      {loading ? (
        <Spin size="large" style={{ margin: "70px auto" }} />
      ) : (
        <GeneralDashboard portfolioData={data} />
      )}
    </div>
  );
};

export default GeneralDashboardView;
