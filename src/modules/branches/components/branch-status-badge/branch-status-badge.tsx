import { cn } from "@/utils/utils";

/** Activo en lima; inactivo en rojo con texto blanco. */
export default function BranchStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center rounded-[6px] px-2 text-[13px] font-semibold",
        isActive ? "bg-cp-lime text-[#141414]" : "bg-cp-red text-white"
      )}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
