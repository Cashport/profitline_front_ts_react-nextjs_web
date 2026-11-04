import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import { Button, MenuProps } from "antd";
import { useTranslations } from "use-intl";

type Props = {
  handleDeleteDiscount: () => void;
  disableDelete: boolean;
};

export default function DropdownDiscount({ handleDeleteDiscount, disableDelete }: Props) {
  const tCommon = useTranslations("common");
  const items: MenuProps["items"] = [
    {
      key: "discount-option-1",
      label: (
        <Button className="buttonOutlined" disabled={disableDelete} onClick={handleDeleteDiscount}>
          {tCommon("actions.delete")}
        </Button>
      )
    }
  ];
  return <DotsDropdown items={items} />;
}
