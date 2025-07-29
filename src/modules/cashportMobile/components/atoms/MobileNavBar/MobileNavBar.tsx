import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import styles from "./mobileNavBar.module.scss";
import { Button } from "antd";

interface MobileNavBarProps {
  title: React.ReactNode;
  children?: React.ReactNode;
}

const MobileNavBar = ({ title, children }: MobileNavBarProps) => {
  return (
    <div className={styles.mobileNavBarWrapper}>
      <div className={styles.navBar}>
        <Button className={styles.navBar__icon} type="text">
          <ArrowLeft size={20} weight="light" />
        </Button>

        <p className={styles.navBar__title}>{title}</p>
      </div>

      <div>{children}</div>
    </div>
  );
};

export default MobileNavBar;
