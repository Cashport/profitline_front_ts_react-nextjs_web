import WalletLayout from "@/modules/walletModule/containers/wallet-layout/wallet-layout";
import { WalletMatrixSocketProvider } from "@/context/WalletMatrixSocketContext";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("aging");

export default function Layout({ children }: { children: React.ReactNode }) {
  // El socket avisa cuando el worker termina de regenerar la foto, para no
  // dejar al usuario esperando sin saber si su "Actualizar ahora" avanzó.
  return (
    <WalletMatrixSocketProvider>
      <WalletLayout>{children}</WalletLayout>
    </WalletMatrixSocketProvider>
  );
}
