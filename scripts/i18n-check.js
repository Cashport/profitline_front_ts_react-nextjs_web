// Verifica los catálogos de src/i18n/messages: mismas claves en es y en, mismas variables
// ({name}, plurales) en cada mensaje, sin textos vacíos y sin mensajes ICU mal formados.
// Uso: yarn i18n:check [namespace...]   (sale con código 1 si hay problemas)
const fs = require("fs");
const path = require("path");
const { parse } = require("@formatjs/icu-messageformat-parser");

const DIR = path.join(__dirname, "..", "src", "i18n", "messages");
const BASE = "es";
const ONLY = process.argv.slice(2);

const flatten = (obj, prefix = "", out = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, out);
    else out[full] = value;
  }
  return out;
};

const variablesOf = (message) => {
  const names = new Set();
  const walk = (nodes) =>
    nodes.forEach((node) => {
      if (node.value && typeof node.value === "string" && node.type !== 0) names.add(node.value);
      if (node.options) Object.values(node.options).forEach((o) => walk(o.value));
      if (node.children) walk(node.children);
    });
  walk(parse(message));
  return [...names].sort().join(",");
};

const load = (locale) => {
  const all = {};
  for (const file of fs.readdirSync(path.join(DIR, locale)).filter((f) => f.endsWith(".json"))) {
    const ns = file.replace(/\.json$/, "");
    if (ONLY.length && !ONLY.includes(ns)) continue;
    const data = JSON.parse(fs.readFileSync(path.join(DIR, locale, file), "utf8"));
    Object.assign(all, flatten(data, ns));
  }
  return all;
};

const problems = [];
const locales = fs.readdirSync(DIR).filter((d) => fs.statSync(path.join(DIR, d)).isDirectory());
const base = load(BASE);

for (const locale of locales) {
  const messages = locale === BASE ? base : load(locale);
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value !== "string" || !value.trim()) problems.push(`[${locale}] vacío: ${key}`);
    else {
      try {
        variablesOf(value);
      } catch (e) {
        problems.push(`[${locale}] ICU inválido en ${key}: ${e.message}`);
      }
    }
  }
  if (locale === BASE) continue;
  for (const key of Object.keys(base)) {
    if (!(key in messages)) problems.push(`[${locale}] falta: ${key}`);
    else {
      try {
        if (variablesOf(base[key]) !== variablesOf(messages[key]))
          problems.push(`[${locale}] variables distintas en ${key}`);
      } catch {
        /* ya reportado */
      }
    }
  }
  for (const key of Object.keys(messages))
    if (!(key in base)) problems.push(`[${locale}] sobra (no existe en ${BASE}): ${key}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problema(s) en los catálogos.`);
  process.exit(1);
}
console.log(`Catálogos OK: ${Object.keys(base).length} mensajes × ${locales.length} idiomas.`);
