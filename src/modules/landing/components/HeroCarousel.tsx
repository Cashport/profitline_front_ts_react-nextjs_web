"use client";

// Carrusel vertical del hero. Todo el texto de los cinco servicios se
// renderiza en el servidor (los paneles inactivos solo se ocultan con CSS),
// así que un rastreador sin JavaScript lee los cinco completos.
import { TouchEvent, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../icons";

const DURATION_MS = 7000;

export interface CarouselService {
  id: string;
  name: string;
  title: { pre: string; bold: string };
  description: string;
  steps: { label: string; icon: IconName | "$" }[];
  link: { href: string; label: string; hrefLang?: string };
}

interface HeroCarouselProps {
  eyebrow: string;
  servicesAria: string;
  newTab: string;
  services: CarouselService[];
}

export const HeroCarousel = ({ eyebrow, servicesAria, newTab, services }: HeroCarouselProps) => {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [picked, setPicked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // No rota mientras el hero está fuera de pantalla o la pestaña está oculta.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const running = !picked && !hovering && !reduceMotion && visible;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setActive((i) => (i + 1) % services.length);
      setCycle((c) => c + 1);
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [running, active, cycle, services.length]);

  // Paso resaltado del servicio activo (en celular la línea avanza paso a
  // paso y debajo se muestra solo la etiqueta del paso actual).
  const [stepAt, setStepAt] = useState(0);
  const stepCount = services[active].steps.length;
  useEffect(() => {
    setStepAt(0);
    if (reduceMotion || !visible) return;
    const timer = setInterval(() => setStepAt((k) => (k + 1) % stepCount), DURATION_MS / stepCount);
    return () => clearInterval(timer);
  }, [active, cycle, stepCount, reduceMotion, visible]);

  const pick = (index: number) => {
    setPicked(true);
    setActive((index + services.length) % services.length);
  };

  // En celular se cambia de servicio deslizando el dedo sobre el hero.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    pick(active + (dx < 0 ? 1 : -1));
  };

  const fillKey = `${active}-${cycle}-${running}`;
  const segmentClass = (i: number) =>
    i === active ? (running ? "on run" : "on") : i < active ? "done" : undefined;

  return (
    <div
      className="hero-main"
      ref={rootRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ ["--dur" as string]: `${DURATION_MS}ms` }}
    >
      <p className="eyebrow">{eyebrow}</p>
      {/* Solo en celular: barra de progreso tipo "historias" en lugar de las pastillas. */}
      <div className="stories" role="group" aria-label={servicesAria}>
        <div className="stories-bar">
          {services.map((service, i) => (
            <button
              key={service.id}
              type="button"
              className={segmentClass(i)}
              aria-label={service.name}
              aria-pressed={i === active}
              onClick={() => pick(i)}
            >
              <span key={i === active ? fillKey : undefined} />
            </button>
          ))}
        </div>
        <span className="stories-count" aria-hidden="true">
          {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
        </span>
      </div>
      <div className="carousel-head">
        <div className="rail" aria-hidden="true">
          {services.map((service, i) => (
            <button
              key={service.id}
              type="button"
              tabIndex={-1}
              className={i === active ? (running ? "on run" : "on") : undefined}
              onClick={() => pick(i)}
            >
              <span key={i === active ? fillKey : undefined} />
            </button>
          ))}
        </div>
        <div className="titles">
          <div className="titles-win">
            <div
              className="titles-track"
              style={{ transform: `translateY(calc(var(--title-step) * -${active}))` }}
            >
              {services.map((service, i) => (
                <p
                  key={service.id}
                  className={i === active ? "on" : undefined}
                  aria-hidden={i !== active}
                >
                  <span>
                    {service.title.pre}
                    <b>{service.title.bold}</b>
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="panels">
        {services.map((service, i) => {
          const on = i === active;
          // Al cambiar a un servicio con menos pasos, stepAt se reinicia un
          // render después: se acota para no salirse del arreglo.
          const at = on ? Math.min(stepAt, service.steps.length - 1) : 0;
          return (
            <div key={service.id} className={on ? "panel on" : "panel"} aria-hidden={!on}>
              <p>{service.description}</p>
              <ol
                className="steps"
                aria-label={service.name}
                style={{
                  ["--p" as string]: at / (service.steps.length - 1)
                }}
              >
                {service.steps.map((step, k) => {
                  const last = k === service.steps.length - 1;
                  const state = on && k === at ? "cur" : on && k < at ? "past" : undefined;
                  return (
                    <li key={step.label} className={state}>
                      {!last && <span className={k < 3 ? "step-line hot" : "step-line"} />}
                      <span className={last ? "step-ic end" : "step-ic"}>
                        {step.icon === "$" ? "$" : <Icon name={step.icon} stroke="#021b29" />}
                      </span>
                      <span className="lbl">{step.label}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="step-caption" aria-hidden="true">
                <span>{String(at + 1).padStart(2, "0")}</span>
                {service.steps[at].label}
              </p>
              <a
                className="panel-link"
                href={service.link.href}
                hrefLang={service.link.hrefLang}
                target="_blank"
                rel="noopener"
                tabIndex={on ? undefined : -1}
              >
                {service.link.label}
                <Icon name="external" size={15} strokeWidth={2} />
                <span className="sr-only">{newTab}</span>
              </a>
            </div>
          );
        })}
      </div>
      <div className="chips" role="group" aria-label={servicesAria}>
        {services.map((service, i) => (
          <button
            key={service.id}
            type="button"
            className={i === active ? "on" : undefined}
            aria-pressed={i === active}
            onClick={() => pick(i)}
          >
            {service.name}
          </button>
        ))}
      </div>
    </div>
  );
};
