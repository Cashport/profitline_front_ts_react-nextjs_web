import { Metadata } from "next";
import WalletLayout from "@/modules/walletModule/containers/wallet-layout/wallet-layout";

export const metadata: Metadata = {
  title: "Cartera",
  description: "Cartera por cliente y tramo"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <WalletLayout>{children}</WalletLayout>;
}
