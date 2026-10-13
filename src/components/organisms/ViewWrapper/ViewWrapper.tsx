import { Flex } from "antd";
import { SideBar } from "../../molecules/SideBar/SideBar";
import Header from "../header";
import styles from "./ViewWrapper.module.scss";

interface IViewWrapper {
  headerTitle: string;
  headerTitleExtra?: React.ReactNode;
  /** Acciones del encabezado, a la izquierda del perfil (ej. "Filtrar"). */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  gapTitle?: string;
  hideHeader?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}
export default function ViewWrapper({
  headerTitle,
  headerTitleExtra,
  headerActions,
  children,
  gapTitle = "1rem",
  hideHeader = false,
  className,
  headerClassName,
  contentClassName
}: Readonly<IViewWrapper>) {
  return (
    <main className={`${styles.mainWrapper} ${className ?? ""}`}>
      <SideBar />
      <Flex vertical className={`${styles.rightContent} ${contentClassName ?? ""}`} gap={gapTitle}>
        {!hideHeader ? (
          <Header
            title={headerTitle}
            titleExtra={headerTitleExtra}
            actionsExtra={headerActions}
            className={headerClassName}
          />
        ) : null}
        {children}
      </Flex>
    </main>
  );
}
