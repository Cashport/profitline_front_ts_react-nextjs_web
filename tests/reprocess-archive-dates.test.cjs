/* eslint @typescript-eslint/no-unused-vars: "off", no-unused-vars: "error" */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const realDayjs = require("dayjs");

const root = path.resolve(__dirname, "..");
const utilsFile = "src/modules/dataQuality/utils/reprocessArchiveDates.ts";
const modalFile = "src/modules/dataQuality/components/ModalReprocessDates/ModalReprocessDates.tsx";
const archivesFile =
  "src/modules/dataQuality/components/ClientDetailArchives/client-detail-archives.tsx";

// Fecha fija dentro de un mes de 30 dias, a una hora en la que toISOString() correria el
// dia en zonas horarias negativas como Colombia.
const TODAY = "2026-11-17T20:30:00";
const CLIENT_ID = "57";

function fixedDayjs(...args) {
  return args.length === 0 ? realDayjs(TODAY) : realDayjs(...args);
}
Object.assign(fixedDayjs, realDayjs);
const dayjsMock = { __esModule: true, default: fixedDayjs };

function loadModule(file, mocks) {
  const output = ts.transpileModule(readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true
    }
  }).outputText;
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", output)(
    (name) => {
      if (name.startsWith("@/types/")) return {};
      if (name.endsWith(".scss")) return {};
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
    loadedModule,
    loadedModule.exports
  );
  return loadedModule.exports;
}

const utils = loadModule(utilsFile, { dayjs: dayjsMock });

test("el ultimo dia del mes se calcula en local y se formatea YYYY-MM-DD", () => {
  const cases = [
    ["2026-11-17T20:30:00", "2026-11-01", "2026-11-30"],
    ["2026-02-05T00:10:00", "2026-02-01", "2026-02-28"],
    ["2028-02-29T23:45:00", "2028-02-01", "2028-02-29"],
    ["2026-12-31T23:59:00", "2026-12-01", "2026-12-31"],
    ["2026-01-01T00:00:00", "2026-01-01", "2026-01-31"]
  ];
  for (const [today, expectedStart, expectedEnd] of cases) {
    const reference = realDayjs(today);
    assert.equal(utils.formatReprocessDate(utils.getCurrentMonthStart(reference)), expectedStart);
    assert.equal(utils.formatReprocessDate(utils.getCurrentMonthEnd(reference)), expectedEnd);
  }
});

test("el ultimo dia del mes no se corre a UTC como lo haria toISOString", () => {
  const monthEnd = utils.getCurrentMonthEnd(realDayjs("2026-11-17T20:30:00"));
  const formatted = utils.formatReprocessDate(monthEnd);
  assert.equal(formatted, "2026-11-30");
  assert.equal(formatted, `${monthEnd.year()}-11-${String(monthEnd.date()).padStart(2, "0")}`);
});

test("con Inicio de mes la llave from_date no existe en el payload", () => {
  const payload = utils.buildReprocessPayload({
    startFrom: "month_start",
    idClientData: 57
  });
  assert.deepEqual(Object.keys(payload).sort(), ["id_client_data", "start_from"]);
  // ni presente ni null: el backend solo salta la validacion con undefined
  assert.equal("from_date" in payload, false);
  assert.equal(payload.start_from, "month_start");
  assert.equal(payload.id_client_data, 57);
  assert.equal(JSON.stringify(payload).includes("from_date"), false);
});

test("con Fecha especifica from_date va en formato exacto YYYY-MM-DD", () => {
  const chosen = realDayjs("2026-11-10T23:30:00");
  const payload = utils.buildReprocessPayload({
    startFrom: "specific_date",
    idClientData: 57,
    date: chosen
  });
  assert.equal(payload.start_from, "specific_date");
  assert.equal(payload.id_client_data, 57);
  assert.equal(payload.from_date.length, 10);
  assert.match(payload.from_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(payload.from_date.includes("T"), false);
  assert.equal(payload.from_date, "2026-11-10");
  assert.equal(payload.from_date, chosen.format("YYYY-MM-DD"));
});

test("id_client_data es obligatorio para no disparar un reproceso masivo", () => {
  for (const idClientData of [undefined, NaN, 0, -1]) {
    assert.throws(() => utils.buildReprocessPayload({ startFrom: "month_start", idClientData }));
  }
  assert.throws(() =>
    utils.buildReprocessPayload({ startFrom: "specific_date", idClientData: 57, date: undefined })
  );
});

test("el detalle del 400 se lee tanto de data[].msg como de message", () => {
  assert.equal(
    utils.getReprocessErrorDetail("Invalid params", [
      { msg: "from_date debe ser YYYY-MM-DD", path: "from_date" },
      { msg: "id_client_data es obligatorio", path: "id_client_data" }
    ]),
    "from_date debe ser YYYY-MM-DD, id_client_data es obligatorio"
  );
  assert.equal(
    utils.getReprocessErrorDetail("from_date no puede ser anterior a 2026-11-01", null),
    "from_date no puede ser anterior a 2026-11-01"
  );
  assert.equal(utils.getReprocessErrorDetail("Invalid params", []), "Invalid params");
});

// ---- Modal ----

const RadioMock = { Group: "Radio.Group" };

function renderModal() {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const sent = [];
  const notifications = { success: [], error: [] };
  const jsx = (type, props) => ({ type, props });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = value;
        }
      ];
    },
    useEffect(fn) {
      effects.push(fn);
    },
    useMemo(fn) {
      return fn();
    }
  };
  const mocks = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    dayjs: dayjsMock,
    antd: {
      Modal: "Modal",
      Radio: RadioMock,
      message: {
        success: (text) => notifications.success.push(text),
        error: (text) => notifications.error.push(text)
      }
    },
    "@phosphor-icons/react": { CaretLeft: "CaretLeft" },
    "@/services/dataQuality/dataQuality": {
      reprocessArchiveDates: async (payload) => {
        sent.push(payload);
        return { scope: "client", fromDate: "", toDate: "", summary: {}, details: [] };
      }
    },
    "@/utils/api/api": { ApiError: class ApiError extends Error {} },
    "@/components/atoms/inputs/InputDate/InputDate": { InputDate: "InputDate" },
    "@/components/atoms/FooterButtons/FooterButtons": {
      __esModule: true,
      default: "FooterButtons"
    },
    "../../utils/reprocessArchiveDates": utils
  };
  const ModalReprocessDates = loadModule(modalFile, mocks).default;

  const walk = (node, visit) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((child) => walk(child, visit));
      return;
    }
    visit(node);
    walk(node.props && node.props.children, visit);
  };

  return () => {
    cursor = 0;
    effects.length = 0;
    const tree = ModalReprocessDates({
      isOpen: true,
      clientId: CLIENT_ID,
      onClose: () => {},
      onSuccess: () => {}
    });
    effects.forEach((effect) => effect());
    const found = new Map();
    const texts = [];
    walk(tree, (node) => {
      if (!found.has(node.type)) found.set(node.type, node.props);
      if (typeof (node.props && node.props.children) === "string") {
        texts.push(node.props.children);
      }
    });
    return {
      footer: found.get("FooterButtons"),
      datePicker: found.get("InputDate"),
      radioGroup: found.get("Radio.Group"),
      texts,
      sent,
      notifications
    };
  };
}

test("Inicio de mes viene seleccionada y el boton Reprocesar esta habilitado", () => {
  const render = renderModal();
  const view = render();
  assert.equal(view.radioGroup.value, "month_start");
  assert.equal(view.footer.titleConfirm, "Reprocesar");
  assert.equal(view.footer.isConfirmDisabled, false);
  assert.equal(view.datePicker, undefined);
  assert.ok(view.texts.includes("Se reprocesará del 01/11/2026 al 30/11/2026."));
});

test("Fecha especifica sin fecha deja el boton deshabilitado", () => {
  const render = renderModal();
  render().radioGroup.onChange({ target: { value: "specific_date" } });
  const view = render();
  assert.equal(view.footer.isConfirmDisabled, true);
  assert.ok(view.texts.includes("Selecciona la fecha desde la que se reprocesará."));
  assert.equal(view.datePicker.placeholder, "Seleccionar fecha");
  assert.equal(utils.formatReprocessDate(view.datePicker.minDate), "2026-11-01");
  assert.equal(utils.formatReprocessDate(view.datePicker.maxDate), "2026-11-30");
});

test("Inicio de mes envia el payload sin from_date y con id_client_data", async () => {
  const render = renderModal();
  await render().footer.handleOk();
  const view = render();
  assert.equal(view.sent.length, 1);
  assert.deepEqual(view.sent[0], { start_from: "month_start", id_client_data: 57 });
  assert.equal("from_date" in view.sent[0], false);
  assert.deepEqual(view.notifications.success, [
    "Reproceso solicitado del 01/11/2026 al 30/11/2026."
  ]);
});

test("Fecha especifica envia from_date YYYY-MM-DD y avisa hasta el ultimo dia del mes", async () => {
  const render = renderModal();
  render().radioGroup.onChange({ target: { value: "specific_date" } });
  render().datePicker.onChange(realDayjs("2026-11-10T23:30:00"));
  const ready = render();
  assert.equal(ready.footer.isConfirmDisabled, false);
  await ready.footer.handleOk();
  const view = render();
  assert.deepEqual(view.sent[0], {
    start_from: "specific_date",
    id_client_data: 57,
    from_date: "2026-11-10"
  });
  // el "hasta" es el ultimo dia del mes, no el toDate exclusivo de la respuesta
  assert.deepEqual(view.notifications.success, [
    "Reproceso solicitado del 10/11/2026 al 30/11/2026."
  ]);
});

test("el boton y el modal estan gateados por la misma condicion que Crear nuevo archivo", () => {
  const archives = readFileSync(path.join(root, archivesFile), "utf8");
  assert.match(
    archives,
    /canManage && \(\s*<Button\s+onClick=\{\(\) => setIsReprocessDatesModalOpen\(true\)\}/
  );
  assert.equal((archives.match(/canManage && \(/g) || []).length, 3);
  assert.match(archives, /<ModalReprocessDates[\s\S]*?clientId=\{clientId\}/);
});
