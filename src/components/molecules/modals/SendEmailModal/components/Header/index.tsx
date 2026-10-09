import { Button, Flex } from "antd";
import { ArrowsInSimple, ArrowsOutSimple, CaretDown, Minus, X } from "phosphor-react";
import styles from "./Header.module.scss";

export interface HeaderProps {
  setViewMode: (viewMode: "default" | "minimized" | "maximized") => void;
  setModalSize: (size: { width: number; height: number }) => void;
  setMask: (mask: boolean) => void;
  onClose: () => void;
  showMinimize: boolean;
  showMaximize: boolean;
  showRestore: boolean;
  title: string;
}

export const Header = ({
  setViewMode,
  setModalSize,
  setMask,
  onClose,
  showMinimize,
  showMaximize,
  showRestore,
  title
}: HeaderProps) => {
  const handleMaximize = () => {
    setViewMode("maximized");
    setModalSize({ width: 940, height: 520 });
    setMask(true);
  };

  const handleRestore = () => {
    setViewMode("default");
    setModalSize({ width: 660, height: 520 });
    setMask(false);
  };

  const handleMinimize = () => {
    setViewMode("minimized");
    setModalSize({ width: 660, height: 520 });
    setMask(false);
  };

  return (
    <div className={styles.modalHeader}>
      <Flex gap={8}>
        <CaretDown color="#ffffff" size={20} />
        <span>{title}</span>
      </Flex>
      <Flex gap={8}>
        {showMinimize && (
          <Button type="text" icon={<Minus color="#ffffff" size={20} />} onClick={handleMinimize} />
        )}
        {showMaximize && (
          <Button
            type="text"
            icon={<ArrowsOutSimple color="#ffffff" size={20} />}
            onClick={handleMaximize}
          />
        )}
        {showRestore && (
          <Button
            type="text"
            icon={<ArrowsInSimple color="#ffffff" size={20} />}
            onClick={handleRestore}
          />
        )}
        <Button type="text" icon={<X color="#ffffff" size={20} />} onClick={() => onClose()} />
      </Flex>
    </div>
  );
};
