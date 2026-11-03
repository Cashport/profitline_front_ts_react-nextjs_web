"use client";
import { FC, ReactNode } from "react";
import { CaretLeft } from "phosphor-react";
import styles from "./header.module.scss";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "./user-menu/user-menu";

interface HeaderProps {
  title: string;
  /** Reemplaza el texto del título (p. ej. un selector de tableros); `title` queda como nombre accesible. */
  titleNode?: ReactNode;
  /** Línea pequeña bajo el título (corte, "Proyectar a cierre"…). */
  titleExtra?: ReactNode;
  /** Controles a la izquierda del avatar, en el orden de docs/DESIGN.md §4: chips, Filtrar, buscador, ⋯. */
  actionsExtra?: ReactNode;
  /**
   * Muestra "‹" antes del título (pantallas de detalle). Vuelve en el historial; si se entró
   * por URL directa va a esta ruta (string) o al segmento padre de la URL actual (true).
   */
  back?: boolean | string;
  className?: string;
}

const Header: FC<HeaderProps> = ({
  title,
  titleNode,
  titleExtra,
  actionsExtra,
  back,
  className
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(
      typeof back === "string" ? back : pathname.split("/").slice(0, -1).join("/") || "/"
    );
  };

  return (
    <header className={`${styles.wrapper} ${className ?? ""}`}>
      {back && (
        <button type="button" className={styles.back} onClick={handleBack} title="Volver">
          <CaretLeft size={21} weight="bold" />
        </button>
      )}
      <div className={styles.titleBlock}>
        {titleNode ?? <h1 className={styles.title}>{title}</h1>}
        {titleExtra && <div className={styles.meta}>{titleExtra}</div>}
      </div>
      {/* cp-on-page: los controles del header van sobre el gris (Filtrar, buscador → blancos). */}
      <div className={`cp-on-page ${styles.actions}`}>
        {actionsExtra}
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
