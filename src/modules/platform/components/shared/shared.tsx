import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/utils";
import { ICatalogComponent, ICatalogModule } from "@/types/roles/IRolesAdmin";

export const BTN_PRIMARY =
  "h-[var(--control-h)] whitespace-nowrap rounded-[10px] border-0 bg-cp-lime px-4 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_SECONDARY =
  "h-[var(--control-h)] whitespace-nowrap rounded-lg border border-cp-line-2 bg-cp-surface px-4 text-[14px] font-semibold text-cp-ink-2 hover:text-cp-ink disabled:cursor-not-allowed disabled:opacity-50";

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-cp-muted text-cp-ink-2",
  POST: "bg-cp-blue text-white",
  PUT: "bg-cp-orange text-white",
  PATCH: "bg-cp-orange text-white",
  DELETE: "bg-cp-magenta text-white"
};

export function MethodTag({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "inline-block w-[64px] shrink-0 rounded-[5px] px-1.5 py-px text-center text-[13px] font-semibold",
        METHOD_STYLES[method] ?? "bg-cp-muted text-cp-ink-2"
      )}
    >
      {method}
    </span>
  );
}

export function EndpointLine({
  method,
  route,
  path
}: {
  method: string;
  route: string;
  path: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 py-1">
      <MethodTag method={method} />
      <span className="truncate font-mono text-[13px] text-cp-ink-2" title={`/${route}${path}`}>
        /{route}
        {path}
      </span>
    </div>
  );
}

export const filterCatalog = (catalog: ICatalogModule[], includeOther: boolean) =>
  includeOther
    ? catalog
    : catalog
        .filter((module) => module.product !== "TMS")
        .map((module) => ({
          ...module,
          components: module.components.map((component) => ({
            ...component,
            endpoints: component.endpoints.filter((endpoint) => endpoint.mounted)
          }))
        }));

export const INCLUDE_OTHER_HINT =
  "Muestra las páginas TMS y las rutas del catálogo que este backend no atiende";

export const endpointStats = (component: ICatalogComponent) => {
  const reads = component.endpoints.filter((e) => e.method === "GET").length;
  return { reads, writes: component.endpoints.length - reads };
};

export function EndpointStats({ component }: { component: ICatalogComponent }) {
  if (component.endpoints.length === 0) {
    return (
      <span
        className="whitespace-nowrap text-[13px] text-cp-ink-3"
        title="No tiene endpoints: solo controla si la pantalla o el botón se muestran"
      >
        Solo visual
      </span>
    );
  }
  const { reads, writes } = endpointStats(component);
  return (
    <span className="whitespace-nowrap text-[13px] text-cp-ink-3">
      {reads} lectura{reads === 1 ? "" : "s"} · {writes} escritura{writes === 1 ? "" : "s"}
    </span>
  );
}

export function PaneItem({
  active,
  onClick,
  title,
  subtitle,
  badge
}: {
  active: boolean;
  onClick: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-w-0 items-center gap-2 border-0 border-l-[3px] bg-transparent px-3 py-2 text-left transition-colors hover:bg-cp-bg",
        active ? "border-cp-lime bg-cp-bg" : "border-transparent"
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-[13.5px]",
            active ? "font-semibold text-cp-ink" : "text-cp-ink-2"
          )}
        >
          {title}
        </span>
        {subtitle && <span className="truncate text-[13px] text-cp-ink-3">{subtitle}</span>}
      </span>
      {badge}
    </button>
  );
}

export function SystemBadge() {
  return (
    <span
      className="shrink-0 rounded-[5px] bg-cp-muted px-1.5 py-px text-[13px] font-semibold text-cp-ink-2"
      title="El código usa este rol por su id o su nombre: no se puede renombrar"
    >
      Sistema
    </span>
  );
}

export function Notice({
  tone = "neutral",
  children
}: {
  tone?: "neutral" | "warning";
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-cp-bg px-4 py-3 text-[13px] text-cp-ink-2">
      {tone === "warning" && (
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-cp-orange" aria-hidden />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
