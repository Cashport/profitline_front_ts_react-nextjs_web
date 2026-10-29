# Cashport — DESIGN.md

Guía de diseño de **todas las pantallas** de Cashport. Es la fuente de verdad: si una pantalla contradice este documento, gana el documento. **Referencia visual: Clientes (`/clientes/all`)**; si algo de aquí no coincide con lo que se ve en Clientes, gana Clientes y se corrige el documento.

**Última actualización:** 29/10/2026 (rama `fix/header-consistency`).

---

## Guía rápida para desarrolladores (leer primero)

Antes de construir una historia o una pantalla nueva, revisa esta tabla. **Siempre se usa el componente compartido**; no se arman a mano.

| Necesito… | Uso | Dónde |
|---|---|---|
| La raíz de la vista | `<div className="cp-page">` | `src/styles/tailwind.css` |
| Una tarjeta blanca | `className="cp-card"` (o `PanelCard`) | `@/components/ui/panel-card` |
| El header de la página (título, Filtrar, buscador, avatar) | `Header` | `@/components/organisms/header` |
| Buscador del header | `HeaderSearch` | `@/components/ui/page-header-controls` |
| Buscador dentro de una tarjeta o modal | `SearchField` | `@/components/ui/search-field` |
| Botón Filtrar + chips + modal de filtros | `FilterModal` con `inHeader` | `@/components/ui/filter-modal` |
| Corte de datos y "Proyectar a cierre" | `HeaderCutoff` | `@/components/ui/header-cutoff` |
| KPIs | `StatCards` o `KpiCard` | `@/components/ui/stat-cards`, `@/components/ui/kpi-card` |
| Ícono de ordenar en una tabla | `SortArrows` | `@/components/ui/sort-arrows` |
| Encabezado ordenable de tabla hecha a mano | `SortableTh` | `@/modules/walletModule/components/shared/sortable-th` |
| Grupos desplegables por estado (tipo ClickUp) | `Collapse` + `LabelCollapse` | `@/components/ui/collapse`, `@/components/ui/label-collapse` |
| Pestañas | `UiTab` | `@/components/ui/ui-tab` |
| Botón "⋯ Generar acción" | `GenerateActionButton` | `@/components/atoms/GenerateActionButton` |
| Interruptor pequeño | `MiniSwitch` | `@/components/ui/page-header-controls` |

### Las 10 reglas que más se rompen
1. **Nada por debajo de 13px.** Ningún texto ni número (tablas, tags, tooltips, ejes, leyendas, pestañas). §1.
2. **Nunca MAYÚSCULA SOSTENIDA.** Ni títulos de columna, ni KPIs, ni badges. Mayúscula inicial y punto: "Nombre del informe", "En vivo". Solo siglas en mayúscula (ID, NIT, EPS, IVA, ERP). §1.
3. **Encabezado de tabla = el de Clientes, en todas las tablas:** fondo blanco, 13.5px negrita negra, sin mayúsculas, ícono de orden `SortArrows`. §7.
4. **Header compartido en todas las pantallas** con avatar a la derecha. Nada de `<h1>` propios. §4.
5. **Buscador y Filtrar van en el header**, no dentro del contenido (salvo tablas con búsqueda propia, §4).
6. **Todos los controles de una barra miden 36px** (`--control-h`): buscador, Filtrar, "⋯ Generar acción", botones y CTA. Referencia: Mis pedidos. §8.
7. **Relleno inverso:** Filtrar, "⋯" y buscador son blancos sobre el gris de la página y grises dentro de una tarjeta blanca. Nunca blanco sobre blanco ni gris sobre gris. §8.
8. **El contador de resultados** ("4 informes", "2 de 5") va **al pie de la tabla**, a la derecha. Nunca arriba. §7.
9. **Grupos por estado = Saldos**, con aire (1.5rem). No compactarlos. §7b.
10. **16px de aire entre las pestañas y el contenido.** Nada pegado a la línea de las pestañas. §7b.

### Plantilla de una pantalla nueva

```tsx
import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls";
import FilterModal from "@/components/ui/filter-modal";

export default function MiModuloView() {
  return (
    <div className="cp-page">
      <Header
        title="Mi módulo"
        actionsExtra={
          <>
            <FilterModal inHeader /* categorías, onApply… */ />
            <HeaderSearch placeholder="Buscar cliente, NIT…" /* value, onChange */ />
          </>
        }
      />

      {/* KPIs (opcional): StatCards, una sola fila */}

      <section className="cp-card">
        {/* barra de acciones (36px) a la derecha, si hay: ⋯ Generar acción, CTA lima */}
        {/* tabla con encabezado de Clientes y SortArrows */}
        {/* contador "N resultados" al pie, a la derecha, 13px gris */}
      </section>
    </div>
  );
}
```

### Prohibido
- `uppercase`, `text-transform: uppercase` y el `tracking-*` / `letter-spacing` que lo acompaña.
- `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-xs` y cualquier tamaño < 13px.
- Encabezados de tabla grises, con `bg-muted`, en mayúsculas o con separadores verticales.
- Flechas de orden ↕ ▲▼ sueltas o íconos de librería (lucide, antd, phosphor) para ordenar.
- Headers propios (`<h1>` + `border-b`), buscadores hechos con `<input>` + lupa, filtros sueltos en la vista.
- Tarjetas con `rounded-xl/2xl`, `shadow-*` o `border`.
- Botones de 40–48px (`size="large"`) en barras de acciones.
- Botón de tema (claro/oscuro) en el header: va en el menú del avatar.
- Colores pastel; `#fff` / `#141414` sueltos en superficies con modo oscuro (usar tokens `cp-*`).
- Scroll horizontal en cualquier parte.

---

## 0. Contexto, punto de partida y objetivo

- El 95% de los clientes usa **portátiles de 14" (1920×1080 con Windows al 150%)**: el navegador queda en **~1280 × 550 px útiles**.
- Cashport ya tiene zoom global (`--app-zoom`). **No se toca el zoom**; todo parte de ahí.
- Objetivo: sin scroll horizontal en ningún módulo y más información visible arriba del pliegue (tabla de Clientes: de ~5 a **≥7 filas** visibles en 14").

### Zoom variable (implementación)
`--app-zoom` vale 0.75 (1024–1440 px), 0.85 (1441–1700 px) y 1 (móvil y monitores grandes), en `src/styles/globals.scss`. Por eso:
- **Todas las medidas de este documento son las que se escriben en el CSS** (px CSS). Los tokens de la sección 2 y las clases `cp-*` ya escalan solos con el zoom.
- Alturas de viewport: `calc(100 * var(--vh))` (o `h-screen`, ya compensado), nunca `100vh` a mano.
- Coordenadas de popovers, tooltips, gráficas (`getBoundingClientRect`, `clientX`) y drag & drop: dividir por `getAppZoom()` de `@/utils/utils`.

### Estado (29/10/2026)
Aplicado en todos los módulos (rama `fix/header-consistency`): header compartido con avatar y cerrar sesión, contenido como Clientes (`cp-page` / `cp-card`), buscador único, Filtrar sin borde y con relleno inverso, corte y proyección comunes (`HeaderCutoff`), tema dentro del menú del avatar, menú lateral 6e, KPIs en una fila, barras de acciones a 36px, pestañas con aire, mínimo de 13px, sin mayúsculas y encabezados de tabla como Clientes con `SortArrows`. Incluye los módulos nuevos: Encuestas, Alertas de bloqueo, Precintos, Conciliación de cartera y Tareas.

**Pendiente:** en varios módulos Filtrar sigue dentro de la tarjeta con filtros propios (Saldos, Aprobaciones, Cuentas médicas, Descuentos, Órdenes de compra, Administración, Data Quality, Gestor de tareas, Proveedores, Notificaciones, Logística inversa). Llevarlos al header con `FilterModal inHeader` cambia la UX de cada filtro: hacerlo módulo por módulo. Las tablas de Data Quality pasan colores fijos (`#141414`, `#000000`) al `TableHead` y no se adaptan al modo oscuro.

**Excepción, Mis pedidos (29/10/2026):** se probó con el diseño "Pedidos y Bancos" y se revirtió a petición de producto. Arriba solo el header compartido (título "Mis pedidos" + avatar); dentro de la tarjeta, buscador, "Generar acción", Filtrar (selector propio), Dashboard y "Crear orden" a la derecha, todos a 36px. **No migrarlo sin pedirlo.**

---

## 1. Fundamentos

### Tipografía
- **Poppins** en todo (400, 500, 600, 700). Nada de Inter/Roboto/Arial.
- `-webkit-font-smoothing: antialiased`.

| Uso | Tamaño (CSS) |
|---|---|
| Título de página (header) | 18px / 600 — **no más grande**: el título orienta, no compite con los KPIs |
| Título de tarjeta | 18px / 600 |
| KPI principal | 29px / 600 |
| KPI secundario (Notas/PNA/Novedades) | 24px / 600 |
| Encabezado de tabla | 13.5px / 600 #141414 |
| Texto de tabla | 13–16px (monto de Clientes: 13px / 600) |
| Botones de barra de acciones | 14px |
| Etiqueta, subtítulo, meta, sub-línea de fila, leyenda, tag, tooltip | 13px #6b6b6b |
| **Mínimo absoluto** | **13px** — el monto de la tabla de Clientes ("$ 13.201,1", 13px/600). **Ninguna letra ni número de la app por debajo**: tags de estado, píldoras, sub-líneas de tablas, tooltips, menús, pestañas, ejes y leyendas de gráficas incluidos. Única excepción: glifos que hacen de ícono dentro de un círculo o casilla (iniciales en avatares de 17–21px, "✓" de checkbox, marcador de opción, "⌂" del mapa) |

### Sin mayúscula sostenida
**Nunca** textos en mayúsculas: ni títulos de columna, ni etiquetas de KPI, ni secciones, ni badges, ni botones.

| ✗ No | ✓ Sí |
|---|---|
| NOMBRE DEL INFORME | Nombre del informe |
| EN VIVO | En vivo |
| 12 RESULTADOS | 12 resultados |
| ASIGNACIÓN | Asignación |
| Id documento | ID documento |

- Siempre mayúscula inicial y el resto en minúscula, salvo nombres propios y siglas (ID, NIT, EPS, IVA, ERP).
- Prohibido `uppercase`, `text-transform: uppercase` y el `tracking-*` / `letter-spacing` que lo acompaña.
- **Excepción:** los datos que manda el API se muestran tal cual llegan (nombres de clientes, estados como "BODEGA"). La regla es para textos de la interfaz.

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
| `--magenta` | #e0007a | Riesgo alto, % vencido > 40%, serie "Trade", Cerrar sesión |
| `--red` | #e5262b | Incumplidos, mora 61–90 |
| `--ink` | #141414 | Texto principal, encabezados de tabla |
| `--ink-2` | #4a4a4a | Texto secundario |
| `--ink-3` | #6b6b6b | Etiquetas |
| `--ink-4` | #8a8a8a | Placeholder, texto de botón Filtrar |
| `--line` | #ececec | Bordes de tabla / separadores |
| `--line-2` | #e3e3e3 | Bordes de inputs y botones |
| `--bg` | #f7f7f7 | Fondo de la app y del header |
| `--surface` | #ffffff | Tarjetas |
| `--muted` | #f2f2f2 | Pistas de barras, chips neutros |

En código se usan los tokens con modo oscuro: `rgb(var(--cp-ink))`, `--cp-surface`, `--cp-bg`, `--cp-line`, `--cp-line-2` (o las clases `text-cp-ink`, `bg-cp-surface`, `border-cp-line`…).

Escala de mora (aging), en este orden: Corriente #cbe71e · 1–30 #f5b700 · 31–60 #ff6a13 · 61–90 #e5262b · 91–120 #e0007a · +120 #a3004f · +360 #6b0033.

Mercados/canales: asignar en orden fijo #1677ff · #ff6a13 · #9bb514 · #2b4a5f · #e0007a · #0e9aa7 · #7b3fe4 · Sin mercado #8a8a8a (ej. FEMSA: Territorial, Informal, On Premise, Modelos alternativos, Jurídico, Home Market, Tradicional). Mismo color para el mismo mercado en todos los módulos.

Enlaces: `a { color:#1677ff } a:hover { color:#0b5bd3; text-decoration:underline }`.

### Iconografía
Íconos de trazo (1.7–2.4px), puntas redondeadas, color #141414. Sin emoji. En barras de acciones, íconos de ~18px.

---

## 2. Densidad (tokens)

Valores CSS (ya escalan con el zoom). Usar siempre el token, nunca el número suelto.

```css
:root {
  --rail-w: 64px;             /* menú lateral cerrado */
  --page-pad-x: 16px;
  --page-pad-bottom: 11px;
  --header-h: 77px;
  --card-gap: 12px;           /* entre tarjetas/KPIs — medida real de Clientes */
  --section-gap: 12px;        /* entre bloques: KPIs → tabla */
  --card-radius: 14px;
  --card-pad: 14px 18px;
  --kpi-h: 112px;
  --control-h: 36px;          /* TODOS los controles de header y barras de acciones */
  --search-w: 300px;
  --chip-h: 35px;
  --avatar: 34px;
  --table-title-h: 48px;
  --table-head-h: 43px;
  --table-row-h: 56px;        /* fila con sub-línea */
  --table-row-h-single: 45px; /* fila de una línea */
  --table-pad-x: 21px;
  --table-total-h: 48px;
}
```

Regla general: **compacto pero con aire.** Si algo se ve apretado, primero se gana espacio quitando lo repetido o moviéndolo al header; **nunca bajando la tipografía de 13px**: en un portátil de 14" lo más pequeño ya no se lee. Y al revés: si algo se ve pegado (grupos, pestañas), se le da aire; no se compacta.

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
- **Riel blanco** pegado al borde, alto completo, borde derecho 1px #ececec, padding 14px 12px.
- **Cerrado: 64px** (`--rail-w`), solo íconos. **Abierto: 240px**, con nombres.
  - Se abre **al pasar el mouse** (o con foco de teclado): se superpone al contenido con sombra `0 12px 32px rgba(0,0,0,.14)`.
  - **Fijado** ("Fijar menú" en el pie): empuja el contenido y va sin sombra. La preferencia se guarda en el navegador.
  - Transición de ancho .18s; los textos aparecen con opacidad .12s.
- **Proyecto (arriba)**: fila de 48px, margen inferior 10px. Cuadro **48×48 cuadrado a propósito**, radio 10, fondo blanco, padding 6px, logo con `object-fit: contain`.
  - **Cerrado: sin borde ni sombra** (centrado en el riel).
  - **Abierto: sombra sutil** `0 0 0 1px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.06)`, sin borde, y a su derecha el **nombre del proyecto**: 14px/600, interlineado 1.25, ancho 140px. **Un renglón si cabe; si es largo, dos renglones** (máximo; luego elipsis).
  - Clic: abre "Elegir proyecto". Tooltip "Cambiar proyecto".
- **Grupos** (Cartera, Recaudo, Comercial, Automatización, Gestión): bloque con 3px arriba/abajo y 1px entre ítems. **Línea #ececec entre grupos, visible abierto y cerrado.** Título del grupo 13px/500 #6b6b6b, alto 22px, solo visible abierto (ocupa su espacio siempre: nada salta al abrir).
- **Ítem**: alto 34px, radio 10, padding izquierdo 10px, ícono **19px de trazo 1.6** (íconos propios del diseño, `RailIcon`; un módulo nuevo agrega su trazo en `RAIL_ICON_PATHS`), 12px entre ícono y nombre, nombre 13.5px #141414.
  - Cerrado mide 40px; abierto, todo el ancho.
  - Hover #f4f4f4. **Activo: lima #cbe71e, texto 600.**
- **Pie** (línea superior #ececec, 6px arriba): Configuración, Fijar menú / Desfijar menú y **Cerrar sesión**, mismo estilo de ítem.
- Si los módulos no caben en alto, la lista hace scroll con desvanecido en el borde; el pie queda fijo.

### Selector de proyectos ("Elegir proyecto")
- Modal (`ModalProjectSelector`) con la grilla de tarjetas de proyecto: logo + nombre en una franja gris; el proyecto activo lleva la franja en lima.
- **Indicar que hay más**: si la grilla no cabe, se muestra la barra de scroll delgada y, abajo, un degradado con el botón **"Ver más proyectos ⌄"** que baja la lista. Desaparece al llegar al final.
- **Modo oscuro**: fondo del modal #1f1f1f, título y "×" claros. Las tarjetas siguen **blancas** (los logos están pensados sobre fondo claro) y el nombre siempre en #141414.

### Contenido — **la referencia es Clientes** (`/clientes/all`)
- Fondo #f7f7f7, padding `0 var(--page-pad-x) var(--page-pad-bottom)` (lo pone `ViewWrapper`).
- **El contenido arranca justo debajo del header**: sin `gap`, `margin` ni `padding-top` extra entre el header y el primer bloque.
- **Entre bloques** (fila de KPIs → tarjeta de tabla, tarjeta → tarjeta): `--section-gap`. Entre tarjetas de una misma fila: `--card-gap`.
- **Tarjetas**: blancas (`--cp-surface`), radio `--card-radius`, **sin borde y sin sombra**, padding `--card-pad`. Nada de `rounded-xl/2xl`, `shadow-*`, `border` ni radios de 8/12/16 en tarjetas.
- **Clases compartidas (obligatorias)** en `src/styles/tailwind.css`:
  - `cp-page`: raíz de la vista (columna con `--section-gap`). Si el `Header` es su hijo directo, se anula el gap bajo el header automáticamente.
  - `cp-card`: cualquier tarjeta/panel de contenido.
  - `cp-card-row`: fila de KPIs o tarjetas resumen.
  - `cp-control-fill` / `cp-on-page`: relleno inverso de controles (§8).
  - Componentes que ya las usan: `KpiCard`, `StatCards`, `PanelCard`. Usarlos antes que armar tarjetas a mano.
- **Nunca scroll horizontal**, ni en la página ni en las tablas.

---

## 4. Header de página (patrón obligatorio en todos los módulos)

Una sola línea, sticky, fondo #f7f7f7 (`--header-h`). Controles de **36px** (`--control-h`). Orden de izquierda a derecha:

1. **Volver "‹"**: solo el chevron (16px, trazo 2.4, #141414) sobre el gris, **sin recuadro ni borde**. Hace `history.back()`; si se entró por URL directa, va al listado padre (prop `back` del `Header`). Solo en pantallas de detalle o de segundo nivel.
2. **Bloque título**:
   - Título 18px/600. Mismo tamaño en todos los módulos.
   - **A su derecha, en la misma línea**, el control propio del título si lo hay (p. ej. el navegador de días de Visitas) o el corte (prop `titleExtra`).
   - **Corte y proyección: siempre `HeaderCutoff`** (`@/components/ui/header-cutoff`, diseño "Corte y Proyeccion" 7f), igual en Clientes, Cartera por edad y Torre de recaudo (esta última sin proyectar). Otros módulos sin foto muestran "● Actualizado …".
     - **Chip del corte**: blanco, 32px, radio 8, 13px #4a4a4a: `● Hoy 22:06 | ↻` (si el dato es de otro día: `26/10 22:06`). Punto #9bb514 (ámbar #f5b700 mientras actualiza). Separador 1×16 #ececec y botón "Reprocesar" de 32px (para no administradores, "Recargar"); el ícono da una vuelta al hacer clic. Al pasar el mouse: tarjeta de 260px (radio 12, sombra `0 12px 32px rgba(0,0,0,.16)`): "Hoy a las 22:06" · "Los datos se toman cada 30 minutos para que todos vean lo mismo. Próximo: 22:36."
     - **Píldora "Proyectar a cierre"**: 32px, radio 15, 13px; blanca apagada, **lima #cbe71e y 600 encendida** con "Proyectado a 31/10 ×" (clic vuelve a hoy). Tarjeta al pasar el mouse: "Estima cómo cerrará el mes (31/10)." / "Estás viendo cifras estimadas al cierre. Clic para volver a hoy."
     - 20px entre el título y el chip; 10px entre el chip y la píldora.
     - **Modo oscuro**: chip, píldora apagada y tarjeta en azul pizarra (#1c3240; tarjeta #17303d con borde blanco al 10%), texto claro y punto **lima #cbe71e**; la píldora encendida sigue lima con texto #141414.
3. **Espaciador flexible.**
4. **Chips de filtros aplicados** ("Zona: Norte, Suba ×"): 26px de alto, fondo blanco, radio 7, 13px. Alineados a la derecha y **pegados a la izquierda del botón Filtrar** (crecen hacia la izquierda). Si no caben, se recortan con "+N". Nunca saltan de línea ni mueven el buscador.
5. **Botón "Filtrar ▾"**: **sin borde**, relleno inverso (blanco sobre el gris del header, §8), radio 8, texto #8a8a8a 13px/500 (hover #141414), 36px, chevron 12px. Badge lima con el conteo cuando hay filtros activos. Abre el modal Filtros Avanzados (§6).
6. **Buscador fijo**: `HeaderSearch` (blanco sobre el gris), 300px (`--search-w`), 36px, placeholder corto ("Buscar cliente, NIT…", "Buscar informe"). **Su posición nunca cambia.** No se repite dentro de las tarjetas (salvo la excepción de abajo).
7. Botón "⋯" (opcional) para acciones del módulo.
8. **El tema (Claro / Oscuro / Sistema) NO va en el header**: está dentro del menú del avatar, solo en módulos con modo oscuro (el módulo publica su tema con `ThemeMenuContext`). Prohibido `WalletThemeToggle` u otro botón de tema en el header.
9. **Avatar** negro 34px + chevron 14px (`UserMenu`, ya incluido en `Header`): menú de 300px, radio 14: nombre 14.5/600 y correo · línea · **Tema** (selector segmentado; solo en módulos con modo oscuro) · Cambiar contraseña · línea · **Cerrar sesión** en magenta #e0007a. Cerrar sesión **pide confirmación**: modal de 400px "¿Cerrar sesión?" con Cancelar y el botón magenta. Va en **todas** las pantallas, siempre en el extremo derecho. Si una pantalla no puede usar `Header`, usa `UserMenu` (`@/components/organisms/header/user-menu/user-menu`), nunca un menú de perfil propio.

En resumen: **título a la izquierda**; a la derecha, leyendo desde el borde hacia adentro: avatar → buscador → Filtrar (+ chips) → botón primario del módulo si va en el header (p. ej. "Publicar informe", "Nueva encuesta").

- **Siempre el componente compartido**: `Header` (`@/components/organisms/header`, o `ViewWrapper` sin `hideHeader`). Props: `title`, `titleNode`, `titleExtra`, `actionsExtra`, `back`. Nada de headers propios con `<h1>` y `border-b`, ni buscadores/filtros con otro estilo.
- **Acciones del módulo** (Crear orden, Reglas de banco, "⋯ Generar acción", Dashboard…) van **dentro de la tarjeta blanca, arriba a la derecha**, o a la derecha de la fila de pestañas si la tarjeta tiene pestañas. Todas a 36px (§8). Un único botón primario de crear/publicar puede ir en el header, a la izquierda de Filtrar.
- **Nada de buscador ni Filtrar en el cuerpo de la vista** (p. ej. encima del mapa o de un panel): van en el header.
- **Excepción — tabla principal con búsqueda propia** (Clientes, Cartera por edad): el buscador va dentro de la tarjeta de la tabla porque busca sobre esa tabla; en ese caso el header no lleva buscador. Filtrar y el avatar siguen en el header.
- **Sin subtítulos que repiten el título** (p. ej. "Informes publicados" bajo "Informes"): se quitan y la tabla sube.
- **Indicadores de estado de la vista** (p. ej. "● En vivo 18:30" de Visitas) no van en una franja propia entre el header y el contenido: van **dentro** de la tarjeta o el mapa al que se refieren.

---

## 5. KPIs

- **Todos los KPIs en una sola fila** en escritorio (≥768px), nunca en dos: `grid-template-columns: repeat(N, minmax(0,1fr))` (o `StatCards`/`KpiCard`, que ya lo hacen). Si un texto no cabe, se corta con "…" (tooltip con el texto completo); la fila no salta. En móvil, de a dos.
- Tarjetas `cp-card` (§3), gap `--card-gap`.
- Estructura de una tarjeta: etiqueta (13px #6b6b6b, sin mayúsculas) → valor (29px/600, unidad "M" en 13px #6b6b6b) → a la derecha un valor de contraste (ej. "Vencida", "Meta") con chip de % → barra de 5px → leyenda en **una sola línea** de 13px.
- Una tarjeta puede agrupar 3 mini-KPIs (Notas / PNA / Novedades) separados por una línea vertical #ececec; valor 24px.
- Chip de %: 13px/600, padding 1px 6px, radio 5. Neutro #f2f2f2; positivo #cbe71e; riesgo #e0007a con texto blanco.
- Marca de meta en barras: línea negra de 2px con halo blanco.

---

## 6. Filtros — siempre con el modal "Filtros Avanzados"

Nunca filtros sueltos en la vista. Solo el botón Filtrar del header + chips.

- En código: `FilterModal` (`@/components/ui/filter-modal`) con **`inHeader`** cuando va en el header: pinta los chips a la izquierda de Filtrar (una línea, "+N") y entrega botón y chips como hijos directos del header. Sin `inHeader` es la barra de cuerpo (Filtrar + tags), solo para casos que no estén en el header. Los modales de filtros de cada módulo (p. ej. `ReportsFilterModal`, `SurveysFilterModal`) reciben `inHeader` y lo pasan a `FilterModal`.
- Las categorías que ya tienen su propio control visible en la vista (p. ej. Estado en Visitas/Cartera, Mercado en Clientes) pueden repetirse como chip, pero el control de la vista manda.

- Overlay oscuro suave; modal blanco ~900px (`max-width:100%`), radio 16, sombra grande.
- **Header:** ícono embudo lima en cuadro 36px fondo #f4f9d2 radio 8 · "Filtros Avanzados" (17px/600) · "Encuentra y selecciona múltiples opciones" (13px #6b6b6b) · X. Borde inferior #ececec.
- **Cuerpo, 2 columnas:**
  - Izquierda ~240px: categorías (14px #4a4a4a, filas 44px). Activa: negrita #141414, fondo #f7f7f7, barra lima 3px a la izquierda, chevron ">" a la derecha.
  - Derecha: buscador "Buscar en {categoría}…" (`SearchField`, relleno gris) · franja gris "N resultados" (13px/600, sin mayúsculas) + "Seleccionar todos" en lima · opciones en 2 columnas con círculo de selección (multi-selección).
- **Categoría Fecha:** "Selecciona un periodo" · periodos predefinidos (Hoy, Esta semana, Mes actual, Último mes, Último trimestre, YTD, Últimos 12 meses) en botones de 2 columnas (fondo #fafafa, borde #e3e3e3, radio 8) · separador · "Rango personalizado" con ícono calendario e inputs Desde/Hasta.
- **Footer:** "Limpiar todo" (texto 600 #4a4a4a) a la izquierda · "Cancelar" (texto 600 #141414) y **"Aplicar Filtros"** (lima #cbe71e, texto #141414 600, radio 10, 40px) a la derecha.
- Se edita en borrador; solo se aplica con "Aplicar Filtros"; Cancelar o X descartan.

---

## 7. Tablas

**Todas las tablas de la app se ven como la de Clientes.** Da igual cómo estén hechas: antd `Table`, `<table>` a mano, `SortableTh`, `TableHead` de chat/ui, tablas de grupos, tablas dentro de modales.

### Encabezado (obligatorio)

| Propiedad | Valor |
|---|---|
| Fondo | El de la tarjeta: **blanco** (`--cp-surface`). Nunca gris ni `bg-muted` |
| Texto | **13.5px / 600 #141414** (`text-cp-ink`). Nunca gris |
| Mayúsculas | **No.** "Fecha factura", no "FECHA FACTURA" |
| Bordes | Solo borde inferior #ececec (`--cp-line`). Sin separadores verticales |
| Posición | **Sticky** |
| Ícono de orden | **`SortArrows`**, pegado al título (4px) |

**Ícono de orden — `SortArrows`** (`@/components/ui/sort-arrows`): dos triángulos de 7×4px apilados (▲ arriba, ▼ abajo), 1px entre ellos.
- Sin orden: los dos grises #c4c4c4.
- Ascendente: el de arriba en #141414. Descendente: el de abajo en #141414.
- Va **a la derecha del título**; en columnas alineadas a la derecha (montos), el ícono va a la izquierda del título para que el título quede pegado al borde.
- Prohibidos: ↕, ▲▼ como texto, `ArrowUpDown`/`CaretUp` de lucide/phosphor, el sorter por defecto de antd.

```tsx
import SortArrows from "@/components/ui/sort-arrows";

<th className="border-b border-cp-line bg-cp-surface px-3 py-3 text-left text-[13.5px] font-semibold text-cp-ink">
  <button className="inline-flex items-center gap-1" onClick={() => onSort("monto")}>
    Monto <SortArrows dir={sort.col === "monto" ? sort.dir : null} />
  </button>
</th>
```

- Para tablas hechas a mano, usar `SortableTh` (ya trae todo lo anterior).
- **Tablas antd:** no hay que hacer nada. La regla global de `src/styles/globals.scss` (`.ant-table-thead`) ya pone fondo blanco, 13.5px/600 #141414, borde inferior y el sorter gris/negro. No sobrescribirla por módulo.

### Cuerpo
- **No cambiar la UX existente de las tablas** al ajustar estilo: se conservan las columnas y la información de cada celda.
- Tarjeta de tabla: título 18px/600 + leyenda (mercados, 13px, swatches de 8px radio 2), **todo en una línea**. Textos de ayuda ("clic en un mercado para filtrar…") van en tooltip del título. Si la leyenda no cabe, se recorta con "+N"; nunca segunda línea. Sin buscador dentro de la tarjeta, **salvo** la tabla principal con búsqueda propia (Clientes, Cartera por edad, §4).
- Filas:
  - Con sub-línea (ej. Clientes): nombre del cliente 13px/500 **enlace azul #1677ff** con ellipsis; debajo `Ejecutivo · ■ Mercado` en 13px #6b6b6b (el ejecutivo es obligatorio).
  - Una sola línea: más baja (`--table-row-h-single`).
  - Borde inferior #f2f2f2. Números alineados a la derecha.
- Mini-barras dentro de celdas: aging de 3px bajo el monto; progreso de 4px en línea con valor y %.
- **Fila Total sticky abajo** (fondo #fafafa, borde superior #ececec, 600). El cuerpo hace scroll interno.
- Columnas en `grid` con `minmax(0,…)` y `gap:12px`. Nunca se solapan encabezados.
- Responsive: la tabla mide su ancho y **oculta columnas secundarias por prioridad**; en angosto pasa a filas-tarjeta apiladas. Nunca scroll horizontal.

### Contador de resultados
"4 informes", "2 de 5", "2.816 clientes": va al **pie** de la tabla, alineado a la derecha, 13px gris (`text-muted-foreground`). **Nunca arriba de la tabla** (deja un hueco arriba). Solo se muestra cuando hay datos (no mientras carga ni en el estado vacío).

---

## 7b. Grupos por estado y pestañas

### Grupos por estado (Mis pedidos, Bancos, Saldos, Conciliación, pestañas del cliente)
**Referencia: Saldos.** Todos los desplegables por estado (estilo ClickUp: tag de estado + monto + cantidad, al abrir se ve la tabla) se ven igual que en Saldos. Siempre con `Collapse` + `LabelCollapse` (`@/components/ui/collapse`, `@/components/ui/label-collapse`), **sin estilos propios por módulo**; solo cambian las columnas de la tabla.
- **Aire**: 1.5rem entre grupos (arriba del encabezado y abajo de cada grupo), línea gris entre grupos, contenido con sangría de 1rem. La tarjeta que los contiene lleva **padding de 1.5rem**: nada va pegado al borde.
- **Tag de estado**: 14px/400, padding 6px 12px, radio 8, color que manda el API. Al lado, monto (14px/600) y cantidad (14px/300) con íconos de billete y documentos, al 50% de opacidad, sobre fondo gris.
- **Tabla del grupo**: encabezado igual al de Clientes (§7); celdas a 16px con padding vertical de 0.4rem. Sub-líneas nunca por debajo de 13px.
- **No compactar.** Se probó la versión compacta del diseño "Pedidos y Bancos" (fila de 40px, tags de 26px, tabla a 13px/42px) y se revirtió el 29/10/2026: se veía todo pegado.

### Pestañas (`UiTab`)
- Fila de 48px con línea #ececec; 22px entre pestañas.
- Pestaña: 13.5px #8a8a8a/500. **Activa: #141414/600** con subrayado negro de 2px.
- Acciones del módulo a la derecha de la fila de pestañas.
- **16px de aire entre la línea de las pestañas y el contenido** (barra de botones, tarjetas del dashboard). Ya lo pone `UiTab`; no anularlo con márgenes negativos.

---

## 8. Botones y controles

### Barra de acciones (regla de los 36px)
La fila sobre la tabla (buscador, "⋯ Generar acción", Filtrar/selectores/fechas, botones secundarios como "Dashboard" y el CTA lima como "Crear orden"): **todos los controles miden lo mismo que el buscador, 36px (`--control-h`)**, centrados en la fila, texto de botones 14px e íconos de ~18px. Ancho, color y radio de cada uno se mantienen. **Referencia: Mis pedidos.**
- `GenerateActionButton` y `DotsDropdown` ya vienen a 36px.
- Un `<Button size="large">`, `PrincipalButton` o botón propio en una barra se ajusta a `height: var(--control-h)`.
- En el header aplica igual: todo a 36px.

### Relleno inverso (Filtrar, ⋯, buscador)
Todo control **sin borde** tiene el relleno contrario a la superficie donde está:

| Está sobre… | Relleno del control |
|---|---|
| El gris de la página (header, zonas fuera de tarjetas) | **Blanco** |
| Una tarjeta blanca o un modal | **Gris** `--cp-bg` |

- Nunca blanco sobre blanco ni gris sobre gris.
- En código: el control lleva `cp-control-fill` (gris por defecto); cualquier contenedor sobre el gris de la página lleva `cp-on-page` y lo vuelve blanco. El contenedor de acciones del `Header` ya lleva `cp-on-page`. El buscador lo resuelve con `surface="page"` / `surface="card"`.

### Tipos

| Tipo | Estilo |
|---|---|
| Primario | Lima #cbe71e, texto #141414 600, radio 8–10, **36px en barras y header**, 40px solo en el footer de modales/formularios. Hover #9bb514 |
| Secundario | Blanco, borde 1px #e3e3e3, radio 8, texto #8a8a8a/#141414, 36px |
| "⋯" Generar acción | Cuadrado de 36px, ícono de tres puntos 18px, tooltip "Generar acción" |
| Texto | Sin fondo, 600, #141414 o #4a4a4a |
| Input | 36px, radio 8, fondo blanco (o #fafafa con borde #e3e3e3 dentro de modales) |
| **Buscador** | **Uno solo en toda la app:** `SearchField` (`@/components/ui/search-field`). 36px, radio 8, sin borde, lupa 15px #141414, texto 13px/500, placeholder #9a9a9a, "×" para limpiar. Relleno inverso (`surface="card"` gris por defecto; `surface="page"` blanco). `HeaderSearch`, `UiSearchInput` y `UiSearchInputLong` son envoltorios del mismo componente. Prohibido armar buscadores a mano con `<input>`/`<Input>` + lupa |
| Filtrar / ⋯ | Sin borde, relleno inverso, radio 8, 36px |
| Switch | 22×12 (`MiniSwitch`); en el header la proyección es la píldora de `HeaderCutoff`, no un switch |
| Chip removible | 26px, fondo blanco, radio 7, 13px, "×" #8a8a8a |

Hit targets ≥ 28px en desktop.

### Modo oscuro
- Solo en los módulos que lo tienen; el tema se elige en el **menú del avatar** (§4.9), nunca con un botón en el header. El layout pone `.dark` en el `<main>` y la clase `wallet-dark` (o `comercio-dark` / `dashboard-dark`) en `<body>`.
- Colores siempre con los tokens `cp-*` / `--cp-*` (tienen valor oscuro); nada de `#fff`/`#141414` sueltos en superficies ni en encabezados de tabla.
- **Modales, popovers y dropdowns** se pintan en un portal fuera del `<main>`: su modo oscuro se escribe colgando de `body.wallet-dark, body.comercio-dark, body.dashboard-dark` (fondo #1f1f1f, texto claro). Revisar siempre que el texto no quede blanco sobre blanco.

---

## 9. Responsive — reglas duras

- Nunca scroll horizontal (página, tablas, modales).
- `min-width:0` en hijos flex/grid; grids con `minmax(0,…)` / `auto-fill`; filas que hacen wrap.
- Modales con `max-width:100%`.
- El único zoom permitido es el global existente; no agregar `zoom`/`transform: scale` por componente.
- Alturas con `100%`/flex, no `100vh` fijo en contenedores internos.

---

## 10. Checklist por pantalla (antes de pasar a revisión)

**Textos**
- [ ] Ningún texto ni número por debajo de 13px (§1).
- [ ] Ningún texto en mayúscula sostenida; sin `uppercase` ni `tracking-*` (§1).
- [ ] Sin colores pastel; colores con tokens `cp-*`.

**Estructura**
- [ ] Raíz con `cp-page`; tarjetas con `cp-card` (o `KpiCard`/`StatCards`/`PanelCard`); sin espacio extra bajo el header. Comparada lado a lado con Clientes, se ve igual.
- [ ] Header compartido (`Header`) en el orden de §4; buscador fijo a la derecha; chips a la izquierda de Filtrar; avatar con "Cerrar sesión" (también en detalle y subpantallas).
- [ ] Sin botón de tema en el header.
- [ ] "‹" volver sin recuadro en pantallas de detalle.
- [ ] Sin subtítulos que repiten el título.
- [ ] Corte + "Proyectar a cierre" con `HeaderCutoff` (si aplica).

**Controles**
- [ ] Todos los buscadores son `SearchField` / `HeaderSearch`.
- [ ] Filtros solo vía modal Filtros Avanzados (`FilterModal inHeader`).
- [ ] Todos los controles de cada barra miden 36px (buscador, Filtrar, ⋯, botones, CTA).
- [ ] Filtrar, ⋯ y buscador con relleno inverso (blanco sobre gris, gris sobre blanco).

**Tablas**
- [ ] Encabezado como Clientes: blanco, 13.5px/600 #141414, sin mayúsculas, sticky.
- [ ] Ícono de orden `SortArrows` (o el global de antd); ningún otro.
- [ ] Contador de resultados al pie, a la derecha.
- [ ] Fila total sticky, UX de columnas intacta, nombres de cliente en azul.
- [ ] Grupos por estado con `Collapse` + `LabelCollapse`, iguales a Saldos.
- [ ] 16px entre las pestañas y el contenido.

**General**
- [ ] KPIs en una sola fila, leyendas en una línea.
- [ ] Si tiene modo oscuro: modales, popovers y encabezados de tabla legibles en oscuro.
- [ ] Sin scroll horizontal en 1280×550, 1366×620 y 1920×1080.
- [ ] Capturas antes/después en el PR.

Referencias visuales: `Cashport 14 pulgadas.dc.html` (pantalla Clientes), `Menu Lateral Cashport.html` (menú lateral 6e) y `Corte y Proyeccion Cashport.html` (corte, proyección y menú del avatar 7f).
