import { Flex } from "antd";
import { SideBar } from "../../molecules/SideBar/SideBar";
import Header from "../header";
import styles from "./ViewWrapper.module.scss";

interface IViewWrapper {
  headerTitle: string;
  children: React.ReactNode;
  gapTitle?: string;
  hideHeader?: boolean;
}
export default function ViewWrapper({
  headerTitle,
  children,
  gapTitle = "1rem",
  hideHeader = false
}: Readonly<IViewWrapper>) {
  return (
    <main className={styles.mainWrapper}>
      <SideBar />
      <Flex vertical className={styles.rightContent} gap={gapTitle}>
        {!hideHeader ? <Header title={headerTitle} /> : null}
        {children}
      </Flex>
    </main>
  );
}
