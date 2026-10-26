"use client";
import { FC, ReactNode } from "react";
import styles from "./header.module.scss";
import { ProfileMenu } from "@/components/atoms/ProfileMenu/ProfileMenu";

interface HeaderProps {
  title: string;
  titleExtra?: ReactNode;
  actionsExtra?: ReactNode;
  className?: string;
}

const Header: FC<HeaderProps> = ({ title, titleExtra, actionsExtra, className }) => {
  return (
    <header className={`${styles.wrapper} ${className ?? ""}`}>
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>{title}</h1>
        {titleExtra}
      </div>
      <div className={styles.actions}>
        {actionsExtra}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
