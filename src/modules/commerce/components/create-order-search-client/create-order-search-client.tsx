"use client";

import { FC, useContext, useEffect, useState } from "react";
import { message, Spin } from "antd";
import Link from "next/link";
import { Plus } from "lucide-react";

import { OrderViewContext } from "../../contexts/orderViewContext";
import {
  RegistrationDialog,
  type RegistrationFormData
} from "@/modules/cetaphil/components/registration-dialog";
import { getAdresses, getClients, registerNewClient } from "@/services/commerce/commerce";
import { getDocumentTypeId } from "@/constants/documentTypes";
import {
  ICommerceAdresses,
  IEcommerceClient,
  IShippingInformation
} from "@/types/commerce/ICommerce";
import { useAppStore } from "@/lib/store/store";
import { useClientSummary } from "@/modules/commerce/hooks/create-order/useClientSummary";

import { ISelectedAddress } from "./types";
import ClienteDropdown from "./cliente-dropdown";
import CanalSelect from "./canal-select";
import DireccionDropdown from "./direccion-dropdown";
import SelectedClientCard from "./selected-client-card";
import CarteraCard from "./cartera-card";
import NewAddressModal from "./new-address-modal";

// Kept so create-order-select-client.tsx (which imports it) keeps compiling.
export interface ISelectClientForm {
  client: {
    value: string;
    label: string;
    email: string;
    payment_type: number;
  };
}

const CreateOrderSearchClient: FC = () => {
  const { setClient, setShippingInfo, setChannelCode, setBusinessUnit, setChannelName } =
    useContext(OrderViewContext);
  const { config, projectId } = useAppStore((state) => ({
    config: state.config,
    projectId: state.selectedProject?.ID
  }));

  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState<IEcommerceClient[]>([]);

  const [selectedClient, setSelectedClient] = useState<IEcommerceClient | null>(null);

  const { data: clientSummary, isLoading: summaryLoading } = useClientSummary(
    selectedClient?.client_id
  );

  const [canal, setCanal] = useState("");
  const [addresses, setAddresses] = useState<ICommerceAdresses[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ISelectedAddress | null>(null);

  // New-address AntD modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // New-client registration dialog
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch real clients
  useEffect(() => {
    if (!projectId) return;
    const fetchClients = async () => {
      setClientsLoading(true);
      try {
        const response = await getClients(projectId);
        setClientOptions(response?.data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClientOptions([]);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, [projectId]);

  // Fetch addresses for the selected channel (canal = client_bu.internal_code).
  useEffect(() => {
    if (!canal) {
      setAddresses([]);
      return;
    }
    let cancelled = false;
    const fetchAddresses = async () => {
      try {
        const resp = await getAdresses(canal);
        if (!cancelled) setAddresses(resp.otherAddresses ?? []);
      } catch (error) {
        console.error(error);
        if (!cancelled) setAddresses([]);
      }
    };
    fetchAddresses();
    return () => {
      cancelled = true;
    };
  }, [canal]);

  const handleSelectClient = (c: IEcommerceClient) => {
    setSelectedClient(c);
    const channelOptions = c.client_bu ?? [];
    // Auto-select the channel when the client has exactly one available.
    if (channelOptions.length === 1) {
      setCanal(channelOptions[0].internal_code);
      setBusinessUnit(channelOptions[0].bu_name);
    } else {
      setCanal("");
      setBusinessUnit("");
    }
    setSelectedAddress(null);
  };

  const handleSelectCanal = (value: string) => {
    setCanal(value);
    // Sincronizar business_unit con el bu_name del canal seleccionado
    const matched = selectedClient?.client_bu?.find((bu) => bu.internal_code === value);
    setBusinessUnit(matched?.bu_name ?? "");
    setSelectedAddress(null);
  };

  const handleSaveNewAddress = (city: string, dispatchAddress: string) => {
    setSelectedAddress({ city, dispatch_address: dispatchAddress });
    setAddressModalOpen(false);
  };

  const handleClickNewClient = () => setShowNewClientDialog(true);

  const handleSaveClient = async (data: RegistrationFormData) => {
    try {
      setIsRegistering(true);

      const documentTypeId = getDocumentTypeId(data.documentType);
      if (!documentTypeId) {
        message.error("Tipo de documento inválido");
        return;
      }

      const guestData = {
        email: data.email,
        name: data.fullName,
        documentType: documentTypeId,
        document: data.documentNumber,
        phoneNumber: data.phone
      };

      const responseNewClient = await registerNewClient(guestData);
      // Set as the locally selected client so canal/address can still be collected.
      handleSelectClient({
        client_id: responseNewClient.document,
        client_name: responseNewClient.name,
        client_email: responseNewClient.email,
        payment_type: 1,
        client_bu: []
      });

      message.success("Cliente registrado exitosamente");
      setShowNewClientDialog(false);
    } catch (error) {
      message.error("Error al registrar el cliente. Por favor intente nuevamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  const isValid = !!(selectedClient && canal && selectedAddress);

  const handleCrearOrden = () => {
    if (!isValid || !selectedClient || !selectedAddress) return;

    const shipping: IShippingInformation = {
      // Only include id when it's an existing (saved) address.
      ...(selectedAddress.id !== undefined ? { id: selectedAddress.id } : {}),
      address: selectedAddress.dispatch_address,
      city: selectedAddress.city,
      dispatch_address: selectedAddress.dispatch_address,
      email: selectedClient.client_email || selectedAddress.email || "",
      phone_number: "",
      comments: ""
    };

    const selectedBu = selectedClient.client_bu?.find((b) => b.internal_code === canal);
    setChannelCode(canal);
    setChannelName?.(selectedBu?.bu_name ?? "");
    setShippingInfo(shipping);
    setClient({
      name: selectedClient.client_name,
      id: selectedClient.client_id,
      email: selectedClient.client_email,
      payment_type: selectedClient.payment_type,
      nit_id: selectedBu?.internal_code || selectedClient.client_id
    });
  };

  return (
    <div className="h-full flex gap-4">
      {/* ── Izquierda: card "Nueva orden" ─────────────────────────────── */}
      <div className="flex flex-col w-full max-w-[340px] flex-shrink-0 bg-white rounded-xl border border-[#DDDDDD] overflow-hidden h-full">
        <div className="px-6 pt-6 pb-5 border-b border-[#EEEEEE] flex-shrink-0 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-[#141414] leading-tight">Nueva orden</h1>
            <p className="text-sm text-[#999999] mt-0.5">Completa los datos para comenzar</p>
          </div>
          {config.create_client_btn && (
            <button
              type="button"
              onClick={handleClickNewClient}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#141414] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:bg-[#F7F7F7] transition-colors flex-shrink-0"
            >
              <Plus size={12} />
              Nuevo cliente
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Cliente */}
          <div>
            <p className="text-sm font-medium text-[#141414] mb-2">Cliente</p>
            <ClienteDropdown
              options={clientOptions}
              loading={clientsLoading}
              selected={selectedClient}
              onSelect={handleSelectClient}
            />
          </div>

          {/* Canal */}
          <div>
            <p className="text-sm font-medium text-[#141414] mb-2">Canal</p>
            <CanalSelect
              value={canal}
              onChange={handleSelectCanal}
              options={selectedClient?.client_bu ?? []}
              disabled={!selectedClient || (selectedClient.client_bu?.length ?? 0) === 0}
            />
            {selectedClient && (selectedClient.client_bu?.length ?? 0) === 0 && (
              <p className="text-xs text-[#999999] mt-1.5">
                Este cliente no tiene canales disponibles
              </p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <p className="text-sm font-medium text-[#141414] mb-2">Dirección de despacho</p>
            <DireccionDropdown
              addresses={addresses}
              selected={selectedAddress}
              onSelect={setSelectedAddress}
              onCreateNew={() => setAddressModalOpen(true)}
              disabled={!canal}
            />
          </div>

          {selectedAddress?.warehouse && (
            <p className="text-sm text-[#999999] text-right">Bodega {selectedAddress.warehouse}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE] flex items-center gap-3 flex-shrink-0">
          <Link href="/comercio" className="flex-1">
            <button
              type="button"
              className="w-full py-2.5 text-sm font-medium text-[#141414] bg-white border border-[#DDDDDD] rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleCrearOrden}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-35 disabled:cursor-not-allowed bg-[#CBE71E] text-[#141414] hover:bg-[#b8d11a]"
          >
            Crear orden
          </button>
        </div>
      </div>

      {/* ── Derecha: cards (display) ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-y-auto">
        {!selectedClient ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[#999999]">Selecciona un cliente para ver su información</p>
          </div>
        ) : summaryLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <SelectedClientCard
              client={selectedClient}
              address={selectedAddress}
              nit={clientSummary?.client.nit || selectedClient.client_id || "-"}
            />
            <CarteraCard
              cartera={clientSummary?.cartera ?? { totalPortfolio: 0, pastDueAmount: 0 }}
              cupo={
                clientSummary?.cupo ?? {
                  totalQuota: 0,
                  availableQuota: 0,
                  percentageUsed: 0,
                  availablePercentage: 0
                }
              }
            />
          </>
        )}
      </div>

      <NewAddressModal
        open={addressModalOpen}
        onSave={handleSaveNewAddress}
        onCancel={() => setAddressModalOpen(false)}
      />

      <RegistrationDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSubmit={handleSaveClient}
        title="Registrar Nuevo Cliente"
        description="Complete los datos del cliente para crear la orden"
        submitButtonText="Guardar Cliente"
        showReferralEmail={false}
        isSubmitting={isRegistering}
      />
    </div>
  );
};

export default CreateOrderSearchClient;
