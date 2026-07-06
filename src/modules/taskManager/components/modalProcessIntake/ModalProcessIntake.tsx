import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Modal, Select as AntSelect, Typography } from "antd";
import { Calendar } from "lucide-react";
import { FileArrowUp } from "@phosphor-icons/react";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { ModalUploadIntakeFiles } from "@/components/molecules/modals/ModalUploadIntakeFiles/ModalUploadIntakeFiles";
import { getAllCountries } from "@/services/countries/countries";
import { useDataClients } from "@/modules/dataQuality/hooks/useDataClients";
import { useArchivesClientData } from "@/modules/dataQuality/hooks/useArchivesClientData";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { Datum as ICountryOption } from "@/types/countries/IListCountries";

const { Title } = Typography;

const formatDate = (isoDateString: string): string => {
  return dayjs(isoDateString).format("YYYY-MM-DD");
};

interface IIntakeFilesTableProps {
  clientId: string;
}

const IntakeFilesTable = ({ clientId }: IIntakeFilesTableProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);

  const { archives: files, mutate } = useArchivesClientData(clientId);

  const handleUploadIntake = (id: number) => {
    setActiveFileId(id);
    setIsUploadModalOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha archivo</TableHead>
            <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files?.map((file) => (
            <TableRow key={file.id} className="hover:bg-gray-50" style={{ borderColor: "#DDDDDD" }}>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="text-xs text-white"
                  style={{ backgroundColor: file.data_type.color }}
                >
                  {file.data_type.description}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                  <span style={{ color: "#141414" }}>
                    {file.date_archive ? formatDate(file.date_archive) : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="w-0">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUploadIntake(file.id)}
                    className="bg-[#f7f7f7] border-[#DDDDDD] hover:bg-[#f7f7f7] hover:border-black p-1 !p-0 size-7"
                  >
                    <FileArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ModalUploadIntakeFiles
        isOpen={isUploadModalOpen}
        archiveId={activeFileId}
        onClose={() => {
          setIsUploadModalOpen(false);
          setActiveFileId(null);
        }}
        onSuccess={() => {
          mutate();
        }}
      />
    </>
  );
};

interface IModalProcessIntakeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalProcessIntake = ({ isOpen, onClose }: IModalProcessIntakeProps) => {
  const [view, setView] = useState<"client" | "files">("client");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [countries, setCountries] = useState<ICountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const { clients, isLoading: clientsLoading } = useDataClients(selectedCountryId);

  useEffect(() => {
    if (!isOpen || countries.length > 0) return;
    let cancelled = false;
    setCountriesLoading(true);
    getAllCountries()
      .then((res) => {
        if (!cancelled && Array.isArray(res)) setCountries(res);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCountriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, countries.length]);

  const handleClose = () => {
    setView("client");
    setSelectedCountryId(null);
    setSelectedClientId(null);
    onClose();
  };

  const handleCountryChange = (value: number) => {
    setSelectedCountryId(value);
    setSelectedClientId(null);
  };

  const filterByLabel = (input: string, option?: { label?: unknown }) =>
    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>Procesar ingesta</Title>}
      width={700}
      footer={
        view === "client" ? (
          <FooterButtons
            titleConfirm="Confirmar cliente"
            titleCancel="Cancelar"
            onClose={handleClose}
            handleOk={() => setView("files")}
            isConfirmDisabled={!selectedClientId}
          />
        ) : null
      }
      destroyOnClose
    >
      {view === "client" ? (
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700">País</label>
            <AntSelect
              showSearch
              value={selectedCountryId ?? undefined}
              onChange={handleCountryChange}
              options={countries.map((c) => ({ value: c.id, label: c.country_name }))}
              loading={countriesLoading}
              placeholder={countriesLoading ? "Cargando países..." : "Seleccionar país"}
              notFoundContent="No hay países disponibles"
              filterOption={filterByLabel}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Cliente</label>
            <AntSelect
              showSearch
              disabled={selectedCountryId === null}
              value={selectedClientId ?? undefined}
              onChange={(value) => setSelectedClientId(value)}
              options={(clients ?? []).map((c) => ({ value: c.id, label: c.client_name }))}
              loading={clientsLoading}
              placeholder={clientsLoading ? "Cargando clientes..." : "Seleccionar cliente"}
              notFoundContent="No hay clientes disponibles"
              filterOption={filterByLabel}
              className="mt-1 w-full"
            />
          </div>
        </div>
      ) : (
        selectedClientId && <IntakeFilesTable clientId={selectedClientId} />
      )}
    </Modal>
  );
};
