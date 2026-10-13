import { Flex } from "antd";
import { Triangle } from "phosphor-react";

const centerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%"
};

export default function TablePaginator(
  page: number,
  type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
  originalElement: React.ReactNode
) {
  if (type === "prev") {
    return (
      <span style={centerStyle}>
        <Triangle size={".75rem"} weight="fill" style={{ transform: "rotate(-90deg)" }} />
      </span>
    );
  }
  if (type === "next") {
    return (
      <span style={centerStyle}>
        <Triangle size={".75rem"} weight="fill" style={{ transform: "rotate(90deg)" }} />
      </span>
    );
  }
  if (type === "page") {
    return <Flex justify="center">{page}</Flex>;
  }

  if (type === "jump-prev") {
    return (
      <span style={centerStyle}>
        <Triangle size={".75rem"} weight="fill" style={{ transform: "rotate(-180deg)" }} />
      </span>
    );
  }
  return originalElement;
}
