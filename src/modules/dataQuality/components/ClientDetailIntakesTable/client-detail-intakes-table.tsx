import { useState } from "react";
import { Eye, Plus } from "lucide-react";
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
import { ModalDataIntake } from "../modal-data-intake";
import { IModalMode } from "../modal-data-intake/modal-data-intake";

export interface Ingesta {
  id: string | number;
  fileType: string;
  periodicity: string;
  periodicityDetail: string;
  source: string;
}

interface ClientDetailIntakesTableProps {
  ingestas?: Ingesta[];
  onViewIngesta?: (ingesta: Ingesta) => void;
  clientName?: string | null;
  clientId?: string | null;
  idCountry?: number | null;
}

export function ClientDetailIntakesTable({
  ingestas = [],
  onViewIngesta,
  clientName,
  clientId,
  idCountry
}: ClientDetailIntakesTableProps) {
  const [isModalOpen, setIsModalOpen] = useState({
    isOpen: false,
    mode: "create" as IModalMode
  });

  const handleOpenIntakeModal = (mode: IModalMode) => {
    // Open the modal to create a new intake
    setIsModalOpen({ isOpen: true, mode });
  };
  return (
    <>
      <h2 className="text-lg font-semibold mb-4" style={{ color: "#141414" }}>
        Detalle de ingestas
      </h2>

      <Table className="mb-4">
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipos de Archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Periodicidad</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>
              Detalle de Periodicidad
            </TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fuente de Ingesta</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Ver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingestas.length > 0 ? (
            ingestas.map((ingesta) => (
              <TableRow
                key={ingesta.id}
                className="hover:bg-gray-50"
                style={{ borderColor: "#DDDDDD" }}
              >
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ingesta.fileType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: "#CBE71E", color: "#141414" }}
                  >
                    {ingesta.periodicity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ingesta.periodicityDetail}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm" style={{ color: "#141414" }}>
                    {ingesta.source}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Ver detalles"
                    onClick={() => onViewIngesta?.(ingesta)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No hay ingestas configuradas. Crea una nueva ingesta para comenzar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button
        onClick={() => handleOpenIntakeModal("create")}
        variant="outline"
        className="mb-8 bg-transparent"
        style={{ borderColor: "#DDDDDD", color: "#141414" }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear nueva ingesta
      </Button>

      <ModalDataIntake
        clientId={clientId || ""}
        clientName={clientName || ""}
        idCountry={idCountry || 0}
        open={isModalOpen.isOpen}
        mode={isModalOpen.mode}
        onOpenChange={() => setIsModalOpen({ isOpen: false, mode: "create" })}
      />
    </>
  );
}
