import { cn } from "@/utils/utils";

import { MISSING } from "../../constants";

/* Marcadores del mapa como elementos DOM. El elemento raíz es de MapLibre: le pone
   su clase (maplibregl-marker, que lo posiciona) y lo mueve con `transform`, así que
   las clases de estado y las escalas van siempre en un hijo. Viven dentro de
   <main class="dark">, por eso los tokens (bg-card, text-foreground) siguen el tema. */

/** Escribe la clase sólo si cambió: se actualiza en cada cuadro de la reproducción. */
const setClass = (el: Element, value: string) => {
  if (el.className !== value) el.className = value;
};

const ADVISOR_BODY =
  "relative grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-solid border-[color:var(--sc)] bg-card text-[9.5px] font-semibold text-foreground shadow-[0_0_0_3px_rgb(var(--card)),0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-150";
const ADVISOR_RING =
  "visits-ring pointer-events-none absolute -inset-1.5 rounded-full border-2 border-[color:var(--sc)]";
const BADGE =
  "pointer-events-none absolute -top-2.5 left-5 grid h-5 min-w-[22px] place-items-center whitespace-nowrap rounded-[10px] border-2 border-[#141414] bg-[#cbe71e] px-1.5 text-[11px] font-bold leading-none text-[#141414] shadow-[0_3px_8px_rgba(0,0,0,0.25)] transition-transform";
const BADGE_LEADER = "-top-3 h-[22px] min-w-[26px] border-[#cbe71e] bg-[#141414] text-xs text-[#cbe71e]";
const BADGE_ZERO = "border-border bg-card text-muted-foreground";

export interface AdvisorMarkerHandles {
  root: HTMLDivElement;
  body: HTMLDivElement;
  ring: HTMLSpanElement;
  badge: HTMLSpanElement;
}

/** Asesor: iniciales con borde del color del estado y el conteo de actividades encima. */
export function createAdvisorMarkerElement(initials: string): AdvisorMarkerHandles {
  const root = document.createElement("div");
  root.className = "cursor-pointer";
  const body = document.createElement("div");
  const ring = document.createElement("span");
  const label = document.createElement("b");
  label.className = "relative font-semibold";
  label.textContent = initials;
  const badge = document.createElement("span");
  body.append(ring, label, badge);
  root.append(body);
  return { root, body, ring, badge };
}

export interface AdvisorMarkerState {
  color: string;
  selected: boolean;
  hovered: boolean;
  /** Sin señal: borde punteado. */
  lost: boolean;
  /** En vivo y en visita o tránsito: anillo que late. */
  pulse: boolean;
  /** Actividades exitosas; null mientras no lleguen del backend ("XX"). */
  count: number | null;
  /** Primero del ranking: conteo en negro con verde. */
  leader: boolean;
}

export function applyAdvisorMarkerState(h: AdvisorMarkerHandles, s: AdvisorMarkerState) {
  h.body.style.setProperty("--sc", s.color);
  setClass(
    h.body,
    cn(
      ADVISOR_BODY,
      s.hovered && "scale-125",
      s.selected && "scale-[1.35] bg-[color:var(--sc)] text-card",
      s.lost && "border-dashed"
    )
  );
  setClass(h.ring, cn(ADVISOR_RING, !s.pulse && "hidden"));
  const count = s.count == null ? MISSING : String(s.count);
  if (h.badge.textContent !== count) h.badge.textContent = count;
  setClass(
    h.badge,
    cn(
      BADGE,
      !s.count ? BADGE_ZERO : s.leader && BADGE_LEADER,
      (s.selected || s.hovered) && "scale-[.8]"
    )
  );
}

const STOP_BASE =
  "grid h-[22px] w-[22px] cursor-pointer place-items-center rounded-full text-[10px] font-semibold";
const STOP_PHASE = {
  done: "bg-[color:var(--rc)] text-card shadow-[0_0_0_2px_rgb(var(--card))]",
  now: "bg-[#cbe71e] text-[#141414] shadow-[0_0_0_2px_#141414]",
  pending: "border-[1.5px] border-dashed border-[#9a9a9a] bg-card text-[#9a9a9a]"
};

export interface StopMarkerHandles {
  /** Para el Marker de MapLibre. */
  root: HTMLDivElement;
  /** El círculo numerado: recibe las clases de estado. */
  body: HTMLDivElement;
}

/** Parada numerada de la ruta del asesor enfocado. */
export function createStopMarkerElement(n: number): StopMarkerHandles {
  const root = document.createElement("div");
  const body = document.createElement("div");
  body.textContent = String(n);
  root.append(body);
  return { root, body };
}

export function applyStopState(
  el: HTMLDivElement,
  phase: keyof typeof STOP_PHASE,
  resultColor: string
) {
  el.style.setProperty("--rc", resultColor);
  setClass(el, cn(STOP_BASE, STOP_PHASE[phase]));
}

/** Punto de inicio de la jornada del asesor enfocado. */
export function createStartMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "grid h-4 w-4 place-items-center rounded-full border-[1.5px] border-solid border-[#9a9a9a] bg-card text-[8px] text-foreground/70";
  el.textContent = "⌂";
  return el;
}

/** Contenido de los tooltips del mapa, armado con textContent (sin HTML interpolado). */
export function tooltipContent(title: string, detail?: string): HTMLElement {
  const root = document.createElement("div");
  const strong = document.createElement("div");
  strong.className = "font-medium text-foreground";
  strong.textContent = title;
  root.append(strong);
  if (detail) {
    const small = document.createElement("small");
    small.className = "block text-[10px] text-muted-foreground";
    small.textContent = detail;
    root.append(small);
  }
  return root;
}
