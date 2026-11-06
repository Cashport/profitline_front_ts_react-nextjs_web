interface BranchesIconProps {
  size?: string | number;
  className?: string;
}

/** Ícono de Sucursales de devolución: tienda con toldo y flecha de regreso (trazo como lucide). */
export default function BranchesIcon({ size = 24, className }: BranchesIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Toldo */}
      <path d="M2 12.5 3.2 9h11.6l1.2 3.5" />
      <path d="M2 12.5a2.33 2.33 0 0 0 4.67 0 2.33 2.33 0 0 0 4.66 0 2.33 2.33 0 0 0 4.67 0" />
      {/* Local y puerta */}
      <path d="M3 15v6h12v-6" />
      <path d="M7.5 21v-3.5h3V21" />
      {/* Flecha de devolución */}
      <path d="M15.5 5.5a3 3 0 1 0 3-3" />
      <path d="M19.8 1.2 18.5 2.5l1.3 1.3" />
    </svg>
  );
}
