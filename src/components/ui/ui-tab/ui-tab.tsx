import { FC, ReactNode } from "react";
import "./ui-tab.scss";
import { Tabs } from "antd";

interface ITab {
  key: string;
  label: ReactNode;
  children: ReactNode;
}

interface UiTabProps {
  tabs: ITab[];
  sticky?: boolean;
  tabBarExtraContent?: ReactNode;
  // eslint-disable-next-line no-unused-vars
  onChangeTab?: (activeKey: string) => void;
  activeKey?: string;
  stickyOffset?: string; // New prop for sticky offset
}

const UiTab: FC<UiTabProps> = ({
  tabs,
  tabBarExtraContent,
  onChangeTab,
  activeKey,
  sticky = false,
  stickyOffset = "1rem" // Default value for sticky offset
}: UiTabProps) => {
  return (
    <div
      className={`tabsContainer ${sticky ? "-sticky" : ""}`}
      style={{ "--sticky-offset": stickyOffset } as React.CSSProperties}
    >
      <Tabs
        style={{ width: "100%", height: "100%" }}
        activeKey={activeKey}
        items={tabs}
        tabBarExtraContent={tabBarExtraContent}
        size="small"
        onChange={onChangeTab}
      />
    </div>
  );
};

export default UiTab;
