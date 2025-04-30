import React, { ReactNode } from "react";
import { Flex, Typography } from "antd";

const { Text } = Typography;

interface ColumnTextProps {
  title: string; // El título que se mostrará junto al ícono
  icon: ReactNode; // Cualquier icono, incluido de phosphor-react
  content: string | ReactNode; // Puede ser texto o un componente
  titleStyle?: React.CSSProperties; // Estilo opcional para el título
  contentStyle?: React.CSSProperties; // Estilo opcional para el contenido
  gap?: number; // Espaciado entre columnas
  iconGap?: number; // Espaciado entre ícono y título
}

const ColumnText: React.FC<ColumnTextProps> = ({
  title,
  icon,
  content,
  titleStyle,
  contentStyle,
  gap = 44,
  iconGap = 8
}) => (
  <Flex gap={gap} align="start">
    {/* Columna del ícono y el título */}
    <Flex flex={2} align="center" gap={iconGap}>
      {icon}
      <Text
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#7B7B7B",
          margin: 0,
          ...titleStyle // Permite sobrescribir el estilo
        }}
      >
        {title}
      </Text>
    </Flex>
    {/* Columna del contenido */}
    <Flex flex={5}>
      {typeof content === "string" ? (
        <Text
          style={{
            fontSize: 16,
            fontWeight: 300,
            color: "#000000", // Ajusta el color predeterminado
            ...contentStyle // Permite sobrescribir el estilo
          }}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </Flex>
  </Flex>
);

export default ColumnText;
