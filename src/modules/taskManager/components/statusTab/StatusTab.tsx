"use client";

import { FC, ReactNode } from "react";
import { Badge } from "@/modules/chat/ui/badge";

export interface ItemTab {
  key: string;
  label: string;
  children: ReactNode;
  count?: number;
}

interface IStatusTabProps {
  tabs?: ItemTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

const StatusTab: FC<IStatusTabProps> = ({ tabs, activeKey, onChange }) => {
  const activeTab = tabs?.find((tab) => tab.key === activeKey);

  return (
    <>
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        {tabs?.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeKey === tab.key ? "text-cashport-black" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-100">
                {tab.count}
              </Badge>
            )}
            {activeKey === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cashport-green" />
            )}
          </button>
        ))}
      </div>
      {activeTab?.children}
    </>
  );
};

export default StatusTab;
