# Cashport — DESIGN.md

Guía de diseño para refactorizar **todos los módulos** de Cashport. Es la fuente de verdad: si un módulo contradice este documento, gana el documento.

> **Nota de implementación (zoom variable).** En el código el zoom no es un `0.75` fijo: `--app-zoom` vale 0.75 (1024–1440 px), 0.85 (1441–1700 px) y 1 (móvil y monitores grandes), en `src/styles/globals.scss`. Por eso:
> - Los tokens CSS de la sección 2 se usan tal cual (`var(--header-h)`, clases `cp-*`); escalan igual en cualquier zoom.
> - Donde este documento dice `calc(100dvh / 0.75)`, usa `calc(100 * var(--vh))` (o `h-screen`, ya compensado).
> - Donde dice "dividir coordenadas por 0.75", usa `getAppZoom()` de `@/utils/utils`.

---

## 0. Contexto, punto de partida y objetivo

- El 95% de los clientes usa **portátiles de 14" (1920×1080 con Windows al 150%)**: el navegador queda en **~1280 × 550 px útiles**.
- **Punto de partida (ya hecho):** Cashport tiene `zoom: 0.75` global. Con Chrome al 100% la app ya se ve al tamaño correcto. **No se toca el zoom**; este refactor parte de ahí.
- Objetivo: sin scroll horizontal en ningún módulo y más información visible arriba del pliegue (tabla de Clientes: de ~5 a **≥7 filas** visibles en 14").

### ⚠ Cómo leer las medidas (importante)
Todas las medidas de este documento son **px visibles en pantalla** (lo que se ve en el viewport de 1280). Como hay `zoom: 0.75`, el valor a escribir en CSS es **medida ÷ 0.75** (≈ ×1.333). La sección 2 trae la tabla ya convertida; usa siempre esos tokens en vez de convertir a mano.
- Las alturas basadas en viewport deben compensar el zoom: `calc(100dvh / 0.75)` o, mejor, `height:100%` en cadena flex.
- Popovers, tooltips, dropdowns, gráficas (`getBoundingClientRect`, `clientX`) y drag & drop deben probarse con el zoom; si alguno se desalinea, corrige dividiendo coordenadas por 0.75.

### Estado actual → cambios pendientes (según captura de Clientes, 25/10/2026)
| # | Hoy | Debe quedar |
|---|---|---|
| 1 | Corte largo ("Corte 25/10/2026, 07:16 a. m.") + checkbox "Proyectar a cierre de mes" en la misma línea del título | Debajo del título, una línea pequeña: `● Corte 25/10 · 07:16 ↻ \| ◯ Proyectar a cierre` (switch) — sección 4 |
| 2 | Buscador dentro de la tarjeta de la tabla | Buscador **fijo en el header**, entre Filtrar y el avatar |
| 3 | Filtrar pegado al avatar, sin chips visibles | Chips de filtros aplicados a la **izquierda** de Filtrar |
| 4 | Sin botón volver | "‹" sin recuadro antes del título en pantallas de detalle |
| 5 | Tarjeta de tabla: título + ayuda + leyenda de mercados + contador en 3 líneas | **Una línea** de 36px: título · leyenda · contador a la derecha. La ayuda "clic en un mercado para filtrar…" pasa a tooltip del título |
| 6 | Menú lateral solo con íconos, dentro de tarjeta con margen | Riel pegado al borde (sin tarjeta flotante), con **nombre bajo cada ícono** |
| 7 | Márgenes laterales/superiores amplios (~40px visibles) | 12px laterales, header 58px |
| 8 | Leyenda de aging del KPI "Total cartera" en 2 líneas | Una sola línea; KPIs de 84px |
| 9 | Fila Total y encabezado sticky ✓ · ejecutivo bajo el nombre ✓ · nombres en azul ✓ | **Mantener tal cual** |

### Plan de ejecución
1. **Auditoría:** lista componentes de layout (shell, header de página, KPIs, tarjetas, tablas, modales), dónde se definen tamaños y qué está hardcodeado vs en tema.
2. Crea los tokens de la sección 2 (valores CSS ya compensados por el zoom) y reemplaza los valores hardcodeados.
3. Aplica shell + header (secciones 3–4) en un componente compartido y úsalo en **todos los módulos**.
4. Ajusta KPIs, tarjetas y tablas módulo por módulo (un PR por módulo), con capturas antes/después a 1280×550, 1366×620 y 1920×1080 y el número de filas visibles.

---

## 1. Fundamentos

### Tipografía
- **Poppins** en todo (400, 500, 600, 700). Nada de Inter/Roboto/Arial.
- `-webkit-font-smoothing: antialiased`.

| Uso | Visible | CSS (con zoom 0.75) |
|---|---|---|
| Título de página | 17px / 600 | 23px |
| Título de tarjeta | 13.5px / 600 | 18px |
| KPI principal | 22px / 600 | 29px |
| KPI secundario (Notas/PNA/Novedades) | 18px / 600 | 24px |
| Texto de tabla | 12.5px | 17px |
| Encabezado de tabla | 12px / 600 #141414 | 16px |
| Etiqueta / subtítulo | 11.5px #6b6b6b | 15px |
| Meta (corte, sub-línea de fila, leyendas) | 10.5px #6b6b6b | 14px |
| Mínimo absoluto | 10px | 13px |

### Color — nunca pasteles
Solo colores sólidos y saturados. Prohibidos los pasteles en leyendas, chips, swatches y barras.

| Token | Valor | Uso |
|---|---|---|
| `--lime` | #cbe71e | Acción primaria, ítem activo, badges, progreso positivo |
| `--lime-dark` | #9bb514 | Hover de lima, texto/indicador positivo |
| `--lime-tint` | #f4f9d2 | Solo fondo del ícono del modal de filtros |
| `--blue` | #1677ff | Enlaces (nombres de cliente), serie "Estética" |
| `--orange` | #ff6a13 | Alertas medias, PNA, serie "Alastin" |
| `--navy` | #2b4a5f | Serie oscura, acuerdos |
| `--magenta` | #e0007a | Riesgo alto, % vencido > 40%, serie "Trade" |
| `--red` | #e5262b | Incumplidos, mora 61–90 |
| `--ink` | #141414 | Texto principal |
| `--ink-2` | #4a4a4a | Texto secundario |
| `--ink-3` | #6b6b6b | Etiquetas |
| `--ink-4` | #8a8a8a | Placeholder, texto de botón Filtrar |
| `--line` | #ececec | Bordes de tabla / separadores |
| `--line-2` | #e3e3e3 | Bordes de inputs y botones |
| `--bg` | #f7f7f7 | Fondo de la app y del header |
| `--surface` | #ffffff | Tarjetas |
| `--muted` | #f2f2f2 | Pistas de barras, chips neutros |

Escala de mora (aging), en este orden: Corriente #cbe71e · 1–30 #f5b700 · 31–60 #ff6a13 · 61–90 #e5262b · 91–120 #e0007a · +120 #a3004f · +360 #6b0033.

Mercados/canales: asignar en orden fijo #1677ff · #ff6a13 · #9bb514 · #2b4a5f · #e0007a · #0e9aa7 · #7b3fe4 · Sin mercado #8a8a8a (ej. FEMSA: Territorial, Informal, On Premise, Modelos alternativos, Jurídico, Home Market, Tradicional). Mismo color para el mismo mercado en todos los módulos.

Enlaces: `a { color:#1677ff } a:hover { color:#0b5bd3; text-decoration:underline }`.

### Iconografía
Íconos de trazo (1.7–2.4px), puntas redondeadas, color #141414. Sin emoji.

---

## 2. Densidad (tokens)

Valores CSS **ya divididos por 0.75**. Entre paréntesis, lo que se ve en pantalla.

```css
:root {
  --rail-w: 64px;             /* (48) — reducido desde 72 visibles, ver §3 */
  --page-pad-x: 16px;         /* (12) */
  --page-pad-bottom: 11px;    /* (8)  */
  --header-h: 77px;           /* (58) */
  --card-gap: 13px;           /* (10) entre KPIs */
  --section-gap: 16px;        /* (12) KPIs → tabla */
  --card-radius: 16px;        /* (12) */
  --card-pad: 15px 21px;      /* (11 16) */
  --kpi-h: 112px;             /* (84) */
  --control-h: 43px;          /* (32) botones/inputs del header */
  --search-w: 293px;          /* (220) */
  --chip-h: 35px;             /* (26) */
  --avatar: 37px;             /* (28) */
  --table-title-h: 48px;      /* (36) */
  --table-head-h: 43px;       /* (32) */
  --table-row-h: 56px;        /* (42) fila con sub-línea */
  --table-row-h-single: 45px; /* (34) fila de una línea */
  --table-pad-x: 21px;        /* (16) */
  --table-total-h: 48px;      /* (36) */
}
```

Regla general: **compacto pero con aire.** Si algo se ve apretado, primero se gana espacio quitando lo repetido o moviéndolo al header; nunca bajando la tipografía del mínimo.

---

## 3. Shell

```
┌──────┬──────────────────────────────────────────────────────────────┐
│ LOGO │ ‹  Título                       [chips…] [Filtrar▾] [🔍] (●)▾ │ ← header 58px, sticky, fondo #f7f7f7
│      │    ● Corte 23/10 · 12:05 ↻ | ◯ Proyectar a cierre           │
│ ▣    ├──────────────────────────────────────────────────────────────┤
│Inicio│ [KPI] [KPI] [KPI]                                            │ ← 84px, gap 10
│ ■    │                                                              │ ← 12px
│Client│ ┌ Tarjeta principal (tabla / gráfica) ──────────────────────┐ │
│ ...  │ │                                                          │ │
│  →|  │ └──────────────────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────────────────┘
```

### Menú lateral
- Riel blanco de **48px visibles cerrado** (`--rail-w`; antes 72px, se redujo para dar más ancho a la data), pegado al borde izquierdo y de alto completo (no tarjeta flotante con margen). Logo del cliente arriba (pequeño).
- Cada ítem: ícono (18px) dentro de un cuadro de 36×30 radio 9, y **debajo el nombre del módulo** en 9.5px. Nunca solo íconos: el usuario no debe aprenderse los dibujos.
  > **Decisión vigente (25/10/2026):** por ahora el nombre **no** va visible bajo el ícono; se muestra como tooltip a la derecha al pasar el mouse (`RailItem` en `ModulesButtons.tsx`). No volver a poner la etiqueta sin confirmarlo con producto.
- Activo: cuadro **lima #cbe71e**, ícono negro, etiqueta 600 #141414. Inactivo: etiqueta 400 #6b6b6b, sin fondo.
- Abajo, botón "→|" para expandir a menú completo (íconos + nombre en línea).

### Contenido
- Fondo #f7f7f7, padding `0 var(--page-pad-x) var(--page-pad-bottom)`.
- Tarjetas blancas, radio 12 (14 en cómodo), sin sombra o sombra mínima.
- **Nunca scroll horizontal**, ni en la página ni en las tablas.

---

## 4. Header de página (patrón obligatorio en todos los módulos)

Una sola línea, **58px**, sticky, fondo #f7f7f7. Orden de izquierda a derecha:

1. **Volver "‹"**: solo el chevron (16px, trazo 2.4, #141414) sobre el gris, **sin recuadro ni borde**. Hace `history.back()`; si se entró por URL directa, va al listado padre. Solo se muestra en pantallas de detalle o de segundo nivel.
2. **Bloque título** (columna, gap 4px):
   - Título 17px/600.
   - Debajo, una línea de 10.5px #6b6b6b: `● Corte 23/10 · 12:05 ↻` + separador vertical + **switch pequeño "Proyectar a cierre"** (22×12; texto completo en tooltip). Se lee como una frase: "estamos a este corte; ¿quieres proyectarlo?". Si el módulo no proyecta, solo va el corte.
3. **Espaciador flexible.**
4. **Chips de filtros aplicados** ("Zona: Norte, Suba ×"): 26px de alto, fondo blanco, radio 7, 11px. Alineados a la derecha y **pegados a la izquierda del botón Filtrar** (crecen hacia la izquierda). Si no caben, se recortan con "+N". Nunca saltan de línea ni mueven el buscador.
5. **Botón "Filtrar ▾"**: blanco, borde 1px #e3e3e3, radio 8, texto #8a8a8a 12px/500, 32px alto. Badge lima con el conteo cuando hay filtros activos. Abre el modal Filtros Avanzados (sección 6).
6. **Buscador fijo**: 220px, 32px alto, radio 8, fondo blanco, sin borde, lupa #6b6b6b, placeholder corto ("Buscar cliente, NIT…"). **Su posición nunca cambia.** No se repite dentro de las tarjetas.
7. Botón "⋯" (opcional) para acciones del módulo.
8. **Avatar** negro 28px + chevron.

---

## 5. KPIs

- Fila de tarjetas blancas, `grid-template-columns: repeat(N, minmax(0,1fr))`, gap 10px, altura 84px, padding 11px 16px, radio 12.
- Estructura de una tarjeta: etiqueta (11.5px #6b6b6b) → valor (22px/600, unidad "M" en 11px #6b6b6b) → a la derecha un valor de contraste (ej. "Vencida", "Meta") con chip de % → barra de 5px → leyenda en **una sola línea** de 10px.
- Una tarjeta puede agrupar 3 mini-KPIs (Notas / PNA / Novedades) separados por una línea vertical #ececec; valor 18px.
- Chip de %: 10.5px/600, padding 1px 6px, radio 5. Neutro #f2f2f2; positivo #cbe71e; riesgo #e0007a con texto blanco.
- Marca de meta en barras: línea negra de 2px con halo blanco.

---

## 6. Filtros — siempre con el modal "Filtros Avanzados"

Nunca filtros sueltos en la vista. Solo el botón Filtrar del header + chips.

- Overlay oscuro suave; modal blanco ~900px (`max-width:100%`), radio 16, sombra grande.
- **Header:** ícono embudo lima en cuadro 36px fondo #f4f9d2 radio 8 · "Filtros Avanzados" (17px/600) · "Encuentra y selecciona múltiples opciones" (12px #6b6b6b) · X. Borde inferior #ececec.
- **Cuerpo, 2 columnas:**
  - Izquierda ~240px: categorías (14px #4a4a4a, filas 44px). Activa: negrita #141414, fondo #f7f7f7, barra lima 3px a la izquierda, chevron ">" a la derecha.
  - Derecha: buscador "Buscar en {categoría}…" (fondo #fafafa, borde #e3e3e3, radio 10) · franja gris "N RESULTADOS" (10.5px, mayúsculas, 600) + "Seleccionar todos" en lima · opciones en 2 columnas con círculo de selección (multi-selección).
- **Categoría Fecha:** "SELECCIONA UN PERIODO" · Periodos predefinidos (Hoy, Esta semana, Mes actual, Último mes, Último trimestre, YTD, Últimos 12 meses) en botones de 2 columnas (fondo #fafafa, borde #e3e3e3, radio 8) · separador · "Rango Personalizado" con ícono calendario e inputs Desde/Hasta.
- **Footer:** "Limpiar todo" (texto 600 #4a4a4a) a la izquierda · "Cancelar" (texto 600 #141414) y **"Aplicar Filtros"** (lima #cbe71e, texto #141414 600, radio 10, 40px) a la derecha.
- Se edita en borrador; solo se aplica con "Aplicar Filtros"; Cancelar o X descartan.

---

## 7. Tablas

- **No cambiar la UX existente de las tablas** al compactar: se conservan las columnas y la información de cada celda.
- Tarjeta de tabla: título 13.5px/600 + leyenda (mercados, 11.5px, swatches de 8px radio 2) + contador ("2.816 clientes", 11px #8a8a8a a la derecha), **todo en una línea de 36px**. Textos de ayuda ("clic en un mercado para filtrar…") van en tooltip del título. Si la leyenda no cabe, se recorta con "+N" (popover con el resto); nunca segunda línea. Sin buscador dentro de la tarjeta.
- Encabezado: 32px, blanco, 12px/600 #141414, flechas de orden ▲▼ grises (la activa negra), borde inferior #ececec. **Sticky**.
- Filas:
  - Con sub-línea (ej. Clientes): 42px. Nombre del cliente en 12.5px/500 **enlace azul #1677ff** con ellipsis; debajo `Ejecutivo · ■ Mercado` en 10.5px #6b6b6b (el ejecutivo es obligatorio).
  - Una sola línea: 34px.
  - Borde inferior #f2f2f2. Padding horizontal 16px. Números alineados a la derecha.
- Mini-barras dentro de celdas: aging de 3px bajo el monto; progreso de 4px en línea con valor y %.
- **Fila Total sticky abajo** (36px, fondo #fafafa, borde superior #ececec, 600). El cuerpo hace scroll interno.
- Columnas en `grid` con `minmax(0,…)` y `gap:12px`. Nunca se solapan encabezados (bug "PNARecaudo").
- Responsive: la tabla mide su ancho y **oculta columnas secundarias por prioridad**; en angosto pasa a filas-tarjeta apiladas con chips de orden. Nunca scroll horizontal.

---

## 8. Botones y controles

| Tipo | Estilo |
|---|---|
| Primario | Lima #cbe71e, texto #141414 600, radio 10, 40px (32px en header). Hover #9bb514 |
| Secundario | Blanco, borde 1px #e3e3e3, radio 8, texto #8a8a8a/#141414 |
| Texto | Sin fondo, 600, #141414 o #4a4a4a |
| Input | 32px, radio 8, fondo blanco (o #fafafa con borde #e3e3e3 dentro de modales) |
| Switch | 22×12 en header; apagado #c4c4c4, encendido #cbe71e |
| Chip removible | 26px, fondo blanco, radio 7, 11px, "×" #8a8a8a |

Hit targets ≥ 28px en desktop.

---

## 9. Responsive — reglas duras

- Nunca scroll horizontal (página, tablas, modales).
- `min-width:0` en hijos flex/grid; grids con `minmax(0,…)` / `auto-fill`; filas que hacen wrap.
- Modales con `max-width:100%`.
- El único zoom permitido es el `zoom: 0.75` global existente; no agregar `zoom`/`transform: scale` por componente.
- Alturas con `100%`/flex, no `100vh` fijo en contenedores internos.

---

## 10. Checklist por módulo

- [ ] Respeta el `zoom: 0.75` y usa los tokens de la sección 2 (sin px sueltos).
- [ ] Usa el shell (riel con etiquetas pegado al borde, fondo #f7f7f7).
- [ ] Header de 58px en el orden de la sección 4; buscador fijo a la derecha; chips a la izquierda de Filtrar.
- [ ] Corte + "Proyectar a cierre" debajo del título (si aplica).
- [ ] "‹" volver sin recuadro en pantallas de detalle.
- [ ] Filtros solo vía modal Filtros Avanzados.
- [ ] KPIs de 84px, leyendas en una línea.
- [ ] Tabla con encabezado y total sticky, filas 42/34px, UX de columnas intacta, nombres en azul.
- [ ] Sin colores pastel.
- [ ] Sin scroll horizontal en 1280×550, 1366×620 y 1920×1080.
- [ ] Capturas antes/después y número de filas visibles en el PR.

Referencia visual: `Cashport 14 pulgadas.dc.html` (pantalla Clientes).
