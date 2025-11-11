"use client";
import redirectModal from "@/components/molecules/modals/redirectModal/RedirectModal";
import DiscountPage from "@/components/organisms/discounts/DiscountPage";
import { useAppStore } from "@/lib/store/store";
import { useEffect } from "react";

function Page() {
  const { ID } = useAppStore((projects) => projects.selectedProject);
  useEffect(() => {
    if (!ID) redirectModal();
  }, [ID]);
  return <DiscountPage />;
}

export default Page;
