import { Flex } from "antd";
import { SideBar } from "../../molecules/SideBar/SideBar";
import Header from "../header";
import styles from "./ViewWrapper.module.scss";

interface IViewWrapper {
  headerTitle: string;
  children: React.ReactNode;
  gapTitle?: string;
}
export default function ViewWrapper({
  headerTitle,
  children,
  gapTitle = "1rem"
}: Readonly<IViewWrapper>) {
  return (
    <main className={styles.mainWrapper}>
      <SideBar />
      <Flex vertical className={styles.rightContent} gap={gapTitle}>
        <Header title={headerTitle} />
        {children}
      </Flex>
    </main>
  );
}
