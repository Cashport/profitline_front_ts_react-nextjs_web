import type { ReactNode } from "react";

import type { IBranch } from "@/types/branches/IBranches";
import { cn } from "@/utils/utils";

import { formatPrice } from "../../utils/branches";
import BranchStatusBadge from "../branch-status-badge/branch-status-badge";
import PriceListBadge from "../price-list-badge/price-list-badge";

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="text-[13px] text-cp-ink-3">{label}</dt>
      <dd className="m-0 text-[13.5px] font-medium text-cp-ink">{children}</dd>
    </div>
  );
}

/** Información de la sucursal, solo lectura. */
export default function BranchInfoCard({ branch }: { branch: IBranch }) {
  return (
    <section className="cp-card p-[var(--card-pad)]">
      <h2 className="m-0 mb-3 text-[13.5px] font-semibold text-cp-ink">
        Información de la sucursal
      </h2>
      <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Cliente">
          <span className="font-semibold">{branch.client_name}</span>
        </Field>
        {branch.client_nit && (
          <Field label="NIT">
            <span className="tabular-nums">{branch.client_nit}</span>
          </Field>
        )}
        <Field label="Sucursal">
          <span className="font-semibold">{branch.name}</span>
        </Field>
        <Field label="Municipio">{branch.city}</Field>
        <Field label="Estado">
          <BranchStatusBadge isActive={branch.is_active} />
        </Field>
        <Field label="Dirección" className="sm:col-span-2 lg:col-span-3">
          {branch.address}
        </Field>
        <Field label="Lista de precios">
          <PriceListBadge priceList={branch.price_list} />
        </Field>
        <Field label="Precio base">
          <span className="font-semibold tabular-nums">{formatPrice(branch.base_price)}</span>
        </Field>
      </dl>
    </section>
  );
}
