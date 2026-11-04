"use client";
import "./DiscountWrapper.scss";
import redirectModal from "@/components/molecules/modals/redirectModal/RedirectModal";
import { useAppStore } from "@/lib/store/store";
import { useEffect } from "react";
import { useTranslations } from "use-intl";
import Header from "../../header";
import { SideBar } from "@/components/molecules/SideBar/SideBar";

export default function DiscountWrapper({ children }: { children: React.ReactNode }) {
  const t = useTranslations("discounts");
  const { ID } = useAppStore((projects) => projects.selectedProject);
  useEffect(() => {
    if (!ID) redirectModal();
  }, []);
  return (
    <div className="page">
      <SideBar />
      <div className="mainContent">
        <Header title={t("title")} />
        {children}
      </div>
    </div>
  );
}
