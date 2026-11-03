import { Flex } from "antd";
import { SideBar } from "../../molecules/SideBar/SideBar";
import Header from "../header";
import styles from "./ViewWrapper.module.scss";

interface IViewWrapper {
  headerTitle: string;
  /** Línea pequeña bajo el título (corte, "Proyectar a cierre"…). */
  headerTitleExtra?: React.ReactNode;
  /** Acciones del encabezado, a la izquierda del perfil (chips, "Filtrar", buscador). */
  headerActions?: React.ReactNode;
  /** "‹" volver en pantallas de detalle; ver `back` en Header. */
  headerBack?: boolean | string;
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
  headerBack,
  children,
  gapTitle = "0",
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
            back={headerBack}
            className={headerClassName}
          />
        ) : null}
        {children}
      </Flex>
    </main>
  );
}
