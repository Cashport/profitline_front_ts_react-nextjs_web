"use client";

import { ReactNode } from "react";
import { Modal, Button as AntButton, Dropdown, Spin } from "antd";
import { History, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { useCatalogMaterialEquivalences } from "../../hooks/useCatalogMaterialEquivalences";

interface ModalMaterialEquivalencesProps {
  isOpen: boolean;
  onClose: () => void;
  catalogMaterialId?: number;
  clientCode?: string;
  clientName?: string;
}

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  return iso.slice(0, 10);
};

export function ModalMaterialEquivalences({
  isOpen,
  onClose,
  catalogMaterialId,
  clientCode,
  clientName
}: ModalMaterialEquivalencesProps) {
  const { data: equivalences, isLoading } = useCatalogMaterialEquivalences(catalogMaterialId);

  const customDropdown = (menu: ReactNode) => <div>{menu}</div>;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={820}
      centered
      styles={{ body: { padding: 0, backgroundColor: "#FFFFFF" } }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b" style={{ borderColor: "#EEEEEE" }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(203,231,30,0.15)" }}
        >
          <History className="w-4 h-4" style={{ color: "#8BAF00" }} />
        </div>
        <h2 className="text-base font-semibold flex-1" style={{ color: "#141414" }}>
          Historial de equivalencias
        </h2>
      </div>

      {/* Subtitle */}
      <div className=" pt-4 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#F3F3F3", color: "#888" }}
          >
            Cod. cliente
          </span>
          <span className="text-sm font-medium" style={{ color: "#333" }}>
            {clientCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#F3F3F3", color: "#888" }}
          >
            Producto cliente
          </span>
          <span className="text-sm" style={{ color: "#555" }}>
            {clientName}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className=" pb-1">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              <th
                className="text-left py-2.5 font-semibold text-sm"
                style={{ color: "#141414", minWidth: "320px" }}
              >
                Nombre producto
              </th>
              <th
                className="text-left py-2.5 font-semibold text-sm"
                style={{ color: "#141414", width: "160px" }}
              >
                SKU
              </th>
              <th
                className="text-left py-2.5 font-semibold text-sm"
                style={{ color: "#141414", width: "60px" }}
              >
                Factor
              </th>
              <th
                className="text-left py-2.5 font-semibold text-sm"
                style={{ color: "#141414", width: "100px" }}
              >
                Desde
              </th>
              <th
                className="text-left py-2.5 font-semibold text-sm"
                style={{ color: "#141414", width: "100px" }}
              >
                Hasta
              </th>
              <th style={{ width: "48px" }} />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Spin />
                </td>
              </tr>
            )}
            {!isLoading && equivalences.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm" style={{ color: "#888" }}>
                  No hay periodos registrados.
                </td>
              </tr>
            )}
            {!isLoading &&
              equivalences.map((equivalence) => {
                const isActive = equivalence.is_active === 1;
                const rowColor = isActive ? "#1a6600" : "#BBBBBB";
                const rowBg = isActive ? "rgba(203,231,30,0.10)" : "transparent";
                return (
                  <tr
                    key={equivalence.id}
                    style={{ borderBottom: "1px solid #F3F3F3", backgroundColor: rowBg }}
                  >
                    <td className="py-3 pr-4 rounded-l">
                      <span className="font-medium" style={{ color: rowColor }}>
                        {equivalence.internal_name}
                      </span>
                    </td>
                    <td className="py-3 pr-4" style={{ color: rowColor }}>
                      {equivalence.internal_sku}
                    </td>
                    <td className="py-3" style={{ color: rowColor }}>
                      {equivalence.conversion_factor}
                    </td>
                    <td className="py-3" style={{ color: rowColor }}>
                      {formatDate(equivalence.valid_from) || "–"}
                    </td>
                    <td className="py-3">
                      {isActive ? (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#CBE71E", color: "#141414" }}
                        >
                          Vigente
                        </span>
                      ) : equivalence.valid_to ? (
                        <span style={{ color: rowColor }}>{formatDate(equivalence.valid_to)}</span>
                      ) : (
                        <span style={{ color: rowColor }}>–</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Dropdown
                        dropdownRender={customDropdown}
                        placement="bottomRight"
                        trigger={["click"]}
                        menu={{
                          items: [
                            {
                              key: "edit",
                              label: (
                                <AntButton
                                  className="buttonNoBorder"
                                  icon={<Edit className="w-3.5 h-3.5" />}
                                  onClick={() => {}}
                                >
                                  Editar
                                </AntButton>
                              )
                            },
                            {
                              key: "delete",
                              label: (
                                <AntButton
                                  className="buttonNoBorder"
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                  onClick={() => {}}
                                >
                                  Eliminar
                                </AntButton>
                              )
                            }
                          ]
                        }}
                      >
                        <button
                          className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                          style={{ color: "#888" }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Add link */}
      <div className=" pt-2 pb-4">
        <button
          className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: "#141414" }}
        >
          <Plus className="w-3.5 h-3.5" /> Agregar equivalencia
        </button>
      </div>

      {/* Footer */}
      <div
        className="pt-3 border-t flex items-center justify-end"
        style={{ borderColor: "#EEEEEE" }}
      >
        <AntButton
          onClick={onClose}
          className="text-sm font-medium"
          style={{
            height: 32,
            padding: "0 16px",
            borderRadius: 6,
            border: "1px solid #E5E7EB",
            color: "#141414",
            backgroundColor: "#FFFFFF"
          }}
        >
          Cerrar
        </AntButton>
      </div>
    </Modal>
  );
}

export default ModalMaterialEquivalences;
