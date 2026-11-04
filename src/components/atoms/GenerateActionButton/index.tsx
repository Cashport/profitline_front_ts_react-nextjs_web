import React from "react";
import { DotsThree } from "phosphor-react";
import { useTranslations } from "use-intl";
import styles from "./button.module.scss";

interface GenerateActionButtonProps {
  label?: string; // Texto del botón
  onClick?: () => void; // Acción a ejecutar al hacer clic
  icon?: React.ReactNode; // Icono opcional
  size?: "small" | "middle" | "large"; // Tamaño del botón
  style?: React.CSSProperties; // Estilos personalizados
  disabled?: boolean; // Deshabilitar el botón
}

export const GenerateActionButton: React.FC<GenerateActionButtonProps> = ({
  label,
  onClick,
  icon = <DotsThree size={18} weight="bold" />, // Icono predeterminado
  style, // Estilos personalizados pasados por props
  disabled = false
}) => {
  const t = useTranslations("components.generateActionButton");
  return (
    <button
      className={styles.buttonGenerateAction}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        ...style // Permite sobrescribir cualquier estilo definido en el SCSS
      }}
      onClick={onClick}
    >
      {icon && icon}
      {label ?? t("label")}
    </button>
  );
};
