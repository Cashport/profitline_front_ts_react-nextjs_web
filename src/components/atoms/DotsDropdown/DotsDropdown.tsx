import { ReactNode } from "react";
import { Dropdown, Button } from "antd";
import { DotsThree } from "phosphor-react";
import "./dotsDropdown.scss";
import { ItemType } from "antd/es/menu/interface";

interface DotsDropdownProps {
  items?: ItemType[];
  dotsSize?: string;
  customButtonStyle?: React.CSSProperties;
  customIcon?: ReactNode;
}

export const DotsDropdown = ({
  items,
  customButtonStyle,
  customIcon,
  dotsSize = "18px"
}: DotsDropdownProps) => {
  const customDropdown = (menu: ReactNode) => <div className="dropdown">{menu}</div>;

  // Mismo alto que el buscador de la barra (DESIGN.md §8).
  const buttonStyle = {
    height: "var(--control-h)",
    width: "var(--control-h)"
  };

  return (
    <Dropdown
      dropdownRender={customDropdown}
      menu={{ items }}
      placement="bottomLeft"
      trigger={["click"]}
    >
      <Button
        style={customButtonStyle ? customButtonStyle : buttonStyle}
        className="dotsButton"
        icon={customIcon ? customIcon : <DotsThree size={dotsSize} />}
      />
    </Dropdown>
  );
};
