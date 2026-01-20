import type { ThemeConfig } from "antd";
//TODO: investigate a great way to improve the theme
const theme: ThemeConfig = {
  token: {
    colorPrimary: "#000000",
    colorText: "#000000",
    colorTextSecondary: "#FFFFFF",
    colorTextPlaceholder: "#000000",
    colorSplit: "#FFFFFF",
    fontFamily: "inherit",
    green: "#CBE71E"
  },
  components: {
    Message: {
      contentBg: "#FFFFFF"
    },
    Switch: {
      // handleBg: '#CBE71E',
      colorPrimary: "#CBE71E"
    },
    Modal: {
      colorBgElevated: "#FFFFFF"
    },
    Radio: {
      colorPrimary: "#CBE71E",
      colorBorder: "#b3b2b2",
      colorPrimaryBorder: "black"
    },
    Popover: {
      colorBgElevated: "#F7F7F7"
    },
    Checkbox: {
      colorPrimary: "#CBE71E",
      colorWhite: "#141414",
      colorPrimaryHover: "#CBE71E"
    },
    Table: {
      headerBg: "#FFF",
      headerColor: "#141414",
      headerSplitColor: "transparent",
      rowSelectedBg: "transparent",
      rowSelectedHoverBg: "transparent"
    },
    DatePicker: {
      colorBgElevated: "#FFFFFF",
      controlHeight: 47
    },
    Notification: {
      colorBgElevated: "#141414",
      colorText: "#FFFFFF",
      colorError: "#CBE71E"
    }
  }
};

export default theme;
