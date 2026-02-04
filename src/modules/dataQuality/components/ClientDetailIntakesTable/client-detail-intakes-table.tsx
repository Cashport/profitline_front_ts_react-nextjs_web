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
import { IClientDetailDataArchive } from "@/types/dataQuality/IDataQuality";

interface ClientDetailIntakesTableProps {
  intakes?: IClientDetailDataArchive[];
  clientName?: string | null;
  clientId?: string | null;
  idCountry?: number | null;
}

export function ClientDetailIntakesTable({
  intakes = [],
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
        <TableBody className="max-h-[400px] overflow-y-auto">
          {intakes.length > 0 ? (
            intakes.map((intake) => (
              <TableRow
                key={intake.id}
                className="hover:bg-gray-50"
                style={{ borderColor: "#DDDDDD" }}
              >
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {intake.tipo_archivo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: "#CBE71E", color: "#141414" }}
                  >
                    {intake.periodicity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-xs">"Se produce Semanal 4 veces iniciando el 04/02/2026"</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm" style={{ color: "#141414" }}>
                    -
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Ver detalles"
                    onClick={() => console.log(intake)}
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
