interface BranchesIconProps {
  size?: string | number;
  className?: string;
}

/** Ícono de Sucursales: una tienda con toldo (trazo como los de lucide). */
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
      <path d="M2.5 9 4.2 3.5h15.6L21.5 9" />
      <path d="M2.5 9a3.17 3.17 0 0 0 6.33 0 3.17 3.17 0 0 0 6.34 0 3.17 3.17 0 0 0 6.33 0" />
      {/* Local */}
      <path d="M4 12v8.5h16V12" />
      {/* Ventana y puerta */}
      <path d="M6.8 14h3.7v3.3H6.8z" />
      <path d="M13.5 20.5v-6.5h3.7v6.5" />
    </svg>
  );
}
