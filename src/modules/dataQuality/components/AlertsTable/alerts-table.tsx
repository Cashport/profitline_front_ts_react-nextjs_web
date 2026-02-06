"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Pagination, Spin } from "antd";

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
import { IAlert } from "@/types/dataQuality/IDataQuality";

interface AlertsTableProps {
  alerts: IAlert[];
  isLoading: boolean;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

export function AlertsTable({ alerts, isLoading, pagination, onPageChange }: AlertsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#DDDDDD" }}>
            <TableHead style={{ color: "#141414" }}>Cliente</TableHead>
            <TableHead style={{ color: "#141414" }}>País</TableHead>
            <TableHead style={{ color: "#141414" }}>Novedad</TableHead>
            <TableHead style={{ color: "#141414" }}>Tipo</TableHead>
            <TableHead style={{ color: "#141414" }}>Fecha novedad</TableHead>
            <TableHead style={{ color: "#141414" }}>Prioridad</TableHead>
            <TableHead style={{ color: "#141414" }}>Estado</TableHead>
            <TableHead style={{ color: "#141414" }}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow
              key={alert.id}
              className="hover:bg-gray-50"
              style={{ borderColor: "#DDDDDD" }}
            >
              <TableCell>
                <span className="font-medium" style={{ color: "#141414" }}>
                  {alert.client_name}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {alert.country_name}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm truncate max-w-xs block" style={{ color: "#141414" }}>
                  {alert.error_message}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {alert.error_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm" style={{ color: "#141414" }}>
                  {alert.created_at}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {alert.error_level}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: alert.status_color }}
                  />
                  <span className="text-sm">{alert.status_description}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link href={`/data-quality/clients/${alert.id_client}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      title="Ir al catálogo del cliente"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Catálogo
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 p-4 border-t flex items-center justify-between">
        <Pagination
          current={pagination.current}
          onChange={onPageChange}
          total={pagination.total}
          pageSize={pagination.pageSize}
          showSizeChanger={false}
        />
        <span className="text-sm" style={{ color: "#141414" }}>
          Mostrando {alerts.length} de {pagination.total} alertas
        </span>
      </div>
    </>
  );
}
