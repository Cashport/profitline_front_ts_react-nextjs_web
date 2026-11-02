// Landing pública de cashport.ai (server component). Todo el texto sale en el
// HTML del servidor; solo el carrusel, el botón del encabezado y la tarjeta de
// acceso son componentes de cliente.
import type { ReactNode } from "react";

import { CONTENT, type Lang } from "../content";
import { Icon } from "../icons";
import {
  DATA_POLICY_URL,
  PRIVACY_POLICY_URL,
  PROFITLINE_URL,
  profitlineUrl,
  type ProfitlineTarget
} from "../links";
import { buildJsonLd } from "../seo";
import { HeroCarousel } from "./HeroCarousel";
import { LandingLogin } from "./LandingLogin";
import { SignInButton } from "./SignInButton";

const CONTACT_TEXT = "profitline.co/contactanos";

interface ExternalProps {
  href: string;
  hrefLang?: string;
  srText: string;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
}

// Enlace a profitline.co: pestaña nueva, flecha de salida y aviso para
// lectores de pantalla (y de idioma, desde la versión en inglés).
const External = ({ href, hrefLang, srText, className, arrow = true, children }: ExternalProps) => (
  <a className={className} href={href} hrefLang={hrefLang} target="_blank" rel="noopener">
    {children}
    {arrow && <Icon name="external" size={14} strokeWidth={2} className="ext" />}
    {srText && <span className="sr-only">{srText}</span>}
  </a>
);

const LangSwitch = ({
  lang,
  label,
  className
}: {
  lang: Lang;
  label: string;
  className: string;
}) => (
  <nav className={className} aria-label={label}>
    <Icon name="globe" size={13} stroke="#7d8b93" strokeWidth={1.8} />
    <a href="/" hrefLang="es" lang="es" aria-current={lang === "es" ? "true" : undefined}>
      ES
    </a>
    <a href="/en" hrefLang="en" lang="en" aria-current={lang === "en" ? "true" : undefined}>
      EN
    </a>
  </nav>
);

export const LandingPage = ({ lang }: { lang: Lang }) => {
  const c = CONTENT[lang];
  // profitline.co solo existe en español: en /en se marca el destino.
  const targetLang = lang === "es" ? undefined : "es";
  const ext = (target: ProfitlineTarget, placement: string) =>
    profitlineUrl(target, lang, placement);

  const linkProps = {
    hrefLang: targetLang,
    srText: [c.newTab, c.inSpanish].filter(Boolean).join(" ")
  };

  // El enlace va dentro de la respuesta sin texto oculto, para que el texto
  // visible siga siendo idéntico a la respuesta del JSON-LD.
  const withContactLink = (text: string): ReactNode => {
    const at = text.indexOf(CONTACT_TEXT);
    if (at === -1) return text;
    return (
      <>
        {text.slice(0, at)}
        <External hrefLang={targetLang} srText="" href={ext("contact", "faq")} arrow={false}>
          {CONTACT_TEXT}
        </External>
        {text.slice(at + CONTACT_TEXT.length)}
      </>
    );
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(lang)).replace(/</g, "\\u003c")
        }}
      />
      <a className="skip" href="#top">
        {c.skipToContent}
      </a>
      <div className="page">
        <header className="hdr">
          <a href="#top" className="hdr-logos" aria-label="Profitline · Cashport">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/profitline-logo.gif" alt="Profitline" width={154} height={30} />
            <span className="hdr-sep" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="cp"
              src="/assets/cashport-logo.webp"
              alt="Cashport"
              width={140}
              height={26}
            />
          </a>
          <nav className="nav-main" aria-label={c.nav.label}>
            {c.nav.items.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hdr-actions">
            <LangSwitch lang={lang} label={c.langSwitch} className="lang lang-header" />
            <SignInButton label={c.signIn} />
          </div>
        </header>

        <main id="top" tabIndex={-1}>
          <h1 className="sr-only">{c.h1}</h1>
          <section className="wrap hero" aria-label="Cashport">
            <HeroCarousel
              eyebrow={c.hero.eyebrow}
              servicesAria={c.hero.servicesAria}
              newTab={linkProps.srText}
              services={c.hero.services.map((s) => ({
                id: s.id,
                name: s.name,
                title: s.title,
                description: s.description,
                steps: s.steps,
                link: {
                  href: ext(s.link, `hero-${s.id}`),
                  label: c.hero.learnMore(s.name),
                  hrefLang: targetLang
                }
              }))}
            />
            <p className="hero-cta">
              <span>{c.heroCta.noAccount}</span>
              <External {...linkProps} href={ext("contact", "hero")} className="hero-cta-link">
                {c.heroCta.talk}
              </External>
            </p>
            <LandingLogin lang={lang} contactHref={ext("contact", "login")} />
          </section>

          <section id="partner" className="dark" aria-labelledby="partner-t">
            <div className="wrap sec">
              <div className="split">
                <div>
                  <p className="eyebrow">{c.partner.eyebrow}</p>
                  <h2 id="partner-t" className="h-xl">
                    {c.partner.title}
                    <br />
                    <span className="green">{c.partner.titleAccent}</span>
                  </h2>
                </div>
                <div className="split-side">
                  <p>{c.partner.body}</p>
                  <External
                    {...linkProps}
                    href={ext("about", "partner")}
                    className="text-link on-dark"
                  >
                    {c.partner.link}
                  </External>
                </div>
              </div>
              <div className="eq">
                {c.partner.cards.map((card) =>
                  card.icon === "$" ? (
                    <article key={card.title} className="res">
                      <span className="ic" aria-hidden="true">
                        $
                      </span>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </article>
                  ) : (
                    <article key={card.title}>
                      <div className="top">
                        <span className="ic">
                          <Icon name={card.icon} stroke="#fff" />
                        </span>
                        <span className="op" aria-hidden="true">
                          {card.op}
                        </span>
                      </div>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>

          <section id="operamos" className="wrap sec" aria-labelledby="ops-t">
            <div className="ops-head">
              <div>
                <p className="eyebrow">{c.ops.eyebrow}</p>
                <h2 id="ops-t" className="h-lg">
                  {c.ops.title}
                </h2>
              </div>
              <p>{c.ops.body}</p>
            </div>
            <div className="ops">
              {c.ops.cards.map((card) => (
                <article key={card.title}>
                  <span className="ic">
                    <Icon name={card.icon} size={19} stroke="#fff" />
                  </span>
                  <h3>{card.title}</h3>
                  <p className="desc">{card.description}</p>
                  <div className="kpis">
                    {card.kpis.map((kpi) => (
                      <div key={kpi.value}>
                        <strong>{kpi.value}</strong>
                        <span>{kpi.label}</span>
                      </div>
                    ))}
                  </div>
                  <External
                    {...linkProps}
                    href={ext(card.link, `ops-${card.link}`)}
                    className="tag"
                  >
                    <span className="tag-name">{card.tag}</span>
                    <span className="tag-cta">{c.ops.linkLabel}</span>
                  </External>
                </article>
              ))}
            </div>
            <div className="sectors">
              <span className="lbl">{c.ops.sectorsLabel}</span>
              {c.ops.sectors.map((sector) => (
                <External
                  key={sector.name}
                  {...linkProps}
                  href={ext(sector.link, `sector-${sector.link}`)}
                  className="s"
                >
                  {sector.name}
                </External>
              ))}
            </div>
          </section>

          <section id="global" className="dark" aria-labelledby="gl-t">
            <div className="wrap sec global">
              <div>
                <p className="eyebrow">{c.global.eyebrow}</p>
                <h2 id="gl-t" className="h-gl">
                  {c.global.title}
                  <br />
                  <span className="green">{c.global.titleAccent}</span>
                </h2>
                <p>{c.global.body}</p>
              </div>
              <ul className="countries">
                {c.global.countries.map((country) => {
                  const inner = (
                    <>
                      <span className="code">{country.code}</span>
                      <span className="name">{country.name}</span>
                      {country.hq && <span className="sr-only">{c.global.hqLabel}</span>}
                    </>
                  );
                  return (
                    <li key={country.code} className={country.hq ? "hq" : undefined}>
                      {country.link ? (
                        <External
                          {...linkProps}
                          href={ext(country.link, `country-${country.code.toLowerCase()}`)}
                        >
                          {inner}
                        </External>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section id="contacto" className="wrap cta" aria-labelledby="cta-t">
            <div className="cta-card">
              <div>
                <p className="eyebrow">{c.cta.eyebrow}</p>
                <h2 id="cta-t">{c.cta.title}</h2>
                <p>{c.cta.body}</p>
              </div>
              <div>
                <a
                  className="btn btn-orange"
                  href={ext("contact", "cta")}
                  hrefLang={targetLang}
                  target="_blank"
                  rel="noopener"
                >
                  {c.cta.button}
                  <Icon name="arrow" size={15} strokeWidth={2.2} className="arrow" />
                  <span className="sr-only">{c.newTab}</span>
                </a>
              </div>
            </div>
          </section>

          <section id="resumen" className="wrap resumen" aria-labelledby="res-t">
            <div className="two">
              <div>
                <p className="eyebrow">{c.facts.eyebrow}</p>
                <h2 id="res-t" className="h-md">
                  {c.facts.title}
                </h2>
                <p>{c.facts.body}</p>
              </div>
              <dl className="facts">
                {c.facts.items.map((item) => (
                  <div key={item.term}>
                    <dt>{item.term}</dt>
                    <dd>
                      {item.link ? (
                        <External
                          {...linkProps}
                          href={ext(item.link, `facts-${item.link}`)}
                          className="fact-link"
                        >
                          {item.detail}
                        </External>
                      ) : (
                        item.detail
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section id="faq" className="wrap faq" aria-labelledby="faq-t">
            <div className="two">
              <div>
                <p className="eyebrow">{c.faq.eyebrow}</p>
                <h2 id="faq-t" className="h-md">
                  {c.faq.title}
                </h2>
              </div>
              <div className="faq-list">
                {c.faq.items.map((item) => (
                  <details key={item.q}>
                    <summary>
                      <h3>{item.q}</h3>
                      <Icon name="plus" size={18} stroke="#ff5500" strokeWidth={2.2} />
                    </summary>
                    <p>{withContactLink(item.a)}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="ftr">
          <span>
            {c.footer.text} · © {new Date().getFullYear()} ·{" "}
            <a href={ext("home", "footer")} hrefLang={targetLang} target="_blank" rel="noopener">
              {PROFITLINE_URL.replace("https://", "")}
            </a>
          </span>
          <LangSwitch lang={lang} label={c.langSwitch} className="lang lang-footer" />
          <nav aria-label={c.footer.aria}>
            {[
              { href: PRIVACY_POLICY_URL, label: c.footer.privacy },
              { href: DATA_POLICY_URL, label: c.footer.dataPolicy },
              { href: ext("contact", "footer"), label: c.footer.contact }
            ].map((link) => (
              <External key={link.label} {...linkProps} href={link.href} arrow={false}>
                {link.label}
              </External>
            ))}
          </nav>
        </footer>
      </div>
    </>
  );
};
