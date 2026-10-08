"use client";
import { FC, ReactNode, useCallback } from "react";
import { CaretDown, User } from "phosphor-react";
import styles from "./header.module.scss";
import { Avatar, Button, Popover } from "antd";
import { logOut } from "../../../../firebase-utils";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  titleExtra?: ReactNode;
  actionsExtra?: ReactNode;
}

const Header: FC<HeaderProps> = ({ title, titleExtra, actionsExtra }) => {
  const router = useRouter();

  const handleLogOut = useCallback(() => {
    logOut(router);
  }, [router]);

  return (
    <header className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>{title}</h1>
        {titleExtra}
      </div>
      <div className={styles.actions}>
        {actionsExtra}
        <div className={styles.profile}>
          <Avatar icon={<User />} />
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <>
                <Button onClick={handleLogOut}>Cerrar Sesion</Button>
              </>
            }
          >
            <CaretDown className={styles.arrow} />
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
