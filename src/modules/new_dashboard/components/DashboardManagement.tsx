import React from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "use-intl";
import { formatCompactCurrency } from "./Formatters";
import RiskBadge from "./RiskBadge";
import ExpandableCard from "./ExpandableCard";
import { CUSTOMERS_RISK, RISK_KEYS, RISK_STATS, STRATEGIES_DATA } from "../lib/constants";

const DashboardManagement: React.FC = () => {
  const t = useTranslations("newDashboard.management");
  const tRisk = useTranslations("newDashboard.risk");
  const tCommon = useTranslations("common");
  return (
    <div className="grid grid-cols-12 gap-[var(--card-gap)] animate-fade-in">
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
        {/* Risk Stats Cards */}
        <ExpandableCard
          title={
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> {t("customerRisk")}
            </span>
          }
        >
          {(isExpanded) => (
            <div className="flex flex-col h-full justify-center">
              <div
                className={`flex justify-between items-end ${isExpanded ? "mb-12 px-12" : "mb-6"}`}
              >
                {[
                  { count: 868, subtitle: t("customersTotal") },
                  { count: 2387, subtitle: t("customersActive") },
                  { count: 5208, subtitle: t("customersInactive") }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <p
                      className={`${isExpanded ? "text-3xl" : "text-lg md:text-xl"} font-bold text-[#141414]`}
                    >
                      {item.count}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1">{item.subtitle}</p>
                  </div>
                ))}
              </div>

              <div
                className={`flex rounded-lg overflow-hidden ${isExpanded ? "h-20" : "h-10 md:h-12"}`}
              >
                {RISK_STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center text-white text-[13px] font-bold transition-all"
                    style={{ width: `${stat.value}%`, backgroundColor: stat.color }}
                  >
                    {stat.percentage}
                  </div>
                ))}
              </div>
              <div
                className={`flex justify-between mt-2 text-[13px] text-gray-500 px-1 overflow-x-auto gap-2 whitespace-nowrap ${isExpanded ? "text-sm mt-4" : ""}`}
              >
                {RISK_STATS.map((stat, idx) => (
                  <span key={idx} className="flex-shrink-0 flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${isExpanded ? "inline-block" : "hidden"}`}
                      style={{ backgroundColor: stat.color }}
                    ></span>
                    {tRisk(RISK_KEYS[stat.label])}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ExpandableCard>

        {/* Strategies Table */}
        <ExpandableCard
          title={
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> {t("strategies")}
            </span>
          }
          noPadding={true}
        >
          {(isExpanded) => (
            <div className="overflow-x-auto">
              <table className={`w-full text-[13px] ${isExpanded ? "text-sm" : ""}`}>
                <thead className="bg-cp-surface">
                  <tr>
                    <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-left rounded-tl">
                      {t("columns.customerType")}
                    </th>
                    <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-right">
                      {t("columns.receivables")}
                    </th>
                    <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-center">
                      %
                    </th>
                    <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-center rounded-tr">
                      {t("columns.visits")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {STRATEGIES_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.type}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatCompactCurrency(row.cartera)}
                      </td>
                      <td className="px-4 py-3 text-center">{row.percentage}%</td>
                      <td className="px-4 py-3 text-center">{row.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ExpandableCard>

        {/* Novedades Summary */}
        <ExpandableCard
          title={
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> {t("disputes")}
            </span>
          }
        >
          {(isExpanded) => (
            <div
              className={`flex items-center justify-between h-full ${isExpanded ? "px-8 py-8" : ""}`}
            >
              <div>
                <p
                  className={`${isExpanded ? "text-4xl" : "text-xl md:text-2xl"} font-bold text-[#141414]`}
                >
                  1290
                </p>
                <p className="text-[13px] text-gray-500">{t("totalDisputes")}</p>
              </div>
              <div className="text-right">
                <p
                  className={`${isExpanded ? "text-4xl" : "text-xl md:text-2xl"} font-bold text-[#141414]`}
                >
                  1280
                </p>
                <p className="text-[13px] text-gray-500">{t("thisMonth")}</p>
              </div>
              <div
                className={`${isExpanded ? "h-24 w-32" : "h-14 w-20 md:h-16 md:w-24"} bg-[#141414] rounded flex flex-col items-center justify-center text-white p-2`}
              >
                <span
                  className={`${isExpanded ? "text-4xl" : "text-xl md:text-2xl"} font-bold text-orange-500`}
                >
                  16
                </span>
                <span className="text-[13px] text-center leading-none mt-1">{t("avgDays")}</span>
              </div>
            </div>
          )}
        </ExpandableCard>
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-8">
        <ExpandableCard
          className="h-full"
          noPadding={true}
          title={
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center w-full pr-10">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> {t("byCustomer")}
              </span>
              <button className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[13px] font-bold hover:bg-purple-200 transition-colors">
                <Sparkles size={14} />{" "}
                {t.rich("analyzeWith", {
                  wide: (chunks) => <span className="hidden sm:inline">{chunks}</span>
                })}
              </button>
            </div>
          }
        >
          {(isExpanded) => (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-x-auto">
                <table
                  className={`w-full text-[13px] ${isExpanded ? "text-sm" : "md:text-sm"} text-left whitespace-nowrap`}
                >
                  <thead className="bg-cp-surface">
                    <tr>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink">
                        {tCommon("fields.customer")}
                      </th>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-right">
                        {t("columns.receivables")}
                      </th>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-right">
                        {t("columns.pastDue")}
                      </th>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-center">
                        {t("columns.pastDuePct")}
                      </th>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-center">
                        {t("columns.visits")}
                      </th>
                      <th className="border-b border-cp-line px-4 py-3 text-[13.5px] font-semibold text-cp-ink text-center w-28">
                        {t("columns.risk")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {CUSTOMERS_RISK.map((customer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white group-hover:bg-gray-50">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCompactCurrency(customer.portfolio)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCompactCurrency(customer.overdue)}
                        </td>
                        <td className="px-4 py-3 text-center">{customer.overduePercentage} %</td>
                        <td className="px-4 py-3 text-center">{customer.visits}</td>
                        <td className="px-4 py-3">
                          <RiskBadge level={customer.risk} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center text-[13px] font-bold text-gray-700 gap-2">
                <span>{t("total")}</span>
                <div className="flex gap-4 md:gap-8 flex-col sm:flex-row text-center sm:text-right">
                  <span>{t("totalReceivables", { amount: "$ 269.7B" })}</span>
                  <span>{t("totalPastDue", { amount: "$ 95.6B" })}</span>
                </div>
              </div>
            </div>
          )}
        </ExpandableCard>
      </div>
    </div>
  );
};

export default DashboardManagement;
