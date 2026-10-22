"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Popover } from "antd";
import { CaretDown, User } from "phosphor-react";

import { logOut } from "../../../../firebase-utils";
import styles from "./ProfileMenu.module.scss";

/** Avatar del usuario con el menú para cerrar sesión, a la derecha de los encabezados. */
export const ProfileMenu = () => {
  const router = useRouter();

  const handleLogOut = useCallback(() => {
    logOut(router);
  }, [router]);

  return (
    <div className={styles.profile}>
      <Avatar icon={<User />} />
      <Popover
        placement="bottomRight"
        trigger="click"
        content={<Button onClick={handleLogOut}>Cerrar Sesion</Button>}
      >
        <CaretDown className={styles.arrow} />
      </Popover>
    </div>
  );
};
