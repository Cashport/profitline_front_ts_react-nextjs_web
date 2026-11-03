import { Cascader, ConfigProvider } from "antd";
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
  return (
    <ConfigProvider theme={TOOLBAR_THEME}>
      <Cascader
        style={{ width: "130px" }}
        multiple={false}
        removeIcon
        maxTagCount="responsive"
        placeholder="Filtrar"
        placement="bottomRight"
        options={[
          { label: "Activo", value: 1 },
          { label: "Inactivo", value: 0 }
        ]}
        onChange={(_, filter) => handleChangeActive?.(filter)}
      />
    </ConfigProvider>
  );
}
