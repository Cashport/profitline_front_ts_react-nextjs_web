import { Flex } from "antd";
import Search from "antd/es/input/Search";
import { useTranslations } from "use-intl";

interface Props {
  isSearched?: boolean;
}

export const NavRightSection = ({ isSearched = false }: Props) => {
  const tCommon = useTranslations("common");
  return (
    <Flex align="center" gap="0.75rem">
      {isSearched && (
        <Search
          size="large"
          style={{ width: "300px" }}
          placeholder={tCommon("placeholders.search")}
        />
      )}
    </Flex>
  );
};
