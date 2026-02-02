import {
  Calendar,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
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

export interface FileData {
  id: string;
  name: string;
  type: string;
  size: string;
  lastUpdate: string;
  status: string;
  category: string;
}

interface ClientDetailTableProps {
  files: FileData[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "pending-catalog":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    default:
      return <Eye className="w-4 h-4" style={{ color: "#141414" }} />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processed":
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Procesado
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Pendiente
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          Data con error
        </Badge>
      );
    case "pending-catalog":
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Pendiente catálogo
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Desconocido
        </Badge>
      );
  }
};

const getCategoryBadge = (category: string) => {
  const colors = {
    Stock: "bg-blue-100 text-blue-800",
    Sales: "bg-purple-100 text-purple-800",
    "In transit": "bg-orange-100 text-orange-800"
  };

  return (
    <Badge
      variant="secondary"
      className={`text-xs ${colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
    >
      {category}
    </Badge>
  );
};

export function ClientDetailTable({ files }: ClientDetailTableProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6" style={{ color: "#141414" }}>
        Archivos
      </h2>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tipo de archivo</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha y hora</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tamaño</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Estado</TableHead>
            <TableHead style={{ color: "#141414", fontWeight: 600 }}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-gray-50" style={{ borderColor: "#DDDDDD" }}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <span className="font-normal" style={{ color: "#141414" }}>
                    {file.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getCategoryBadge(file.category)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                  <span style={{ color: "#141414" }}>{file.lastUpdate}</span>
                </div>
              </TableCell>
              <TableCell>
                <span style={{ color: "#141414" }}>{file.size}</span>
              </TableCell>
              <TableCell>{getStatusBadge(file.status)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" title="Ver archivo">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Descargar">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
