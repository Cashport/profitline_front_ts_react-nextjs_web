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

### Estado (28/10/2026)
Ya aplicado en todos los módulos (rama `fix/header-consistency`): header compartido con avatar y cerrar sesión, contenido como Clientes (`cp-page` / `cp-card`), buscador único, Filtrar sin borde, corte y proyección comunes (`HeaderCutoff`), tema dentro del menú del avatar, menú lateral 6e y KPIs en una fila.

**Pendiente:** en varios módulos Filtrar sigue dentro de la tarjeta con filtros propios (Saldos, Aprobaciones, Cuentas médicas, Descuentos, Órdenes de compra, Administración, Data Quality, Gestor de tareas, Proveedores, Notificaciones, Logística inversa). Llevarlos al header con `FilterModal inHeader` cambia la UX de cada filtro: hacerlo módulo por módulo.

**Excepción, Mis pedidos (29/10/2026):** se probó con el diseño "Pedidos y Bancos" y se revirtió a petición de producto. Queda como estaba en main: arriba solo el header compartido (título "Mis pedidos" + avatar); dentro de la tarjeta, buscador, "Generar acción", Filtrar (selector propio), Dashboard y "Crear orden" a la derecha. No migrarlo sin pedirlo.

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
| Título de página (header) | 13.5px / 600 | 18px — **no más grande**: el título orienta, no compite con los KPIs |
| Título de tarjeta | 13.5px / 600 | 18px |
| KPI principal | 22px / 600 | 29px |
| KPI secundario (Notas/PNA/Novedades) | 18px / 600 | 24px |
| Texto de tabla | 12.5px | 17px |
| Encabezado de tabla | 12px / 600 #141414 | 16px |
| Etiqueta / subtítulo | 11.5px #6b6b6b | 15px |
| Meta (corte, sub-línea de fila, leyendas) | 10.5px #6b6b6b | 14px |
| **Mínimo absoluto** | — | **13px** — el tamaño del monto de la tabla de Clientes ("$ 13.201,1", 13px/600). **Ninguna letra ni número de la app por debajo**: tags de estado, píldoras, sub-líneas de tablas, tooltips, menús, pestañas, ejes y leyendas de gráficas incluidos. Única excepción: glifos que hacen de ícono dentro de un círculo o casilla (iniciales en avatares de 17–21px, "✓" de checkbox, flechas ▲▼ de orden, "⌂" del mapa) |
| **Sin mayúscula sostenida** | — | **Nunca** textos en mayúsculas: ni títulos de columna, ni etiquetas de KPI, ni secciones, ni badges ("En vivo", no "EN VIVO"). Siempre mayúscula inicial ("Nombre del informe"), salvo siglas (ID, NIT, EPS, IVA, ERP). Prohibido `uppercase` / `text-transform: uppercase` y el `tracking-*` que lo acompaña |

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
  --card-gap: 12px;           /* (9)  entre tarjetas/KPIs — medida real de Clientes */
  --section-gap: 12px;        /* (9)  entre bloques: KPIs → tabla */
  --card-radius: 14px;        /* (10.5) */
  --card-pad: 14px 18px;      /* (10.5 13.5) */
  --kpi-h: 112px;             /* (84) */
  --control-h: 36px;          /* botones/inputs del header (diseño "Corte y Proyeccion") */
  --search-w: 300px;
  --chip-h: 35px;             /* (26) */
  --avatar: 34px;
  --table-title-h: 48px;      /* (36) */
  --table-head-h: 43px;       /* (32) */
  --table-row-h: 56px;        /* (42) fila con sub-línea */
  --table-row-h-single: 45px; /* (34) fila de una línea */
  --table-pad-x: 21px;        /* (16) */
  --table-total-h: 48px;      /* (36) */
}
```

Regla general: **compacto pero con aire.** Si algo se ve apretado, primero se gana espacio quitando lo repetido o moviéndolo al header; **nunca bajando la tipografía de 13px** (§1): en un portátil de 14" al 100% lo más pequeño ya no se lee.

---

## 3. Shell

```
┌──────┬──────────────────────────────────────────────────────────────────────┐
│ LOGO │ ‹ Título  [● Hoy 22:06 | ↻] (Proyectar a cierre)   [chips][Filtrar▾][🔍][⋯] (●)▾ │ ← header sticky
│ ──── ├──────────────────────────────────────────────────────────────────────┤
│ ▣    │ [KPI] [KPI] [KPI] [KPI] [KPI] [KPI]   ← una sola fila, gap 12      │
│ ▣    │                                       ← 12 (--section-gap)          │
│ ──── │ ┌ Tarjeta principal (tabla / gráfica) — cp-card ────────────────┐ │
│ ▣    │ │                                                                  │ │
│ ⚙ ⇥ ⎋│ └──────────────────────────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────────────────────────┘
```

### Menú lateral (diseño "Menu Lateral Cashport" 6e — `SideBar` + `ModulesButtons`)
- **Riel blanco** pegado al borde, alto completo, borde derecho 1px #ececec, padding 14px 12px (px CSS).
- **Cerrado: 64px** (`--rail-w`), solo íconos. **Abierto: 240px**, con nombres.
  - Se abre **al pasar el mouse** (o con foco de teclado): se superpone al contenido con sombra `0 12px 32px rgba(0,0,0,.14)`.
  - **Fijado** ("Fijar menú" en el pie): empuja el contenido y va sin sombra. La preferencia se guarda en el navegador.
  - Transición de ancho .18s; los textos aparecen con opacidad .12s.
- **Proyecto (arriba)**: fila de 48px, margen inferior 10px. Cuadro **48×48 cuadrado a propósito**, radio 10, fondo blanco, padding 6px, logo con `object-fit: contain`.
  - **Cerrado: sin borde ni sombra** (centrado en el riel).
  - **Abierto: sombra sutil** `0 0 0 1px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.06)`, sin borde, y a su derecha el **nombre del proyecto**: 14px/600, interlineado 1.25, ancho 140px. **Un renglón si cabe; si es largo, dos renglones** (máximo; luego elipsis).
  - Clic: abre "Elegir proyecto". Tooltip "Cambiar proyecto".
- **Grupos** (Cartera, Recaudo, Comercial, Automatización, Gestión): bloque con 3px arriba/abajo y 1px entre ítems. **Línea #ececec entre grupos, visible abierto y cerrado.** Título del grupo 12px/500 #6b6b6b, alto 22px, solo visible abierto (ocupa su espacio siempre: nada salta al abrir).
- **Ítem**: alto 34px, radio 10, padding izquierdo 10px, ícono **19px de trazo 1.6** (íconos propios del diseño, `RailIcon`), 12px entre ícono y nombre, nombre 13.5px #141414.
  - Cerrado mide 40px; abierto, todo el ancho.
  - Hover #f4f4f4. **Activo: lima #cbe71e, texto 600.**
- **Pie** (línea superior #ececec, 6px arriba): Configuración, Fijar menú / Desfijar menú y **Cerrar sesión**, mismo estilo de ítem.
- Si los módulos no caben en alto, la lista hace scroll con desvanecido en el borde; el pie queda fijo.

### Selector de proyectos ("Elegir proyecto")
- Modal (`ModalProjectSelector`) con la grilla de tarjetas de proyecto: logo + nombre en una franja gris; el proyecto activo lleva la franja en lima.
- **Indicar que hay más**: si la grilla no cabe, se muestra la barra de scroll delgada y, abajo, un degradado con el botón **"Ver más proyectos ⌄"** que baja la lista. Desaparece al llegar al final. El usuario nunca debe tener que adivinar que hay más proyectos.
- **Modo oscuro**: fondo del modal #1f1f1f, título y "×" claros. Las tarjetas siguen **blancas** (los logos están pensados sobre fondo claro) y el nombre siempre en #141414.

### Contenido — **la referencia es Clientes** (`/clientes/all`)
Toda pantalla debe verse igual a Clientes. Si algo de este documento no coincide con lo que se ve en Clientes, gana Clientes y se corrige el documento.

- Fondo #f7f7f7, padding `0 var(--page-pad-x) var(--page-pad-bottom)` (lo pone `ViewWrapper`).
- **El contenido arranca justo debajo del header**: sin `gap`, `margin` ni `padding-top` extra entre el header y el primer bloque. El aire lo da la altura del header (58px).
- **Entre bloques** (fila de KPIs → tarjeta de tabla, tarjeta → tarjeta): `--section-gap` (12px CSS). Entre tarjetas de una misma fila: `--card-gap` (12px CSS).
- **Tarjetas**: blancas (`--cp-surface`), radio `--card-radius` (14px CSS), **sin borde y sin sombra**, padding `--card-pad` (14px 18px CSS). Nada de `rounded-xl/2xl`, `shadow-*`, `border` ni radios de 8/12/16 en tarjetas.
- **Clases compartidas (obligatorias)** en `src/styles/tailwind.css`:
  - `cp-page`: raíz de la vista (columna con `--section-gap`). Si el `Header` es su hijo directo, se anula el gap bajo el header automáticamente.
  - `cp-card`: cualquier tarjeta/panel de contenido.
  - `cp-card-row`: fila de KPIs o tarjetas resumen.
  - Componentes que ya las usan: `KpiCard`, `StatCards`, `PanelCard`. Usarlos antes que armar tarjetas a mano.
- **Nunca scroll horizontal**, ni en la página ni en las tablas.

> **Por qué antes no se aplicaba:** este documento era solo texto; cada módulo copiaba clases a mano (`rounded-xl shadow-sm`, `gap-4`, `border`, radios distintos) y los tokens no coincidían con Clientes (radio 16 y gap 16 aquí, 14 y 12 en Clientes). Ahora las medidas viven en tokens y clases compartidas: cambiar el token cambia todas las pantallas.

---

## 4. Header de página (patrón obligatorio en todos los módulos)

Una sola línea, **58px** (`--header-h`), sticky, fondo #f7f7f7. Controles de **36px** (`--control-h`). Orden de izquierda a derecha:

1. **Volver "‹"**: solo el chevron (16px, trazo 2.4, #141414) sobre el gris, **sin recuadro ni borde**. Hace `history.back()`; si se entró por URL directa, va al listado padre. Solo se muestra en pantallas de detalle o de segundo nivel.
2. **Bloque título**:
   - Título 13.5px/600 (18px CSS). Mismo tamaño en todos los módulos.
   - **A su derecha, en la misma línea**, el control propio del título si lo hay (p. ej. el navegador de días de Visitas) o el corte.
   - **Corte y proyección: siempre `HeaderCutoff`** (`@/components/ui/header-cutoff`, diseño "Corte y Proyeccion" 7f), igual en Clientes, Cartera por edad y Torre de recaudo (esta última sin proyectar). Otros módulos sin foto muestran "● Actualizado …".
     - **Chip del corte**: blanco, 32px, radio 8, 12.5px #4a4a4a: `● Hoy 22:06 | ↻` (si el dato es de otro día: `26/10 22:06`). Punto #9bb514 (ámbar #f5b700 mientras actualiza). Separador 1×16 #ececec y botón "Reprocesar" de 32px (para no administradores, "Recargar"); el ícono da una vuelta al hacer clic. Al pasar el mouse: tarjeta de 260px (radio 12, sombra `0 12px 32px rgba(0,0,0,.16)`): "Hoy a las 22:06" · "Los datos se toman cada 30 minutos para que todos vean lo mismo. Próximo: 22:36."
     - **Píldora "Proyectar a cierre"**: 32px, radio 15, 12.5px; blanca apagada, **lima #cbe71e y 600 encendida** con "Proyectado a 31/10 ×" (clic vuelve a hoy). Tarjeta al pasar el mouse: "Estima cómo cerrará el mes (31/10)." / "Estás viendo cifras estimadas al cierre. Clic para volver a hoy."
     - 20px entre el título y el chip; 10px entre el chip y la píldora.
     - **Modo oscuro**: chip, píldora apagada y tarjeta en azul pizarra (#1c3240; tarjeta #17303d con borde blanco al 10%), texto claro y punto **lima #cbe71e**; la píldora encendida sigue lima con texto #141414.
3. **Espaciador flexible.**
4. **Chips de filtros aplicados** ("Zona: Norte, Suba ×"): 26px de alto, fondo blanco, radio 7, 11px. Alineados a la derecha y **pegados a la izquierda del botón Filtrar** (crecen hacia la izquierda). Si no caben, se recortan con "+N". Nunca saltan de línea ni mueven el buscador.
5. **Botón "Filtrar ▾"**: **sin borde**, relleno **siempre al contrario de la superficie**: blanco sobre el gris de la página, gris `--cp-bg` dentro de una tarjeta blanca. Lo resuelve la clase `cp-control-fill` (el contenedor de acciones del `Header` lleva `cp-on-page`; cualquier otra zona sobre el gris también debe llevarla). Nunca blanco sobre blanco ni gris sobre gris, radio 8, texto #8a8a8a 13px/500 (hover #141414), 36px alto (`--control-h`), chevron 12px. Igual el "⋯" y los demás botones del header. Badge lima con el conteo cuando hay filtros activos. Abre el modal Filtros Avanzados (sección 6).
6. **Buscador fijo**: el buscador único (§8) con `surface="page"` (relleno blanco), 300px (`--search-w`), 36px alto, placeholder corto ("Buscar cliente, NIT…"). **Su posición nunca cambia.** No se repite dentro de las tarjetas (salvo la excepción de abajo).
7. Botón "⋯" (opcional) para acciones del módulo.
8. **El tema (Claro / Oscuro / Sistema) NO va en el header**: está dentro del menú del avatar, solo en módulos con modo oscuro (el módulo publica su tema con `ThemeMenuContext`).
9. **Avatar** negro 34px + chevron 14px: abre el menú del usuario (300px, radio 14): nombre 14.5/600 y correo · línea · **Tema** (Claro / Oscuro / Sistema en un selector segmentado gris, opción activa blanca con sombra; solo en módulos con modo oscuro) · Cambiar contraseña · línea · **Cerrar sesión** en magenta #e0007a. Cerrar sesión (aquí o en el menú lateral) **pide confirmación**: modal de 400px "¿Cerrar sesión?" con Cancelar y el botón magenta. Va en **todas** las pantallas, siempre en el extremo derecho.

En resumen: **título a la izquierda**; a la derecha, leyendo desde el borde hacia adentro: avatar (cerrar sesión) → buscador → Filtrar (+ chips).

- **Siempre el componente compartido**: `Header` (`@/components/organisms/header`, o `ViewWrapper` sin `hideHeader`). Buscador = `HeaderSearch`, Filtrar = `FilterButton` / `FilterModal` con `inHeader` (`@/components/ui/page-header-controls`). Nada de headers propios con `<h1>` y `border-b`, ni buscadores/filtros con otro estilo.
- **Acciones del módulo** (Crear orden, Reglas de banco, "⋯" Generar acción, Dashboard…) **no van en el header** (salvo "Dashboard" como botoncito de 28px junto al título): van **dentro de la tarjeta blanca, arriba a la derecha** — o a la derecha de la fila de pestañas si la tarjeta tiene pestañas. Primaria lima (36px, 12px/600, radio 8); secundarias blancas con borde #e3e3e3; "⋯" cuadrado de 36px con tooltip "Generar acción".
- **Nada de buscador ni Filtrar en el cuerpo de la vista** (p. ej. encima del mapa o de un panel): van en el header.
- **Excepción — tabla principal con búsqueda propia** (Clientes, Cartera por edad): el buscador va dentro de la tarjeta de la tabla porque busca sobre esa tabla; en ese caso el header no lleva buscador. Filtrar y el avatar siguen en el header.
- Contenido bajo el header: arranca justo debajo (sin gap extra; lo resuelve `cp-page`, §3).
- **Indicadores de estado de la vista** (p. ej. "● En vivo 18:30" de Visitas) no van en una franja propia entre el header y el contenido: van **dentro** de la tarjeta o el mapa al que se refieren (Visitas: esquina superior derecha del mapa, en píldora de vidrio), y el contenido sube hasta arriba.

---

## 5. KPIs

- **Todos los KPIs en una sola fila** en escritorio (≥768px), nunca en dos: `grid-template-columns: repeat(N, minmax(0,1fr))` (o `StatCards`/`KpiCards`, que ya lo hacen). Si un texto no cabe, se corta con "…" (tooltip con el texto completo); la fila no salta. En móvil, de a dos.
- Tarjetas `cp-card` (§3), gap `--card-gap`, padding 14px 18px CSS.
- Estructura de una tarjeta: etiqueta (11.5px #6b6b6b) → valor (22px/600, unidad "M" en 11px #6b6b6b) → a la derecha un valor de contraste (ej. "Vencida", "Meta") con chip de % → barra de 5px → leyenda en **una sola línea** de 10px.
- Una tarjeta puede agrupar 3 mini-KPIs (Notas / PNA / Novedades) separados por una línea vertical #ececec; valor 18px.
- Chip de %: 10.5px/600, padding 1px 6px, radio 5. Neutro #f2f2f2; positivo #cbe71e; riesgo #e0007a con texto blanco.
- Marca de meta en barras: línea negra de 2px con halo blanco.

---

## 6. Filtros — siempre con el modal "Filtros Avanzados"

Nunca filtros sueltos en la vista. Solo el botón Filtrar del header + chips.

- En código: `FilterModal` (`@/components/ui/filter-modal`) con **`inHeader`** cuando va en el header: pinta los chips a la izquierda de Filtrar (una línea, "+N") y entrega botón y chips como hijos directos del header. Sin `inHeader` es la barra de cuerpo (Filtrar + tags), solo para casos que no estén en el header.
- Las categorías que ya tienen su propio control visible en la vista (p. ej. Estado en Visitas/Cartera, Mercado en Clientes) pueden repetirse como chip, pero el control de la vista manda.

- Overlay oscuro suave; modal blanco ~900px (`max-width:100%`), radio 16, sombra grande.
- **Header:** ícono embudo lima en cuadro 36px fondo #f4f9d2 radio 8 · "Filtros Avanzados" (17px/600) · "Encuentra y selecciona múltiples opciones" (12px #6b6b6b) · X. Borde inferior #ececec.
- **Cuerpo, 2 columnas:**
  - Izquierda ~240px: categorías (14px #4a4a4a, filas 44px). Activa: negrita #141414, fondo #f7f7f7, barra lima 3px a la izquierda, chevron ">" a la derecha.
  - Derecha: buscador "Buscar en {categoría}…" (el buscador único, §8, relleno gris) · franja gris "N RESULTADOS" (10.5px, mayúsculas, 600) + "Seleccionar todos" en lima · opciones en 2 columnas con círculo de selección (multi-selección).
- **Categoría Fecha:** "SELECCIONA UN PERIODO" · Periodos predefinidos (Hoy, Esta semana, Mes actual, Último mes, Último trimestre, YTD, Últimos 12 meses) en botones de 2 columnas (fondo #fafafa, borde #e3e3e3, radio 8) · separador · "Rango Personalizado" con ícono calendario e inputs Desde/Hasta.
- **Footer:** "Limpiar todo" (texto 600 #4a4a4a) a la izquierda · "Cancelar" (texto 600 #141414) y **"Aplicar Filtros"** (lima #cbe71e, texto #141414 600, radio 10, 40px) a la derecha.
- Se edita en borrador; solo se aplica con "Aplicar Filtros"; Cancelar o X descartan.

---

## 7. Tablas

**Contador de resultados** ("4 informes", "2 de 5"): va al **pie** de la tabla, a la derecha, 13px gris. Nunca arriba de la tabla.

- **No cambiar la UX existente de las tablas** al compactar: se conservan las columnas y la información de cada celda.
- Tarjeta de tabla: título 13.5px/600 + leyenda (mercados, 11.5px, swatches de 8px radio 2) + contador ("2.816 clientes", 11px #8a8a8a a la derecha), **todo en una línea de 36px**. Textos de ayuda ("clic en un mercado para filtrar…") van en tooltip del título. Si la leyenda no cabe, se recorta con "+N" (popover con el resto); nunca segunda línea. Sin buscador dentro de la tarjeta, **salvo** la tabla principal con búsqueda propia (Clientes, Cartera por edad, §4): ahí el buscador va a la derecha de la línea de título, con el contador debajo.
- **Encabezado = el de Clientes en TODAS las tablas** (antd, `<th>` a mano, `SortableTh`, `TableHead` de chat/ui, tablas de grupos y de modales): fondo de la tarjeta (**blanco**, nunca gris ni `bg-muted`), **13.5px/600 #141414** (nunca gris), borde inferior #ececec, sin separadores verticales, sin mayúsculas. **Sticky**.
- **Ícono de orden**: solo `SortArrows` (`@/components/ui/sort-arrows`): dos triángulos de 7×4px apilados, gris #c4c4c4 y el de la dirección activa #141414, pegados al título (4px). Prohibidos ↕ ▲▼ sueltos o íconos de librería. Las tablas antd lo heredan de la regla global de `globals.scss` (`.ant-table-thead`).
- Filas:
  - Con sub-línea (ej. Clientes): 42px. Nombre del cliente en 12.5px/500 **enlace azul #1677ff** con ellipsis; debajo `Ejecutivo · ■ Mercado` en 10.5px #6b6b6b (el ejecutivo es obligatorio).
  - Una sola línea: 34px.
  - Borde inferior #f2f2f2. Padding horizontal 16px. Números alineados a la derecha.
- Mini-barras dentro de celdas: aging de 3px bajo el monto; progreso de 4px en línea con valor y %.
- **Fila Total sticky abajo** (36px, fondo #fafafa, borde superior #ececec, 600). El cuerpo hace scroll interno.
- Columnas en `grid` con `minmax(0,…)` y `gap:12px`. Nunca se solapan encabezados (bug "PNARecaudo").
- Responsive: la tabla mide su ancho y **oculta columnas secundarias por prioridad**; en angosto pasa a filas-tarjeta apiladas con chips de orden. Nunca scroll horizontal.

---

## 7b. Grupos por estado (Mis pedidos, Bancos, Saldos, Conciliación, pestañas del cliente)

**Referencia: Saldos.** Todos los desplegables por estado (estilo ClickUp: tag de estado + monto + cantidad, se despliega la tabla) se ven igual que en Saldos. Siempre con `Collapse` + `LabelCollapse` (`@/components/ui/collapse`, `@/components/ui/label-collapse`), sin estilos propios por módulo; solo cambian las columnas de la tabla.
- **Aire**: 1.5rem entre grupos (arriba del encabezado y abajo de cada grupo), línea gris entre grupos, contenido con sangría de 1rem. La tarjeta que los contiene lleva **padding de 1.5rem**: nada va pegado al borde.
- **Tag de estado**: 14px/400, padding 6px 12px, radio 8, color que manda el API. Al lado, monto (14px/600) y cantidad (14px/300) con íconos de billete y documentos, al 50% de opacidad, sobre fondo gris.
- **Tabla del grupo**: encabezado igual al de Clientes (§7); celdas a 16px con padding vertical de 0.4rem (la tabla de cada módulo). Sub-líneas nunca por debajo de 13px.
- **No compactar.** Se probó la versión compacta del diseño "Pedidos y Bancos" (fila de 40px, tags de 26px, tabla a 13px/42px) y se revirtió el 29/10/2026: se veía todo pegado.
- **Pestañas** (`UiTab`): fila de 48px con línea #ececec; 22px entre pestañas; 13.5px #8a8a8a/500, activa #141414/600 con subrayado negro de 2px. Acciones del módulo a la derecha de la fila. **16px de aire entre la línea de las pestañas y el contenido** (barra de botones, tarjetas del dashboard): nada va pegado a la línea.

---

## 8. Botones y controles

**Relleno inverso:** todo control sin borde (Filtrar, ⋯, buscador) es gris sobre blanco y blanco sobre gris (`cp-control-fill` / `cp-on-page`, `SearchField surface`).

**Barra de acciones de una vista** (fila sobre la tabla: buscador, "⋯ Generar acción", Filtrar/selectores/fechas, botones secundarios como "Dashboard" y el CTA lima como "Crear orden"): **todos los controles miden lo mismo que el buscador, 36px (`--control-h`)**, centrados en la fila, texto de botones 14px e íconos de ~18px. Ancho, color y radio de cada uno se mantienen. Referencia: Mis pedidos. `GenerateActionButton` ya viene así; un `<Button size="large">` o `PrincipalButton` en una barra se ajusta a `--control-h`.

| Tipo | Estilo |
|---|---|
| Primario | Lima #cbe71e, texto #141414 600, radio 10, 36px en barras de acciones (`--control-h`), 40px solo en modales/formularios. Hover #9bb514 |
| Secundario | Blanco, borde 1px #e3e3e3, radio 8, texto #8a8a8a/#141414 |
| Texto | Sin fondo, 600, #141414 o #4a4a4a |
| Input | 36px, radio 8, fondo blanco (o #fafafa con borde #e3e3e3 dentro de modales) |
| **Buscador** | **Uno solo en toda la app:** `SearchField` (`@/components/ui/search-field`). 36px (`--control-h`), radio 8, sin borde, lupa 15px #141414, texto 13px/500, placeholder #9a9a9a, "×" para limpiar. Relleno según la superficie: **gris `--cp-bg` sobre tarjetas/modales blancos** (`surface="card"`, por defecto) y **blanco sobre el fondo gris de la página** (`surface="page"`, p. ej. el header). `HeaderSearch`, `UiSearchInput` y `UiSearchInputLong` son envoltorios del mismo componente. Prohibido armar buscadores a mano con `<input>`/`<Input>` + lupa |
| Filtrar / ⋯ / botones del header | Sin borde, relleno blanco sobre gris (gris sobre blanco dentro de tarjetas), radio 8, 36px |
| Switch | 22×12 (`MiniSwitch`); en el header la proyección es la píldora de `HeaderCutoff`, no un switch |
| Chip removible | 26px, fondo blanco, radio 7, 11px, "×" #8a8a8a |

Hit targets ≥ 28px en desktop.

### Modo oscuro
- Solo en los módulos que lo tienen; el tema se elige en el **menú del avatar** (§4.9), nunca con un botón en el header. El layout pone `.dark` en el `<main>` y la clase `wallet-dark` (o `comercio-dark` / `dashboard-dark`) en `<body>`.
- Colores siempre con los tokens `cp-*` / `--cp-*` (tienen valor oscuro); nada de `#fff`/`#141414` sueltos en superficies.
- **Modales, popovers y dropdowns** se pintan en un portal fuera del `<main>`: su modo oscuro se escribe colgando de `body.wallet-dark, body.comercio-dark, body.dashboard-dark` (fondo #1f1f1f, texto claro). Revisar siempre que el texto no quede blanco sobre blanco.

---

## 9. Responsive — reglas duras

- Nunca scroll horizontal (página, tablas, modales).
- `min-width:0` en hijos flex/grid; grids con `minmax(0,…)` / `auto-fill`; filas que hacen wrap.
- Modales con `max-width:100%`.
- El único zoom permitido es el `zoom: 0.75` global existente; no agregar `zoom`/`transform: scale` por componente.
- Alturas con `100%`/flex, no `100vh` fijo en contenedores internos.

---

## 10. Checklist por módulo

- [ ] Ningún texto en mayúscula sostenida (títulos de tabla incluidos)
- [ ] Respeta el `zoom: 0.75` y usa los tokens de la sección 2 (sin px sueltos).
- [ ] Usa el shell (menú lateral 6e pegado al borde, fondo #f7f7f7).
- [ ] Raíz de la vista con `cp-page`; tarjetas con `cp-card` (o `KpiCard`/`StatCards`/`PanelCard`); sin espacio extra bajo el header. Comparada lado a lado con Clientes, se ve igual.
- [ ] Header compartido (`Header`) de 58px en el orden de la sección 4; buscador fijo a la derecha; chips a la izquierda de Filtrar.
- [ ] Avatar con "Cerrar sesión" visible en todas las pantallas del módulo (incluido detalle y subpantallas).
- [ ] Todos los buscadores son `SearchField` (gris sobre blanco, blanco sobre gris).
- [ ] Corte + "Proyectar a cierre" junto al título con `HeaderCutoff` (si aplica).
- [ ] "‹" volver sin recuadro en pantallas de detalle.
- [ ] Filtros solo vía modal Filtros Avanzados.
- [ ] KPIs en una sola fila, leyendas en una línea.
- [ ] Tabla con encabezado y total sticky, filas 42/34px, UX de columnas intacta, nombres en azul.
- [ ] Sin colores pastel.
- [ ] Ninguna fuente por debajo de 13px (§1).
- [ ] Si tiene modo oscuro: modales y popovers legibles en oscuro.
- [ ] Sin scroll horizontal en 1280×550, 1366×620 y 1920×1080.
- [ ] Capturas antes/después y número de filas visibles en el PR.

Referencias visuales: `Cashport 14 pulgadas.dc.html` (pantalla Clientes), `Menu Lateral Cashport.html` (menú lateral 6e) y `Corte y Proyeccion Cashport.html` (corte, proyección y menú del avatar 7f).
