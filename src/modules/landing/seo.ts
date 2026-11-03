// Metadatos y JSON-LD de la landing. Todo sale de content.ts para que los
// datos estructurados repitan exactamente el texto visible (requisito GEO).
import type { Metadata } from "next";
import { AREA_SERVED, CONTENT, type Lang } from "./content";
import { PROFITLINE_LINKEDIN, PROFITLINE_URL, PROFITLINE_YOUTUBE, SITE_URL } from "./links";

const ogImage = (lang: Lang) =>
  `${SITE_URL}/assets/${lang === "es" ? "og-image" : "og-image-en"}.png`;
const ORG_ID = `${PROFITLINE_URL}/#org`;
const APP_ID = `${SITE_URL}/#cashport`;

export const buildMetadata = (lang: Lang): Metadata => {
  const c = CONTENT[lang];
  const url = `${SITE_URL}${c.path}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: c.meta.title,
    description: c.meta.description,
    applicationName: "Cashport",
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: { es: `${SITE_URL}/`, en: `${SITE_URL}/en`, "x-default": `${SITE_URL}/` }
    },
    openGraph: {
      type: "website",
      siteName: "Profitline · Cashport",
      title: c.meta.title,
      description: c.meta.description,
      url,
      locale: c.locale,
      alternateLocale: lang === "es" ? ["en_US"] : ["es_CO"],
      images: [{ url: ogImage(lang), width: 1200, height: 630, alt: c.meta.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta.title,
      description: c.meta.description,
      images: [ogImage(lang)]
    },
    icons: { icon: "/favicon.ico" }
  };
};

export const buildJsonLd = (lang: Lang) => {
  const c = CONTENT[lang];
  const pageUrl = `${SITE_URL}${c.path}`;
  const cashportFaq = c.faq.items[1];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Profitline",
        url: PROFITLINE_URL,
        logo: `${SITE_URL}/assets/profitline-logo.png`,
        foundingDate: "2004",
        address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
        description: c.facts.body,
        areaServed: AREA_SERVED,
        knowsAbout: c.hero.services.map((s) => s.name),
        sameAs: [PROFITLINE_LINKEDIN, PROFITLINE_YOUTUBE],
        owns: { "@id": APP_ID }
      },
      {
        "@type": "SoftwareApplication",
        "@id": APP_ID,
        name: "Cashport",
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: cashportFaq.a,
        publisher: { "@id": ORG_ID }
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Cashport",
        inLanguage: ["es", "en"],
        publisher: { "@id": ORG_ID }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: c.meta.title,
        description: c.meta.description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": ORG_ID }
      },
      ...c.hero.services.map((s) => ({
        "@type": "Service",
        name: s.name,
        description: s.description,
        serviceType:
          lang === "es" ? "Outsourcing de procesos (BPO)" : "Business process outsourcing (BPO)",
        provider: { "@id": ORG_ID },
        areaServed: AREA_SERVED
      })),
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        inLanguage: lang,
        mainEntity: c.faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a }
        }))
      }
    ]
  };
};
