import { Metadata } from "next";
import { SideBar } from "@/components/molecules/SideBar/SideBar";
import { SocketProvider } from "@/context/ChatContext";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <div className="page">
        <SideBar />
        <div className="mainContent">{children}</div>
      </div>
    </SocketProvider>
  );
}
