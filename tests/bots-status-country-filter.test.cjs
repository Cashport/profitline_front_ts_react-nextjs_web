const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const VIEW = "src/modules/dataQuality/containers/AutomationsView/AutomationsView.tsx";
const HOOK = "src/modules/dataQuality/hooks/useBotsStatus.ts";
const CARDS =
  "src/modules/dataQuality/components/automation-status-cards/automation-status-cards.tsx";

const COUNTRIES = [
  { id: 1, country_name: "Colombia", address_format: "" },
  { id: 9, country_name: "Brasil", address_format: "" },
  { id: 10, country_name: "Argentina", address_format: "" },
  { id: 42, country_name: "Uruguay", address_format: "" }
];

let scheduleId = 1;
const bot = (id_country, pais, cliente, estado, name = "Stock") => ({
  schedule_id: scheduleId++,
  id_client_data: scheduleId,
  id_country,
  pais,
  cliente,
  bot: name,
  estado
});

const summaryOf = (rows) =>
  rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.estado] += 1;
      return acc;
    },
    {
      total: 0,
      EXITOSO: 0,
      FALLIDO: 0,
      EN_REVISION: 0,
      EN_EJECUCION: 0,
      PENDIENTE: 0,
      SIN_EJECUCIONES: 0
    }
  );

const AR = [
  bot(10, "Argentina", "Jumbo Cuyo", "EN_REVISION"),
  bot(10, "Argentina", "Jumbo Córdoba", "EN_REVISION"),
  bot(10, "Argentina", "Jumbo Buenos Aires", "EXITOSO"),
  bot(10, "Argentina", "La Anónima", "FALLIDO")
];
const BR = [
  bot(9, "Brasil", "DPC DIST ATACADISTA S/A", "EXITOSO", "Stock"),
  bot(9, "Brasil", "DPC DIST ATACADISTA S/A", "EXITOSO", "Sell Out"),
  bot(9, "Brasil", "Armazem", "FALLIDO"),
  bot(9, "Brasil", "Carrefour", "EN_REVISION"),
  bot(9, "Brasil", "Dimed", "EN_EJECUCION")
];
const CO = [
  bot(1, "Colombia", "Cliente CO 1", "FALLIDO"),
  bot(1, "Colombia", "Cliente CO 2", "PENDIENTE")
];
const ALL = [...AR, ...BR, ...CO];

const response = (rows) => ({
  status: 200,
  message: "Listado de estatus de bots",
  summary: summaryOf(rows),
  data: rows
});

function loadModule(file, mocks) {
  const output = ts.transpileModule(readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", output)(
    (name) => {
      assert.ok(name in mocks, `Unexpected dependency in ${file}: ${name}`);
      return mocks[name];
    },
    loaded,
    loaded.exports
  );
  return loaded.exports;
}

const jsx = (type, props) => ({ type, props });
const jsxRuntime = { jsx, jsxs: jsx, Fragment: "Fragment" };

function createSwr() {
  const store = {};
  const errors = {};
  const requested = [];
  const useSWR = (key) => {
    requested.push(key);
    const settled = key in store || key in errors;
    return {
      data: store[key],
      error: errors[key],
      isLoading: !settled,
      mutate: async () => undefined
    };
  };
  return { store, errors, requested, module: { __esModule: true, default: useSWR } };
}

function createHarness() {
  const slots = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = typeof value === "function" ? value(slots[index]) : value;
        }
      ];
    },
    useMemo: (factory) => factory()
  };
  const swr = createSwr();
  const api = { fetcher: async () => undefined };
  const hook = loadModule(HOOK, { swr: swr.module, "@/utils/api/api": api });
  const view = loadModule(VIEW, {
    react,
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { useRouter: () => ({ push: () => undefined }) },
    antd: { Select: "AntSelect", message: { success() {}, error() {} } },
    swr: swr.module,
    "@/components/organisms/header": { __esModule: true, default: "Header" },
    "@/components/ui/search-input": { __esModule: true, default: "UiSearchInput" },
    "@/services/dataQuality/dataQuality": { runBotNow: async () => ({ accepted: true }) },
    "@/utils/api/api": api,
    "@/hooks/useConfirmBotExecution": {
      useConfirmBotExecution: () => ({ requestExecution: () => undefined, confirmationModal: null })
    },
    "../../components/automation-status-cards": { AutomationStatusCards: "AutomationStatusCards" },
    "../../components/bots-table": { BotsTable: "BotsTable" },
    "../../components/bot-history-drawer": { BotHistoryDrawer: "BotHistoryDrawer" },
    "../../hooks/useBotsStatus": hook
  });

  const render = () => {
    cursor = 0;
    swr.requested.length = 0;
    const tree = view.default();
    const find = (type) => {
      const stack = [tree];
      while (stack.length) {
        const node = stack.pop();
        if (!node) continue;
        if (Array.isArray(node)) {
          stack.push(...node);
          continue;
        }
        if (typeof node !== "object") continue;
        if (node.type === type) return node.props;
        if (node.props) stack.push(node.props.children);
      }
      throw new Error(`${type} not rendered`);
    };
    return {
      cards: find("AutomationStatusCards"),
      table: find("BotsTable"),
      select: find("AntSelect"),
      search: find("UiSearchInput"),
      requested: [...swr.requested]
    };
  };

  return { swr, render, hook };
}

const KEY_ALL = "/data/bots/status";
const keyFor = (id) => `/data/bots/status?id_country=${id}`;

function ready() {
  const harness = createHarness();
  harness.swr.store["/country"] = { status: 200, message: "ok", data: COUNTRIES };
  harness.swr.store[KEY_ALL] = response(ALL);
  harness.swr.store[keyFor(9)] = response(BR);
  harness.swr.store[keyFor(10)] = response(AR);
  harness.swr.store[keyFor(1)] = response(CO);
  harness.swr.store[keyFor(42)] = response([]);
  return harness;
}

const cardValues = (summary) => ({
  total: summary.total,
  operativo: summary.EXITOSO,
  conFallas: summary.FALLIDO,
  enRevision: summary.EN_REVISION,
  ejecutando: summary.EN_EJECUCION
});

test("initial render requests every country and shows the global summary", () => {
  const { render } = ready();
  const view = render();
  assert.ok(view.requested.includes(KEY_ALL));
  assert.equal(view.select.value, "all");
  assert.deepEqual(cardValues(view.cards.summary), {
    total: 11,
    operativo: 3,
    conFallas: 3,
    enRevision: 3,
    ejecutando: 1
  });
  assert.equal(view.table.bots.length, ALL.length);
  assert.equal(view.table.totalBots, ALL.length);
});

test("country options come from the /country catalog, not from the bot rows", () => {
  const { render } = ready();
  const { select } = render();
  assert.deepEqual(select.options, [
    { label: "Todos los países", value: "all" },
    { label: "Colombia", value: 1 },
    { label: "Brasil", value: 9 },
    { label: "Argentina", value: 10 },
    { label: "Uruguay", value: 42 }
  ]);
});

for (const [name, id, rows] of [
  ["Brasil", 9, BR],
  ["Argentina", 10, AR],
  ["Colombia", 1, CO]
]) {
  test(`selecting ${name} drives cards and table from the same response`, () => {
    const { render } = ready();
    render().select.onChange(id);
    const view = render();
    assert.ok(view.requested.includes(keyFor(id)));
    assert.ok(!view.requested.includes(KEY_ALL));
    assert.deepEqual(view.cards.summary, summaryOf(rows));
    assert.deepEqual(
      view.table.bots.map((row) => row.schedule_id),
      rows.map((row) => row.schedule_id)
    );
    assert.ok(view.table.bots.every((row) => row.id_country === id));
    assert.equal(view.table.totalBots, view.cards.summary.total);
  });
}

test("Argentina acceptance case: 4 / 1 / 1 / 2 / 0", () => {
  const { render } = ready();
  render().select.onChange(10);
  assert.deepEqual(cardValues(render().cards.summary), {
    total: 4,
    operativo: 1,
    conFallas: 1,
    enRevision: 2,
    ejecutando: 0
  });
});

test("going back to all countries restores the global summary", () => {
  const { render } = ready();
  render().select.onChange(9);
  render().select.onChange("all");
  const view = render();
  assert.deepEqual(view.cards.summary, summaryOf(ALL));
  assert.equal(view.table.bots.length, ALL.length);
});

test("country without bots shows zeros and an empty table", () => {
  const { render } = ready();
  render().select.onChange(42);
  const view = render();
  assert.deepEqual(cardValues(view.cards.summary), {
    total: 0,
    operativo: 0,
    conFallas: 0,
    enRevision: 0,
    ejecutando: 0
  });
  assert.deepEqual(view.table.bots, []);
  assert.equal(view.table.emptyText, "Sin bots disponibles");
});

test("while a country loads the cards never show the previous (global) numbers", () => {
  const { render, swr } = ready();
  delete swr.store[keyFor(9)];
  render().select.onChange(9);
  const view = render();
  assert.equal(view.cards.summary, undefined);
  assert.equal(view.table.loading, true);
  assert.deepEqual(view.table.bots, []);
});

test("API error hides the numbers and shows an error message in the table", () => {
  const { render, swr } = ready();
  delete swr.store[keyFor(10)];
  swr.errors[keyFor(10)] = new Error("boom");
  render().select.onChange(10);
  const view = render();
  assert.equal(view.cards.summary, undefined);
  assert.deepEqual(view.table.bots, []);
  assert.equal(view.table.emptyText, "No se pudo cargar el estado de los bots");
});

test("rapid changes: a late response for a previous country never replaces the current one", () => {
  const { render, swr } = ready();
  delete swr.store[keyFor(10)];
  delete swr.store[keyFor(9)];
  delete swr.store[keyFor(1)];
  render().select.onChange(10);
  render().select.onChange(9);
  render().select.onChange(1);
  swr.store[keyFor(1)] = response(CO);
  swr.store[keyFor(10)] = response(AR);
  swr.store[keyFor(9)] = response(BR);
  const view = render();
  assert.deepEqual(view.cards.summary, summaryOf(CO));
  assert.ok(view.table.bots.every((row) => row.pais === "Colombia"));
});

test("search narrows the table inside the selected country but cards keep the country summary", () => {
  const { render } = ready();
  render().select.onChange(9);
  render().search.onChange({ target: { value: "carrefour" } });
  const view = render();
  assert.deepEqual(
    view.table.bots.map((row) => row.cliente),
    ["Carrefour"]
  );
  assert.deepEqual(view.cards.summary, summaryOf(BR));
});

test("status card filter narrows the table only within the selected country", () => {
  const { render } = ready();
  render().select.onChange(10);
  render().cards.onStatusClick("EN_REVISION");
  const view = render();
  assert.deepEqual(
    view.table.bots.map((row) => row.cliente),
    ["Jumbo Cuyo", "Jumbo Córdoba"]
  );
  assert.equal(view.cards.summary.total, 4);
});

test("hook builds one SWR key per country and none for all countries", () => {
  const { hook } = createHarness();
  assert.equal(hook.getBotsStatusKey(), KEY_ALL);
  assert.equal(hook.getBotsStatusKey(9), keyFor(9));
  assert.equal(hook.getBotsStatusKey(77), keyFor(77));
});

test("summary cards render backend values and a placeholder when there is no summary", () => {
  const cards = loadModule(CARDS, {
    "react/jsx-runtime": jsxRuntime,
    "@/utils/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    "../../constants": {
      BOT_STATUS_META: {
        EXITOSO: { label: "Operativo" },
        FALLIDO: { label: "Con fallas" },
        EN_REVISION: { label: "En revisión" },
        EN_EJECUCION: { label: "Ejecutando" }
      }
    }
  });
  const values = (tree) =>
    [tree.props.children[0], ...tree.props.children[1]].map((card) => [
      card.props.children[0].props.children,
      card.props.children[1].props.children
    ]);

  const withSummary = cards.AutomationStatusCards({
    summary: summaryOf(AR),
    statusFilter: "all",
    onStatusClick: () => undefined
  });
  assert.deepEqual(values(withSummary), [
    ["Total de bots", 4],
    ["Operativo", 1],
    ["Con fallas", 1],
    ["En revisión", 2],
    ["Ejecutando", 0]
  ]);

  const loading = cards.AutomationStatusCards({
    summary: undefined,
    statusFilter: "all",
    onStatusClick: () => undefined
  });
  assert.ok(values(loading).every(([, value]) => value === "—"));
});
