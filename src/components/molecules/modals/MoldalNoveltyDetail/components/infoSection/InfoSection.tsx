import React from "react";
import { User, Calendar, ShoppingBag, Users, Check, Info } from "phosphor-react";
import { Tag } from "antd";
import "./infosection.scss";
import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";
import { formatDatePlane } from "@/utils/utils";

interface InfoSectionProps {
  responsable: string;
  fecha: string;
  cliente: string;
  clienteId?: string;
  projectId?: string | number;
  aprobadores: Array<{ nombre: string; estado: "pendiente" | "aprobado" }>;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  responsable,
  fecha,
  cliente,
  clienteId,
  projectId,
  aprobadores
}) => {
  return (
    <div className="info-section">
      <div className="info-row">
        <IconLabel icon={<User size={20} />} text={`Responsable: `} />
        <p>{responsable}</p>
      </div>
      <div className="info-row">
        <IconLabel icon={<Calendar size={20} />} text={`Fecha: `} />
        <p>{formatDatePlane(fecha)}</p>
      </div>
      <div className="info-row">
        <IconLabel icon={<ShoppingBag size={20} />} text={`Cliente: `} />
        {clienteId && projectId !== undefined ? (
          <a
            className="client-link"
            href={`/clientes/detail/${clienteId}/project/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cliente}
          </a>
        ) : (
          <p>{cliente}</p>
        )}
      </div>
      <div className="info-row">
        <IconLabel icon={<Users size={20} />} text="Aprobadores:" />
        <div className="approved">
          <div className="approved-tags">
            {aprobadores.map((aprobador, index) => (
              <Tag key={index} icon={aprobador.estado === "aprobado" ? <Check /> : <Info />}>
                {aprobador.nombre}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
