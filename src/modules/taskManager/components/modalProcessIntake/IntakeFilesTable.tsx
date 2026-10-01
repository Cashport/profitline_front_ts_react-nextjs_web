import { useState } from "react";
import dayjs from "dayjs";
import { Select as AntSelect, Spin } from "antd";
import { Calendar } from "lucide-react";
import { FileArrowUp } from "@phosphor-icons/react";

import { ModalUploadIntakeFiles } from "@/components/molecules/modals/ModalUploadIntakeFiles/ModalUploadIntakeFiles";
import { useArchivesClientData } from "@/modules/dataQuality/hooks/useArchivesClientData";
import { useFileTypes } from "@/modules/dataQuality/hooks/useFileTypes";

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

const formatDate = (isoDateString: string): string => {
  return dayjs(isoDateString).format("YYYY-MM-DD");
};

interface IIntakeFilesTableProps {
  clientId: string;
}

export const IntakeFilesTable = ({ clientId }: IIntakeFilesTableProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<number | null>(null);

  const { data: fileTypes, isLoading: fileTypesLoading } = useFileTypes();
  const {
    archives: files,
    isLoading,
    mutate
  } = useArchivesClientData(clientId, undefined, undefined, selectedFileType);

  const handleUploadIntake = (id: number) => {
    setActiveFileId(id);
    setIsUploadModalOpen(true);
  };

  return (
    <>
      <div className="mb-3">
        <AntSelect
          allowClear
          value={selectedFileType ?? undefined}
          onChange={(value) => setSelectedFileType(value ?? null)}
          options={(fileTypes ?? []).map((t) => ({ value: t.id, label: t.description }))}
          loading={fileTypesLoading}
          placeholder="Selecionar Tipo archivo"
          className="w-full [&_.ant-select-selector]:!h-[38px]"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin />
        </div>
      ) : !files || files.length === 0 ? (
        <div className="flex justify-center items-center py-12 text-gray-500">
          No hay archivos disponibles para este cliente
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow style={{ borderColor: "#DDDDDD" }}>
                <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
                <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha archivo</TableHead>
                <TableHead className="w-0" style={{ color: "#141414", fontWeight: 600 }}>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow
                  key={file.id}
                  className="hover:bg-gray-50"
                  style={{ borderColor: "#DDDDDD" }}
                >
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
        </div>
      )}
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
