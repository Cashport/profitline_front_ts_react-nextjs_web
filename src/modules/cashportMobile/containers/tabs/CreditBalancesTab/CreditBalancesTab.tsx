"use client";
import React, { useState } from "react";
import { Flex } from "antd";
import { PlusCircle, CaretDown, CaretUp } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import CreditBalanceCard from "@/modules/cashportMobile/components/CreditBalanceCard/CreditBalanceCard";
import { CreditBalanceFormated } from "@/types/clients/IClients";

import "./creditBalancesTab.scss";

export interface CreditBalancesTabProps {
  creditBalances: CreditBalanceFormated[];
}

const CreditBalancesTab: React.FC<CreditBalancesTabProps> = ({ creditBalances }) => {
  const [showAll, setShowAll] = useState(false);
  const t = useTranslations("publicPortals.mobile.creditBalances");
  const tCommon = useTranslations("common");
  const INITIAL_COUNT = 5;

  const visibleCredits = showAll ? creditBalances : creditBalances.slice(0, INITIAL_COUNT);
  const hasMore = creditBalances.length > INITIAL_COUNT;

  return (
    <Flex className="creditBalancesTab" vertical gap="2rem">
      {creditBalances.length > 0 ? (
        <Flex vertical gap="1rem">
          <Flex vertical gap="0.5rem">
            {visibleCredits.map((credit) => (
              <CreditBalanceCard key={credit.id} credit={credit} />
            ))}
          </Flex>

          {hasMore && (
            <button
              className="creditBalancesTab__seeMoreButton"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? tCommon("actions.showLess") : tCommon("actions.showMore")}
              {showAll ? <CaretUp size={14} /> : <CaretDown size={14} />}
            </button>
          )}

          <button className="creditBalancesTab__reportButton">
            {t("reportDispute")}
            <PlusCircle size={14} />
          </button>
        </Flex>
      ) : (
        <p>{t("empty")}</p>
      )}
    </Flex>
  );
};

export default CreditBalancesTab;
