import { FC, ReactNode } from "react";
import { Dropdown, MenuProps } from "antd";
import type { DropdownProps } from "antd";
import "./dropdown.scss";

export interface DropdownItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  type?: "divider" | "group";
  children?: DropdownItem[];
}

export interface GeneralDropdownProps extends Omit<DropdownProps, "menu" | "overlay" | "align"> {
  items: DropdownItem[];
  children: ReactNode;
  align?: "start" | "center" | "end";
  customDropdownClass?: string;
  customMenuClass?: string;
}

const GeneralDropdown: FC<GeneralDropdownProps> = ({
  items,
  children,
  align = "start",
  trigger = ["click"],
  customDropdownClass,
  customMenuClass,
  placement,
  ...restProps
}) => {
  // Transform simplified items to Ant Design MenuProps['items']
  const transformItems = (items: DropdownItem[]): MenuProps["items"] => {
    return items.map((item) => {
      if (item.type === "divider") {
        return { type: "divider", key: item.key };
      }

      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        onClick: item.onClick,
        disabled: item.disabled,
        danger: item.danger,
        children: item.children ? transformItems(item.children) : undefined
      };
    });
  };

  // Map align prop to Ant Design placement
  const getPlacement = (): DropdownProps["placement"] => {
    if (placement) return placement;

    switch (align) {
      case "start":
        return "bottomLeft";
      case "end":
        return "bottomRight";
      case "center":
      default:
        return "bottom";
    }
  };

  const menuProps: MenuProps = {
    items: transformItems(items),
    className: `generalDropdownMenu ${customMenuClass || ""}`
  };

  return (
    <div className={`generalDropdownContainer ${customDropdownClass || ""}`}>
      <Dropdown menu={menuProps} trigger={trigger} placement={getPlacement()} {...restProps}>
        {children}
      </Dropdown>
    </div>
  );
};

export default GeneralDropdown;
