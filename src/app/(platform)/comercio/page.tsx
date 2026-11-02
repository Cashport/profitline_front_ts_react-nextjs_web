"use client";
import OrdersView from "@/modules/commerce/containers/orders-view/orders-view";
import { MessageProvider } from "@/context/MessageContext";
import { useState, useEffect } from "react";
import Loader from "@/components/atoms/loaders/loader";
import { useAppStore } from "@/lib/store/store";
import { getMarketplaceConfig } from "@/services/commerce/commerce";

function Page() {
  const [loading, setLoading] = useState(true);
  const { config, setConfig, projectId } = useAppStore((state) => ({
    config: state.config,
    setConfig: state.setConfig,
    projectId: state.selectedProject?.ID || 0
  }));

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Solo hacer el fetch si no existe configuración
        if (!config || config.projectId === 0 || config.projectId !== projectId) {
          const configData = await getMarketplaceConfig();
          const configObject = {
            include_iva:
              configData.find((item) => item.name === "include_iva")?.value === "1" || false,
            create_client_btn:
              configData.find((item) => item.name === "create_client_btn")?.value === "1" || false,
            projectId: projectId
          };
          setConfig(configObject);
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [config, setConfig, projectId]);

  if (loading) {
    return <Loader></Loader>;
  }
  return (
    <MessageProvider>
      <OrdersView />
    </MessageProvider>
  );
}

export default Page;
