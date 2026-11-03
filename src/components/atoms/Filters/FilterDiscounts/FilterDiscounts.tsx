import { Cascader, ConfigProvider } from "antd";
import { useTranslations } from "use-intl";
import "../filterCascader.scss";

/** Mismo alto que el buscador de la barra de herramientas (--control-h). */
const TOOLBAR_THEME = { token: { controlHeight: 36 } };

type Props = {
  handleChangeActive?: (
    // eslint-disable-next-line no-unused-vars
    filter: {
      label: string;
      value: number;
    }[]
  ) => void;
};

export default function FilterDiscounts({ handleChangeActive }: Props) {
  const tCommon = useTranslations("common");
  return (
    <ConfigProvider theme={TOOLBAR_THEME}>
      <Cascader
        style={{ width: "130px" }}
        multiple={false}
        removeIcon
        maxTagCount="responsive"
        placeholder={tCommon("actions.filter")}
        placement="bottomRight"
        options={[
          { label: tCommon("status.active"), value: 1 },
          { label: tCommon("status.inactive"), value: 0 }
        ]}
        onChange={(_, filter) => handleChangeActive?.(filter)}
      />
    </ConfigProvider>
  );
}
