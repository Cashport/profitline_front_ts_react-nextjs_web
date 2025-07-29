import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import styles from "./mobileNavBar.module.scss";
import { Button } from "antd";

interface MobileNavBarProps {
  title: React.ReactNode;
  onBack?: () => void;
  children?: React.ReactNode;
}

const MobileNavBar = ({ title, onBack, children }: MobileNavBarProps) => {
  return (
    <div className={styles.mobileNavBarWrapper}>
      <div className={styles.navBar}>
        <Button className={styles.navBar__icon} type="text" onClick={onBack}>
          <ArrowLeft size={20} weight="light" />
        </Button>

        <p className={styles.navBar__title}>{title}</p>
      </div>

      <div style={{ marginTop: "46px" }}>{children}</div>
    </div>
  );
};

export default MobileNavBar;
