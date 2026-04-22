"use client";
import { useEffect, useState } from "react";
import { message, Modal, Select, Spin } from "antd";
import { UserPlus } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { useAppStore } from "@/lib/store/store";
import { getClientsByProject } from "@/services/banksPayments/banksPayments";
import { addClientToCircularization } from "@/services/communications/communications";

interface ModalAddClientProps {
  isOpen: boolean;
  onClose: () => void;
  communicationId: string;
  onSuccess?: () => void;
}

interface ClientOption {
  value: string;
  label: string;
}

export default function ModalAddClient({
  isOpen,
  onClose,
  communicationId,
  onSuccess
}: ModalAddClientProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const [options, setOptions] = useState<ClientOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchClients = async () => {
      setLoadingOptions(true);
      try {
        const response = await getClientsByProject(projectId);
        const mapped = response.map((client) => {
          const key = Object.keys(client)[0];
          const value = client[key];
          return { value: value.toString(), label: key };
        });
        setOptions(mapped);
      } catch (error) {
        console.error("Error fetching clients by project", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchClients();
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedClientId(undefined);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedClientId) return;
    setIsSubmitting(true);
    try {
      await addClientToCircularization(Number(communicationId), [selectedClientId]);
      message.success("Cliente agregado a la circularización");
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al agregar el cliente";
      message.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterOption = (input: string, option?: ClientOption) =>
    option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#CBE71E]/20 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-[#141414]" />
          </div>
          Agregar cliente
        </div>
      }
    >
      <div className="mt-2 mb-6">
        <Select
          showSearch
          allowClear
          placeholder="Buscar y seleccionar cliente"
          style={{ width: "100%" }}
          options={options}
          value={selectedClientId}
          onChange={(value) => setSelectedClientId(value)}
          loading={loadingOptions}
          filterOption={filterOption}
          size="large"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="border-[#DDDDDD] h-9"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedClientId || isSubmitting}
          className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold h-9"
        >
          {isSubmitting && <Spin size="small" className="mr-2" />}
          Añadir
        </Button>
      </div>
    </Modal>
  );
}
