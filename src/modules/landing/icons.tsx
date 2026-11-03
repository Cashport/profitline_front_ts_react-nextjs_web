// Íconos de línea de la landing (trazos del prototipo de Claude Design).
const PATHS = {
  clipboard: "M8 4h8v4H8zM6 6H5v15h14V6h-1M9 12h6M9 16h4",
  document: "M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5",
  check: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z",
  scale: "M12 4v16M5 8h14M5 8l-2 6h4zM19 8l-2 6h4zM8 20h8",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01",
  database:
    "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8.5h.01",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",
  undo: "M9 14l-5-5 5-5M4 9h11a5 5 0 0 1 0 10h-3",
  people:
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2 3 5",
  route:
    "M6 19a2 2 0 1 0 0-.01M18 7a2 2 0 1 0 0-.01M6 17V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  process:
    "M4 5h5v5H4zM15 5h5v5h-5zM9.5 15h5v5h-5zM9 7.5h6M6.5 10v2.5a2 2 0 0 0 2 2h1M17.5 10v2.5a2 2 0 0 1-2 2h-1",
  code: "M4 5h16v11H4zM9 20h6M12 16v4M8 9l-2 2 2 2M16 9l2 2-2 2",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  external: "M7 17L17 7M9 7h8v8",
  plus: "M12 5v14M5 12h14",
  back: "M19 12H5M11 18l-6-6 6-6",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:
    "M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
  alert: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16h.01",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  close: "M6 6l12 12M18 6L6 18"
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

export const Icon = ({
  name,
  size = 20,
  stroke = "currentColor",
  strokeWidth = 1.7,
  className
}: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={PATHS[name]} />
  </svg>
);
