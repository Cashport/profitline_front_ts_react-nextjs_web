# Multilenguaje (i18n) en Cashport

La plataforma está en español e inglés. El idioma es una preferencia del usuario: se elige en
el menú del avatar (junto a Tema y Cerrar sesión), se guarda en el backend
(`user_preference.LANGUAGE`, `PUT /user/preferences`) y en la cookie `cp_lang` del navegador.

## Inglés en revisión (candado)

Mientras `ENGLISH_FOR_SUPER_ADMINS_ONLY` sea `true` (`src/i18n/config.ts`), solo los super admins ven
el selector de idioma y pueden usar la app en inglés. Para los demás usuarios el idioma es siempre
español, aunque su navegador o la cookie de la landing digan inglés, y los títulos de pestaña salen en
español para todos. Se pone en `false` cuando producto apruebe la traducción.

## Cómo funciona

| Pieza | Dónde |
|---|---|
| Librería | [`use-intl`](https://next-intl.dev/docs/usage) (núcleo de next-intl): `useTranslations`, `useFormatter`, mensajes ICU |
| Idiomas, cookie, detección | `src/i18n/config.ts` |
| Proveedor (carga mensajes, Ant Design, dayjs, `<html lang>`) | `src/i18n/I18nProvider.tsx`, montado en `src/app/(platform)/layout.tsx` |
| Catálogos | `src/i18n/messages/{es,en}/<namespace>.json` + `index.ts` |
| Tipos (claves verificadas por TypeScript) | `src/i18n/types.ts` |
| Traducir fuera de React | `getTranslator(namespace)` en `src/i18n/translator.ts` |
| Verificación de catálogos | `yarn i18n:check [namespace…]` |
| Glosario de negocio | [`glosario.md`](./glosario.md) |

Orden para decidir el idioma: preferencia del usuario (al iniciar sesión `/api/auth` la copia a
la cookie) → cookie `cp_lang` (la misma de la landing) → idioma del navegador → español.

El español es la base: el inglés se monta encima, así que una clave que faltara en inglés se ve
en español, nunca como clave cruda. `yarn i18n:check` impide que eso pase.

Cada llamada al API lleva `Accept-Language: es|en`, para que el backend pueda responder en el
idioma del usuario cuando sus mensajes y catálogos estén traducidos.

## Cómo traducir un componente

```tsx
import { useTranslations } from "use-intl";

export function InvoicesTable() {
  const t = useTranslations("clients.invoicesTable");
  const tCommon = useTranslations("common");
  return (
    <>
      <h2>{t("title")}</h2>
      <Button>{tCommon("actions.export")}</Button>
      <span>{t("selected", { count: rows.length })}</span>
    </>
  );
}
```

```json
// es/clients.json
{ "invoicesTable": { "title": "Facturas abiertas",
  "selected": "{count, plural, one {# factura seleccionada} other {# facturas seleccionadas}}" } }
// en/clients.json
{ "invoicesTable": { "title": "Open invoices",
  "selected": "{count, plural, one {# invoice selected} other {# invoices selected}}" } }
```

### Reglas

1. **Un namespace por módulo** (`clients`, `wallet`, `purchaseOrders`…). Dentro, claves en
   camelCase agrupadas por componente o sección: `clients.invoicesTable.columns.dueDate`.
2. **`common` es compartido**: acciones (`common.actions.save`), estados, campos y mensajes
   genéricos. Úsalo antes de crear una clave nueva con el mismo texto. No lo edites desde un
   módulo: si un texto genérico no está, créalo en el namespace del módulo.
3. **Nada de concatenar**: `t("dueIn", { days })`, no `"Vence en " + days + " días"`. Los
   plurales van con ICU (`{count, plural, one {…} other {…}}`); el orden de las palabras cambia
   entre idiomas.
4. **Texto con formato o enlaces**: `t.rich("terms", { b: (chunks) => <b>{chunks}</b> })` con
   `"Acepto los <b>términos</b>"` en el JSON.
5. **Arreglos de opciones y columnas definidos fuera del componente** (constantes de módulo):
   guarda la **clave**, no el texto, y traduce al renderizar; o convierte la constante en una
   función que recibe `t`. Nunca llames `getTranslator` en el nivel superior de un archivo: se
   evaluaría una sola vez y quedaría en el idioma del primer render.
6. **Fuera de React** (servicios, utilidades, mensajes de error armados en funciones):
   `getTranslator("namespace")("clave")` dentro de la función, al momento de usarlo.
7. **Validaciones** (yup/zod/react-hook-form): construye el esquema dentro del componente con
   `useMemo(() => schema(t), [t])` o usa mensajes de `common.validation`.
8. **No se traduce**:
   - valores que se envían al backend o se comparan contra él (estados, códigos, `statusName`,
     `page_name` de permisos, parámetros de URL, claves de pestañas);
   - datos que llegan del API (nombres de clientes, motivos y estados configurados en la base,
     mensajes de error del backend);
   - nombres propios y de producto: Cashport, Marketplace, WhatsApp, SAP, Data Quality;
   - `console.*`, comentarios, clases CSS, nombres de archivo o de columnas de un Excel que
     otro sistema lee.
   Si un valor del backend se muestra con un mapa (`{ PENDING: "Pendiente" }`), traduce el mapa,
   no el valor.
9. **Fechas y números**: dayjs ya cambia de idioma solo; no llames `dayjs.locale("es")` en un
   módulo (rompe el inglés). Los formatos de fecha (`DD/MM/YYYY`) se conservan. Los números y la
   moneda siguen la moneda mostrada (HU de multimoneda), no el idioma.
10. **Español**: el texto del catálogo `es` es el mismo que había en el código. Se corrigen
    tildes y errores de ortografía evidentes ("ocurrio" → "ocurrió"), sin reescribir.
11. **Inglés**: traduce el concepto de negocio según [`glosario.md`](./glosario.md), no la
    palabra. Inglés de EE. UU.; títulos de módulo en *Title Case*, el resto en *Sentence case*;
    mensajes claros y en segunda persona ("Select a customer to continue").

## Términos nuevos

Los términos de negocio en inglés salen del glosario del Brain de Cashport
(`Cashport Brain/00-vision/glosario.md`); [`glosario.md`](./glosario.md) es su copia técnica, con los
términos de interfaz. Si difieren, gana el Brain. Un término que no está en el glosario **no se
inventa**: se pregunta a los líderes de producto cómo se llama en español y en inglés, con el contexto
de negocio y una propuesta (regla MOD-014). Mientras no respondan, se usa la propuesta como provisional
y se anota en el PR; no sale a producción sin la decisión. Luego se agrega a los dos glosarios.

Para revisar la terminología con el equipo de producto existe la página "Traducción de Cashport"
(artifact de claude.ai): muestra todos los textos en los dos idiomas y guarda las sugerencias por texto.
Se regenera con los catálogos actuales cuando cambian.

## Agregar un idioma

1. `LOCALES` en `src/i18n/config.ts` y la etiqueta en `LOCALE_LABELS`.
2. Carpeta `src/i18n/messages/<idioma>/` con todos los namespaces e `index.ts` tipado como `en`.
3. Locale de Ant Design en `ANTD_LOCALES` y de dayjs en `I18nProvider.tsx`.
4. Backend: agregar el valor a `SUPPORTED_LANGUAGES` y al `CHECK` de `user_preference.LANGUAGE`.

## URLs

Todas las rutas están en inglés y en kebab-case (`/clients/all`, `/cash-application`,
`/discounts/rule/:id`). Las anteriores redirigen con 308 desde `legacy-routes.js` (links
guardados en la base, correos enviados, marcadores). Una ruta nueva se crea directamente en
inglés; si se renombra una, se agrega su redirección ahí.
