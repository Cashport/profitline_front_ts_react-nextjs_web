import { FC } from "react";
import { Collapse, CollapsePanelProps, CollapseProps } from "antd";
import "./collapse.scss";

interface ItemCollapse {
  key?: any;
  label?: CollapsePanelProps["header"];
  children?: CollapsePanelProps["children"];
}

// Extender los props de Ant Design Collapse y agregar los personalizados
interface ICollapseProps extends Omit<CollapseProps, "items"> {
  items: ItemCollapse[] | undefined;
  stickyLabel?: boolean;
  labelStickyOffset?: string;
}

const GenericCollapse: FC<ICollapseProps> = ({
  items,
  accordion,
  stickyLabel,
  labelStickyOffset,
  ...restProps
}) => {
  return (
    <Collapse
      {...restProps} // Pasar todos los props adicionales
      style={
        {
          ...restProps.style, // Mantener estilos existentes si los hay
          "--sticky-offset": `${labelStickyOffset ? labelStickyOffset : "8.3rem"}`
        } as React.CSSProperties
      }
      className={`genericCollapse ${stickyLabel ? "sticky" : ""} ${restProps.className || ""}`}
      ghost
      items={items}
      accordion={accordion}
    />
  );
};

export default GenericCollapse;
