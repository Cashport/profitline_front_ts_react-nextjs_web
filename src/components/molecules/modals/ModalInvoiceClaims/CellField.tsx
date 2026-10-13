import { ReactNode } from "react";
import { FieldError } from "react-hook-form";

interface CellFieldProps {
  error?: FieldError;
  /** Mirrors the column's `align: "right"` so the control and its error follow the header */
  alignRight?: boolean;
  children: ReactNode;
}

/** Wraps an editable cell control so its validation error renders under it */
export const CellField = ({ error, alignRight, children }: CellFieldProps) => (
  <div className={`modalInvoiceClaims__field${alignRight ? " -alignRight" : ""}`}>
    {children}
    {error && <span className="modalInvoiceClaims__fieldError">{error.message}</span>}
  </div>
);
