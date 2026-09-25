"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Select } from "antd";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useMarketAdminRoles } from "@/modules/marketAdmin/hooks/useMarketAdminRoles";

export type CrearUsuarioFormValues = {
  name: string;
  position: string;
  email: string;
  phone: string;
  role_id: number | null;
  role_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (values: CrearUsuarioFormValues) => void;
  isLoading?: boolean;
};

type RoleOption = { value: number; label: string };

const BLANK_USER: CrearUsuarioFormValues = {
  name: "",
  position: "",
  email: "",
  phone: "",
  role_id: null,
  role_name: ""
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors";
const labelClass = "text-xs font-bold text-[#141414] block mb-1.5";

export default function ModalCrearUsuario({ open, onClose, onSend, isLoading }: Props) {
  const [form, setForm] = useState<CrearUsuarioFormValues>(BLANK_USER);

  const { data: roles, isLoading: isLoadingRoles } = useMarketAdminRoles();

  const roleOptions: RoleOption[] = useMemo(
    () => roles.map((r) => ({ value: r.ID, label: r.ROL_NAME })),
    [roles]
  );

  // El form vive fuera del <Modal>, asi que destroyOnClose no lo limpia
  useEffect(() => {
    if (open) setForm(BLANK_USER);
  }, [open]);

  const isValid =
    form.name.trim() !== "" && EMAIL_REGEX.test(form.email.trim()) && form.role_id !== null;

  const handleOk = () => {
    if (!isValid) return;
    onSend({
      ...form,
      name: form.name.trim(),
      position: form.position.trim(),
      email: form.email.trim(),
      phone: form.phone.trim()
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
      title={<span className="text-base font-bold text-[#141414]">Crear usuario</span>}
    >
      <div className="py-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre del contacto</label>
            <input
              className={inputClass}
              placeholder="Nombre del contacto"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className={labelClass}>Cargo</label>
            <input
              className={inputClass}
              placeholder="Cargo"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              className={inputClass}
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Rol</label>
          <Select
            showSearch
            size="large"
            placeholder="Selecciona el rol"
            className="w-full [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD] [&_.ant-select-selector]:!text-sm"
            popupClassName="[&_.ant-select-item]:!text-sm"
            value={form.role_id ?? undefined}
            options={roleOptions}
            loading={isLoadingRoles}
            onChange={(value: number, option) =>
              setForm((f) => ({ ...f, role_id: value, role_name: (option as RoleOption).label }))
            }
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <FooterButtons
          titleConfirm="Crear usuario"
          isConfirmDisabled={!isValid}
          isConfirmLoading={isLoading}
          onClose={onClose}
          handleOk={handleOk}
        />
      </div>
    </Modal>
  );
}
