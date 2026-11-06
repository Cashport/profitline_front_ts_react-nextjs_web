"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ChevronRight, Inbox, LayoutDashboard, Settings2, Ticket } from "lucide-react";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { getSupportFormConfig, getSupportTickets } from "@/services/support/support";
import NewRequestForm from "../../components/new-request-form/new-request-form";
import SupportSkeleton from "../../components/support-skeleton/support-skeleton";
import SupportTicketModal from "../../components/support-ticket-modal/support-ticket-modal";
import { StatusDot } from "../../components/support-tags/support-tags";
import { useProjectId, useCanConfigureSupport } from "../../hooks/use-support-access";
import { formatDate, slaBadge } from "../../utils/support-format";

const NavButton = ({
  href,
  icon,
  label,
  count
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) => (
  <Link
    href={href}
    className="flex h-[var(--control-h)] items-center gap-2 whitespace-nowrap rounded-lg bg-cp-surface px-3.5 text-[13px] font-medium !text-cp-ink hover:!text-cp-ink hover:!no-underline hover:bg-cp-muted"
  >
    {icon}
    {label}
    {count ? (
      <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-cp-lime px-1.5 text-[13px] font-semibold text-[#141414]">
        {count}
      </span>
    ) : null}
  </Link>
);

/**
 * /support: al entrar, el formulario centrado. Arriba, accesos a Mis tickets (y a la bandeja,
 * el Support Desk y la configuración para quien los tenga); abajo, un resumen de lo último.
 */
export default function SupportView() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = useProjectId();
  const canConfigure = useCanConfigureSupport();
  const openId = Number(params.get("ticket")) || null;

  const form = useSWR(projectId ? ["support-form", projectId] : null, getSupportFormConfig, {
    revalidateOnFocus: false
  });
  const mine = useSWR(projectId ? ["support-mine-recent", projectId] : null, () =>
    getSupportTickets({ scope: "mine", include_closed: true, limit: 5 })
  );
  const openMine = useSWR(projectId ? ["support-mine-open", projectId] : null, () =>
    getSupportTickets({ scope: "mine", limit: 1 })
  );

  const openTicket = (id: number | null) =>
    router.replace(id ? `/support?ticket=${id}` : "/support", { scroll: false });

  const f = form.data;

  return (
    <ViewWrapper
      headerTitle="Soporte"
      headerActions={
        <div className="cp-on-page flex items-center gap-2">
          <NavButton
            href="/support/mine"
            icon={<Ticket className="h-4 w-4" />}
            label="Mis tickets"
            count={openMine.data?.total}
          />
          {f?.can_attend && (
            <NavButton href="/support/queue" icon={<Inbox className="h-4 w-4" />} label="Bandeja de soporte" />
          )}
          {f?.can_use_desk && (
            <NavButton
              href="/support-desk"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Support Desk"
            />
          )}
          {canConfigure && (
            <NavButton href="/support/config" icon={<Settings2 className="h-4 w-4" />} label="Configurar" />
          )}
        </div>
      }
    >
      <div className="cp-page min-w-0 pb-6">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-[var(--section-gap)]">
          <section className="cp-card px-7 py-6">
            {!f ? (
              form.error ? (
                <p className="text-[13px] text-cp-magenta">
                  {(form.error as Error).message || "No se pudo cargar el formulario."}
                </p>
              ) : (
                <SupportSkeleton rows={5} />
              )
            ) : f.enabled ? (
              <NewRequestForm
                config={f}
                onSeeMine={() => router.push("/support/mine")}
                onCreated={() => {
                  mine.mutate();
                  openMine.mutate();
                }}
              />
            ) : (
              <div className="flex flex-col items-start gap-2 py-2">
                <span className="text-[18px] font-semibold">El soporte aún no está activo</span>
                <span className="text-[13px] leading-relaxed text-cp-ink-3">
                  Cuando el administrador del proyecto active las categorías de soporte, podrás crear
                  solicitudes desde aquí.
                </span>
                {canConfigure && (
                  <Link href="/support/config" className="mt-1 text-[13px] font-semibold">
                    Configurar soporte
                  </Link>
                )}
              </div>
            )}
          </section>

          {!!mine.data?.items.length && (
            <section className="cp-card px-7 py-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[15px] font-semibold">Tus solicitudes recientes</span>
                <Link href="/support/mine" className="flex items-center gap-1 text-[13px] font-medium">
                  Ver todas <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                {mine.data.items.map((t) => {
                  const sla = slaBadge(t);
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => openTicket(t.id)}
                        className="grid w-full cursor-pointer grid-cols-[96px_minmax(0,1fr)_auto_auto] items-center gap-3 border-0 border-b border-solid border-cp-muted bg-transparent py-2.5 text-left text-[13px] text-cp-ink last:border-0 hover:bg-cp-bg"
                      >
                        <span className="font-medium text-cp-blue">{t.code}</span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{t.title}</span>
                          <span className="truncate text-cp-ink-3">
                            {t.subcategory_name} · {formatDate(t.created_at)}
                          </span>
                        </span>
                        <StatusDot value={t.status} />
                        <span className="w-[130px] truncate text-right font-semibold" style={{ color: sla.color }}>
                          {sla.text}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>

      <SupportTicketModal
        ticketId={openId}
        onClose={() => openTicket(null)}
        onChanged={() => {
          mine.mutate();
          openMine.mutate();
        }}
      />
    </ViewWrapper>
  );
}
