"use client";
import ApplyTab from "@/modules/clients/containers/apply-tab";
import styles from "./page.module.scss";
import { CLIENTUUID_DEMO } from "@/utils/constants/globalConstants";

function Page() {
  return (
    <ApplyTab
      className={styles.applyModule}
      defaultPositionDragModal={{ x: -130, y: -15 }}
      isInApplyModule={true}
      clientUUID={CLIENTUUID_DEMO}
    />
  );
}

export default Page;
