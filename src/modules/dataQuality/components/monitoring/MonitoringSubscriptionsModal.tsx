"use client";

import { useMemo, useState } from "react";
import { Modal, Select, Switch, message } from "antd";
import { Button } from "@/modules/chat/ui/button";
import {
  IMonitoringSubscription,
  IMonitoringSubscriptionInput,
  IMonitoringSubscriptionsData,
  MonitoringTestResult
} from "../../types/monitoring";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: IMonitoringSubscriptionsData;
  loading?: boolean;
  countries: Array<{ value: number; label: string }>;
  defaultCountryId?: number;
  onSave: (input: IMonitoringSubscriptionInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onTest: (id: number) => Promise<MonitoringTestResult>;
}

const describeTest = (result: MonitoringTestResult) =>
  (["email", "teams"] as const)
    .filter((c) => result[c] !== null)
    .map(
      (c) =>
        `${c === "email" ? "Correo" : "Teams"}: ${result[c] === "sent" ? "enviado" : result[c]}`
    )
    .join(" · ");

export function MonitoringSubscriptionsModal({
  open,
  onClose,
  data,
  loading,
  countries,
  defaultCountryId,
  onSave,
  onDelete,
  onTest
}: Props) {
  const [userId, setUserId] = useState<number>();
  const [countryId, setCountryId] = useState<number | undefined>(defaultCountryId);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendTeams, setSendTeams] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const teamsEnabled = !!data?.teams_enabled;
  const subscriptions = data?.subscriptions ?? [];
  const userOptions = useMemo(
    () =>
      (data?.users ?? []).map((u) => ({
        value: u.id,
        label: `${u.name} · ${u.email}`
      })),
    [data?.users]
  );

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } catch (error: any) {
      message.error(error?.message || "No se pudo completar la acción");
    } finally {
      setBusy(null);
    }
  };

  const add = () =>
    run("add", async () => {
      if (!userId || !countryId) {
        message.warning("Elige el usuario y el país");
        return;
      }
      await onSave({
        user_id: userId,
        country_id: countryId,
        send_email: sendEmail,
        send_teams: sendTeams
      });
      message.success("Suscripción guardada");
      setUserId(undefined);
    });

  const toggle = (s: IMonitoringSubscription, patch: Partial<IMonitoringSubscriptionInput>) =>
    run(`edit-${s.id}`, async () => {
      const next = {
        user_id: s.user_id,
        country_id: s.country_id,
        send_email: s.send_email,
        send_teams: s.send_teams,
        is_active: s.is_active,
        ...patch
      };
      if (!next.send_email && !next.send_teams) {
        message.warning("Deja al menos un canal activo");
        return;
      }
      await onSave(next);
    });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ maxWidth: "100%" }}
      title={
        <div>
          <div className="text-[18px] font-semibold text-cp-ink">Notificaciones diarias</div>
          <div className="text-[14px] font-normal text-cp-ink-3">
            Cada mañana enviamos la foto del país por correo o Teams al correo del usuario en
            Cashport.
          </div>
        </div>
      }
    >
      <div className="rounded-[12px] bg-cp-bg p-[14px]">
        <div className="mb-[10px] text-[15px] font-semibold text-cp-ink">Agregar destinatario</div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Usuario de Cashport"
            className="min-w-[280px] flex-1"
            value={userId}
            options={userOptions}
            loading={loading}
            onChange={setUserId}
          />
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="País"
            className="w-[200px]"
            value={countryId}
            options={countries}
            onChange={setCountryId}
          />
          <label className="flex items-center gap-[6px] text-[15px] text-cp-ink-2">
            <Switch size="small" checked={sendEmail} onChange={setSendEmail} /> Correo
          </label>
          <label
            className="flex items-center gap-[6px] text-[15px] text-cp-ink-2"
            title={teamsEnabled ? undefined : "Teams aún no está configurado en el servidor"}
          >
            <Switch
              size="small"
              checked={sendTeams}
              disabled={!teamsEnabled}
              onChange={setSendTeams}
            />{" "}
            Teams
          </label>
          <Button
            onClick={add}
            disabled={busy === "add"}
            className="h-[36px] border-none bg-cp-lime px-[16px] text-[14px] font-semibold text-cp-ink hover:bg-cp-lime-dark"
          >
            Agregar
          </Button>
        </div>
        {!teamsEnabled && (
          <p className="mt-[8px] text-[14px] text-cp-ink-3">
            Teams se activa cuando el administrador configure el flujo de la cuenta general.
          </p>
        )}
      </div>

      <div className="mt-[14px] max-h-[50vh] overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed text-[16px]">
          <thead className="sticky top-0 z-[1] bg-cp-surface">
            <tr className="border-b border-cp-line text-left text-[15px] text-cp-ink">
              <th className="py-[10px] font-semibold">Usuario</th>
              <th className="hidden w-[150px] py-[10px] font-semibold md:table-cell">País</th>
              <th className="w-[64px] py-[10px] text-center font-semibold md:w-[80px]">Correo</th>
              <th className="w-[64px] py-[10px] text-center font-semibold md:w-[80px]">Teams</th>
              <th className="w-[64px] py-[10px] text-center font-semibold md:w-[80px]">Activa</th>
              <th className="w-[110px] py-[10px] text-right font-semibold md:w-[190px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="h-[64px] border-b border-cp-line">
                <td className="truncate pr-2">
                  <div className="truncate text-cp-ink">{s.user_name ?? s.email}</div>
                  <div className="truncate text-[14px] text-cp-ink-3">{s.email}</div>
                  <div className="truncate text-[14px] text-cp-ink-3 md:hidden">
                    {s.country_name ?? s.country_id}
                  </div>
                </td>
                <td className="hidden truncate text-cp-ink-2 md:table-cell">
                  {s.country_name ?? s.country_id}
                </td>
                <td className="text-center">
                  <Switch
                    size="small"
                    checked={s.send_email}
                    disabled={busy === `edit-${s.id}`}
                    onChange={(v) => toggle(s, { send_email: v })}
                  />
                </td>
                <td className="text-center">
                  <Switch
                    size="small"
                    checked={s.send_teams}
                    disabled={busy === `edit-${s.id}` || (!teamsEnabled && !s.send_teams)}
                    onChange={(v) => toggle(s, { send_teams: v })}
                  />
                </td>
                <td className="text-center">
                  <Switch
                    size="small"
                    checked={s.is_active}
                    disabled={busy === `edit-${s.id}`}
                    onChange={(v) => toggle(s, { is_active: v })}
                  />
                </td>
                <td className="text-right">
                  <div className="flex flex-col items-end gap-[4px] md:flex-row md:justify-end md:gap-[14px]">
                    <button
                      type="button"
                      className="text-[14px] text-cp-blue hover:underline disabled:text-cp-ink-4"
                      disabled={busy === `test-${s.id}`}
                      onClick={() =>
                        run(`test-${s.id}`, async () => {
                          const result = await onTest(s.id);
                          message.info(describeTest(result) || "Sin canales activos");
                        })
                      }
                    >
                      {busy === `test-${s.id}` ? "Enviando…" : "Enviar prueba"}
                    </button>
                    <button
                      type="button"
                      className="text-[14px] text-cp-magenta hover:underline"
                      onClick={() =>
                        Modal.confirm({
                          title: "¿Quitar destinatario?",
                          content: `${s.user_name ?? s.email} dejará de recibir la foto de ${s.country_name ?? "este país"}.`,
                          okText: "Quitar",
                          cancelText: "Cancelar",
                          okButtonProps: { danger: true },
                          onOk: () => run(`del-${s.id}`, () => onDelete(s.id))
                        })
                      }
                    >
                      Quitar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && subscriptions.length === 0 && (
          <p className="py-[28px] text-center text-[15px] text-cp-ink-3">
            Aún no hay destinatarios. Agrega el primero arriba.
          </p>
        )}
      </div>
    </Modal>
  );
}
