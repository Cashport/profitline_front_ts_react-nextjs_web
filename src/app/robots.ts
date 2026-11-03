import type { MetadataRoute } from "next";
import { readdirSync } from "fs";
import path from "path";

import { SITE_URL } from "@/modules/landing/links";

// Buscadores y asistentes de IA con acceso explícito a la landing.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended"
];

// La app no vive bajo /app/: sus rutas son las carpetas del grupo (platform).
// Se leen al compilar para que una ruta nueva quede bloqueada sin tocar este
// archivo. El middleware además las responde con X-Robots-Tag: noindex.
const privateRoutes = () =>
  readdirSync(path.join(process.cwd(), "src", "app", "(platform)"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[[(]/.test(entry.name))
    .map((entry) => `/${entry.name}`)
    .concat("/api/")
    .sort();

export default function robots(): MetadataRoute.Robots {
  const disallow = privateRoutes();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
