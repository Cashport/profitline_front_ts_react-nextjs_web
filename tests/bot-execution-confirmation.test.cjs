/* eslint @typescript-eslint/no-unused-vars: "off", no-unused-vars: "error" */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const hookFile = "src/hooks/useConfirmBotExecution.tsx";
const botA = { bot: "Bot ventas", schedule_id: 11 };
const botB = { bot: "Bot inventario", schedule_id: 22 };

function renderConfirmation(onExecute) {
  const slots = [];
  let cursor = 0;
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
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    }
  };
  const output = ts.transpileModule(readFileSync(path.join(root, hookFile), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  const loadedModule = { exports: {} };
  const mocks = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    antd: { Modal: "Modal", Typography: { Paragraph: "Paragraph", Text: "Text" } },
    "@/components/atoms/FooterButtons/FooterButtons": { default: "FooterButtons" }
  };
  new Function("require", "module", "exports", output)(
    (name) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
    loadedModule,
    loadedModule.exports
  );
  return () => {
    cursor = 0;
    const result = loadedModule.exports.useConfirmBotExecution(onExecute);
    return {
      ...result,
      modal: result.confirmationModal.props,
      footer: result.confirmationModal.props.footer.props
    };
  };
}

test("requesting execution opens confirmation without running the bot", () => {
  const calls = [];
  const render = renderConfirmation(async (bot) => {
    calls.push(bot);
  });
  assert.equal(render().modal.open, false);
  render().requestExecution(botA);
  const { modal, footer } = render();
  assert.equal(modal.open, true);
  assert.equal(modal.title, "Confirmar ejecución");
  assert.equal(modal.children[0].props.children, "¿Está seguro de que desea ejecutar este bot?");
  assert.equal(modal.children[1].props.children[1], botA.bot);
  assert.equal(footer.titleCancel, "Cancelar");
  assert.equal(footer.titleConfirm, "Sí, ejecutar");
  assert.deepEqual(calls, []);
});

for (const action of ["cancel", "close"]) {
  test(`${action} dismisses without executing`, () => {
    let calls = 0;
    const render = renderConfirmation(async () => {
      calls++;
    });
    render().requestExecution(botA);
    const { modal, footer } = render();
    if (action === "cancel") footer.onClose();
    else modal.onCancel();
    assert.equal(render().modal.open, false);
    assert.equal(calls, 0);
  });
}

test("confirmation executes only the selected bot once, including clicks before re-render", async () => {
  const calls = [];
  let release;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  const render = renderConfirmation(async (bot) => {
    calls.push(bot);
    await waiting;
  });
  render().requestExecution(botB);
  const { footer } = render();
  const execution = footer.handleOk();
  await footer.handleOk();
  const pending = render();
  assert.equal(pending.footer.isConfirmDisabled, true);
  assert.equal(pending.footer.isConfirmLoading, true);
  assert.equal(pending.modal.closable, false);
  assert.equal(pending.modal.maskClosable, false);
  assert.equal(pending.modal.keyboard, false);
  pending.modal.onCancel();
  pending.requestExecution(botA);
  assert.equal(render().modal.open, true);
  assert.deepEqual(calls, [botB]);
  release();
  await execution;
  assert.equal(render().modal.open, false);
  assert.equal(render().footer.isConfirmLoading, false);
});

test("a rejected existing handler propagates the error and releases the confirmation lock", async () => {
  const failure = new Error("Existing execution error");
  const render = renderConfirmation(async () => {
    throw failure;
  });
  render().requestExecution(botA);
  await assert.rejects(render().footer.handleOk(), (error) => error === failure);
  assert.equal(render().modal.open, false);
  render().requestExecution(botB);
  assert.equal(render().modal.open, true);
  assert.equal(render().footer.isConfirmDisabled, false);
});

test("all four manual entry points route through confirmation and retain existing handlers", () => {
  const automation = readFileSync(
    path.join(root, "src/modules/dataQuality/containers/AutomationsView/AutomationsView.tsx"),
    "utf8"
  );
  assert.equal((automation.match(/onRun=\{requestExecution\}/g) || []).length, 2);
  assert.match(automation, /useConfirmBotExecution\(handleRun\)/);
  assert.match(automation, /await runBotNow\(bot.schedule_id\)/);
  const health = readFileSync(
    path.join(root, "src/components/organisms/BotHealth/BotHealthView/BotHealthView.tsx"),
    "utf8"
  );
  assert.match(health, /useConfirmBotExecution\(handleQuickExecute\)/);
  assert.match(health, /onClick=\{\(\) => requestExecution\(row\)\}/);
  const drawer = readFileSync(
    path.join(root, "src/components/organisms/BotHealth/BotDetailDrawer/BotDetailDrawer.tsx"),
    "utf8"
  );
  assert.match(drawer, /useConfirmBotExecution\(handleExecute\)/);
  assert.match(drawer, /onClick=\{\(\) => requestExecution\(bot\)\}/);
  assert.match(drawer, /await executeBotManually\(selectedBot.schedule_id, showMessage\)/);
});
