"use client";

import { useState } from "react";
import useSWR from "swr";
import { Alert, Button, Input, Modal, Popconfirm, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import Header from "@/components/organisms/header";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useAppStore } from "@/lib/store/store";
import {
  changePharma360UserRole,
  changePharma360UserStatus,
  createPharma360User,
  getPharma360Roles,
  getPharma360Users,
  revokePharma360UserOtp
} from "@/services/pharma360Users/pharma360Users";
import type { IPharma360User } from "@/types/pharma360Users/IPharma360Users";

const PAGE_SIZE = 20;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true };

const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

const formatDate = (iso: string | null) =>
  iso ? new Date(iso.endsWith("Z") ? iso : `${iso}Z`).toLocaleDateString("es-CO") : "Sin validar";

/**
 * Usuarios de Pharma 360 (/market-admin/logistica-inversa/usuarios): crear, cambiar rol,
 * activar o desactivar y reiniciar la validación por código. Solo funciona para
 * administradores de Pharma 360; para el resto Pharma 360 responde 403.
 */
export default function Pharma360Users() {
  const { showMessage } = useMessageApi();
  const { ID: projectId } = useAppStore((s) => s.selectedProject);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    projectId ? ["/integration/profit360/users", projectId, debouncedSearch, page] : null,
    async () => (await getPharma360Users(debouncedSearch, page, PAGE_SIZE)).data,
    SWR_OPTIONS
  );

  const { data: roles } = useSWR(
    projectId ? ["/integration/profit360/users/roles", projectId] : null,
    async () => (await getPharma360Roles()).data.items,
    { revalidateOnFocus: false }
  );

  const roleOptions = (roles ?? []).map((r) => ({ value: r.id, label: r.nombre }));

  const run = async (action: () => Promise<unknown>, okMessage: string, failMessage: string) => {
    try {
      await action();
      showMessage("success", okMessage);
      await mutate();
    } catch (err) {
      showMessage("error", errorText(err, failMessage));
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createPharma360User(newEmail.trim(), newRole);
      showMessage("success", "Usuario creado. Le enviamos un correo para definir su contraseña.");
      setCreating(false);
      setNewEmail("");
      setNewRole(undefined);
      await mutate();
    } catch (err) {
      showMessage("error", errorText(err, "No se pudo crear el usuario."));
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<IPharma360User> = [
    { title: "Correo", dataIndex: "email", key: "email" },
    {
      title: "Rol",
      key: "rol",
      width: 260,
      render: (_, user) => (
        <Select
          size="small"
          className="w-full"
          placeholder="Sin rol"
          value={user.rolId ?? undefined}
          options={roleOptions}
          onChange={(rolId) =>
            run(
              () => changePharma360UserRole(user.id, rolId),
              "Rol actualizado",
              "No se pudo cambiar el rol."
            )
          }
        />
      )
    },
    {
      title: "Estado",
      key: "estado",
      width: 110,
      render: (_, user) =>
        user.activo ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>
    },
    {
      title: "Última validación",
      key: "otp",
      width: 150,
      render: (_, user) => formatDate(user.ultimaValidacionOtp)
    },
    {
      title: "",
      key: "acciones",
      width: 260,
      render: (_, user) => (
        <div className="flex justify-end gap-2">
          <Popconfirm
            title="¿Pedir código en su próximo inicio de sesión?"
            okText="Sí"
            cancelText="No"
            onConfirm={() =>
              run(
                () => revokePharma360UserOtp(user.id),
                "Pedirá un código en su próximo inicio de sesión",
                "No se pudo reiniciar la validación."
              )
            }
          >
            <Button size="small">Reiniciar código</Button>
          </Popconfirm>
          <Popconfirm
            title={user.activo ? "¿Desactivar este usuario?" : "¿Activar este usuario?"}
            description={
              user.activo
                ? "No podrá iniciar sesión. Las sesiones abiertas siguen vigentes hasta que venzan."
                : undefined
            }
            okText="Sí"
            cancelText="No"
            onConfirm={() =>
              run(
                () => changePharma360UserStatus(user.id, !user.activo),
                user.activo ? "Usuario desactivado" : "Usuario activado",
                "No se pudo cambiar el estado."
              )
            }
          >
            <Button size="small" danger={user.activo}>
              {user.activo ? "Desactivar" : "Activar"}
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  const emailValid = EMAIL_REGEX.test(newEmail.trim());

  return (
    <div className="cp-page min-h-full">
      <Header title="Usuarios de Pharma 360" back="/market-admin/logistica-inversa" />

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudieron cargar los usuarios"
          description={errorText(error, "Intenta de nuevo")}
        />
      )}

      <section className="cp-card flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Input.Search
            allowClear
            placeholder="Buscar por correo"
            className="max-w-[360px]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Button type="primary" onClick={() => setCreating(true)}>
            Crear usuario
          </Button>
        </div>

        <Table<IPharma360User>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={data?.items ?? []}
          loading={isLoading || isValidating}
          locale={{ emptyText: "No hay usuarios que coincidan" }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: data?.total ?? 0,
            showSizeChanger: false,
            onChange: setPage
          }}
        />
      </section>

      <Modal
        open={creating}
        title="Crear usuario"
        okText="Crear"
        cancelText="Cancelar"
        confirmLoading={saving}
        okButtonProps={{ disabled: !emailValid || !newRole }}
        onOk={handleCreate}
        onCancel={() => !saving && setCreating(false)}
        destroyOnClose
      >
        <div className="flex flex-col gap-3 py-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-cp-ink" htmlFor="new-email">
              Correo electrónico
            </label>
            <Input
              id="new-email"
              type="email"
              placeholder="usuario@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              status={newEmail && !emailValid ? "error" : undefined}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-cp-ink">Rol</label>
            <Select
              className="w-full"
              placeholder="Selecciona un rol"
              value={newRole}
              options={roleOptions}
              onChange={setNewRole}
              showSearch
              optionFilterProp="label"
            />
          </div>
          <p className="m-0 text-[12px] text-cp-ink-3">
            La persona recibirá un correo para definir su contraseña y, en su primer ingreso, un
            código de verificación.
          </p>
        </div>
      </Modal>
    </div>
  );
}
