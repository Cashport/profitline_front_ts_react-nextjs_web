"use client";
import ApplyTab from "@/modules/clients/containers/apply-tab";
import styles from "./page.module.scss";

function Page() {
  return (
    <ApplyTab
      className={styles.applyModule}
      defaultPositionDragModal={{ x: -130, y: -15 }}
      isInApplyModule={true}
    />
  );
}

export default Page;
