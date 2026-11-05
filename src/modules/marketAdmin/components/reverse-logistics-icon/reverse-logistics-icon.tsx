interface ReverseLogisticsIconProps {
  size?: string | number;
  className?: string;
}

/** Ícono de Logística inversa: tres cajas dentro de una flecha circular de regreso (trazo como lucide). */
export default function ReverseLogisticsIcon({ size = 24, className }: ReverseLogisticsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Flecha circular */}
      <path d="M8.65 21.21A9.8 9.8 0 1 0 2.2 12" />
      <path d="M0.4 9.9 2.2 12.6l2.2-2.6" />
      {/* Caja de arriba */}
      <path d="M12 6.31l2.86 1.625v3.25L12 12.81l-2.86-1.625v-3.25Z" />
      <path d="M9.14 7.935 12 9.56l2.86-1.625M12 9.56v3.25" />
      {/* Caja de abajo a la izquierda */}
      <path d="M9.14 11.185 6.28 12.81v3.25l2.86 1.625L12 16.06v-3.25" />
      <path d="M6.28 12.81l2.86 1.625L12 12.81M9.14 14.435v3.25" />
      {/* Caja de abajo a la derecha */}
      <path d="M14.86 11.185l2.86 1.625v3.25l-2.86 1.625L12 16.06" />
      <path d="M12 12.81l2.86 1.625 2.86-1.625M14.86 14.435v3.25" />
    </svg>
  );
}
