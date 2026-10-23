/* eslint @typescript-eslint/no-unused-vars: "off", no-unused-vars: "error" */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const servicesFile = "src/services/users/users.ts";
const formFile = "src/components/molecules/tabs/Projects/UserProjectForm/UserProjectForm.tsx";
const marketFile =
  "src/modules/marketAdmin/containers/market-admin-user-detail/MarketAdminUserDetail.tsx";

function loadSource(file, mocks) {
  const { outputText } = ts.transpileModule(readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true
    }
  });
  const loadedModule = { exports: {} };
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.endsWith(".scss")) return {};
    if (
      name.startsWith("@/") ||
      name === "lucide-react" ||
      name === "phosphor-react" ||
      name === "next/link"
    ) {
      return new Proxy(
        { __esModule: true, default: path.basename(name) },
        {
          get: (target, key) => (key in target ? target[key] : key)
        }
      );
    }
    return require(name);
  };
  new Function("require", "module", "exports", "console", outputText)(
    localRequire,
    loadedModule,
    loadedModule.exports,
    { warn() {}, error() {} }
  );
  return loadedModule.exports;
}

const profile = {
  ID: 7,
  PROJECT_ID: 10,
  USER_NAME: "Test User",
  EMAIL: "user@example.test",
  PHONE: "1234567",
  POSITION: "Analyst",
  ROL_ID: 3,
  ROL_NAME: "Analyst",
  USER_ZONES: [{ ZONE_ID: 8 }],
  COUNTRY_IDS: [1],
  USER_CHANNELS: [{ ID: 2 }],
  USER_LINES: [],
  USER_SUBLINES: [],
  ACTIVE: 1
};
const userForm = {
  info: {
    name: profile.USER_NAME,
    email: profile.EMAIL,
    phone: profile.PHONE,
    cargo: profile.POSITION,
    rol: { value: 3, label: "Analyst" }
  }
};

function service(API) {
  return loadSource(servicesFile, {
    "@/utils/api/api": { API },
    "@/utils/constants/globalConstants": { SUCCESS: 200 },
    "@/config": { __esModule: true, default: {} }
  });
}

test("country update sends every required field and preserves existing groups and zones", async () => {
  const reads = [];
  let saved;
  const users = service({
    get: async (url) => {
      reads.push(url);
      return url === "/user/7" ? { data: profile } : { data: [{ group_id: 4 }, { group_id: 5 }] };
    },
    put: async (url, body) => {
      saved = { url, body };
      return { status: 200 };
    }
  });
  await users.updateUserCountries(7, 10, [1, 2]);
  assert.deepEqual(reads.sort(), ["/group-client/user/7/project/10", "/user/7"].sort());
  assert.deepEqual(saved, {
    url: "/user",
    body: {
      id: 7,
      project_id: "10",
      user_name: "Test User",
      email: "user@example.test",
      phone: "1234567",
      position: "Analyst",
      rol_id: 3,
      zones: [{ ZONE_ID: 8 }],
      groups_id: [4, 5],
      country_ids: [1, 2]
    }
  });
});

test("removing the last country still sends required empty arrays", async () => {
  let saved;
  const users = service({
    get: async (url) => ({ data: url === "/user/7" ? { ...profile, USER_ZONES: [] } : [] }),
    put: async (_, body) => {
      saved = body;
      return { status: 200 };
    }
  });
  await users.updateUserCountries(7, 10, []);
  assert.deepEqual(saved.zones, []);
  assert.deepEqual(saved.groups_id, []);
  assert.deepEqual(saved.country_ids, []);
});

for (const failedRead of ["/user/7", "/group-client/user/7/project/10"]) {
  test(`failed prerequisite ${failedRead} prevents saving`, async () => {
    const failure = new Error("Read failed");
    let writes = 0;
    const users = service({
      get: async (url) => {
        if (url === failedRead) throw failure;
        return { data: url === "/user/7" ? profile : [] };
      },
      put: async () => {
        writes++;
      }
    });
    await assert.rejects(users.updateUserCountries(7, 10, [2]), (error) => error === failure);
    assert.equal(writes, 0);
  });
}

test("updateUser rejects instead of returning a success-shaped error", async () => {
  const failure = Object.assign(new Error("Duplicate email"), { status: 409 });
  const users = service({
    put: async () => {
      throw failure;
    }
  });
  await assert.rejects(
    users.updateUser(7, 10, {
      data: userForm,
      zones: [],
      selectedGroups: [],
      countryIds: [1]
    }),
    (error) => error === failure
  );
});

test("missing country scope is a load error, not an empty assignment", async () => {
  const users = service({ get: async () => ({ data: {} }) });
  await assert.rejects(users.getUserById("7"), /asignaci/);
});

for (const status of [400, 403, 409]) {
  test(`country save propagates HTTP ${status}`, async () => {
    const failure = Object.assign(new Error("Save failed"), { status });
    const users = service({
      get: async (url) => ({ data: url === "/user/7" ? profile : [] }),
      put: async () => {
        throw failure;
      }
    });
    await assert.rejects(users.updateUserCountries(7, 10, [2]), (error) => error === failure);
  });
}

// Hook-level harness: exercise the real event handlers without Firebase or a live backend.
function renderComponent(file, exportName, mocks, props) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  function memo(factory, deps) {
    const index = cursor++;
    const previous = slots[index];
    if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
      slots[index] = { value: factory(), deps };
    }
    return slots[index].value;
  }
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [
        slots[index],
        (value) => {
          slots[index] = typeof value === "function" ? value(slots[index]) : value;
        }
      ];
    },
    useMemo: memo,
    useCallback: (callback, deps) => memo(() => callback, deps),
    useEffect(effect, deps) {
      memo(() => {
        effects.push(effect);
      }, deps);
    }
  };
  const jsx = (type, props) => ({ type, props });
  const Component = loadSource(file, {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
    antd: {
      Button: "Button",
      Flex: "Flex",
      Spin: "Spin",
      Typography: { Text: "Text", Title: "Title" }
    },
    "react-hook-form": {
      useForm: () => ({
        control: {},
        handleSubmit: (fn) => fn,
        formState: { errors: {} }
      }),
      Controller: "Controller"
    },
    "@/lib/store/store": { useAppStore: (select) => select({ selectedProject: { ID: 10 } }) },
    ...mocks
  })[exportName];
  return {
    render() {
      cursor = 0;
      return Component(props);
    },
    async flush() {
      const pending = effects;
      effects = [];
      pending.forEach((effect) => effect());
      await new Promise(setImmediate);
    }
  };
}

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return undefined;
  if (Array.isArray(tree)) return tree.map((node) => find(node, predicate)).find(Boolean);
  if (predicate(tree)) return tree;
  return find(tree.props?.children, predicate);
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function formHarness(services, id = 0) {
  const messages = [];
  const view = renderComponent(
    formFile,
    "UserProjectForm",
    {
      "@/utils/api/api": { ApiError },
      "@/context/MessageContext": {
        useMessageApi: () => ({
          showMessage: (...args) => messages.push(args)
        })
      },
      "@/services/users/users": {
        getUserById: async () => ({ data: profile }),
        getGroupsByUser: async () => ({ data: [] }),
        ...services
      }
    },
    { isViewDetailsUser: { id, active: id !== 0 }, onGoBackTable() {} }
  );
  return { view, messages };
}

test("creation requires a country for non-admins, but allows an admin without countries", async () => {
  let invitations = 0;
  const { view } = formHarness({
    inviteUser: async () => {
      invitations++;
      return { status: 200 };
    }
  });
  view.render();
  await view.flush();
  let tree = view.render();
  find(tree, (node) => node.type === "SelectZone").props.setZones([8]);
  find(tree, (node) => node.type === "SelectStructure").props.setSelectedBusinessRules({
    channels: [2],
    lines: [],
    sublines: []
  });
  tree = view.render();
  await find(tree, (node) => node.type === "form").props.onSubmit(userForm);
  assert.equal(invitations, 0);
  assert.ok(find(view.render(), (node) => node.props?.role === "alert"));
  find(view.render(), (node) => node.type === "SelectUserCountries").props.setCountryIds([1]);
  await find(view.render(), (node) => node.type === "form").props.onSubmit(userForm);
  assert.equal(invitations, 1);
  find(view.render(), (node) => node.type === "SelectUserCountries").props.setCountryIds([]);
  await find(view.render(), (node) => node.type === "form").props.onSubmit({
    info: { ...userForm.info, rol: { value: 2, label: "Admin" } }
  });
  assert.equal(invitations, 2);
});

test("user load errors block saving and offer retry instead of an empty form", async () => {
  let fail = true;
  const { view } = formHarness(
    {
      getUserById: async () => {
        if (fail) throw new Error("Could not load user");
        return { data: profile };
      }
    },
    7
  );
  view.render();
  await view.flush();
  const tree = view.render();
  assert.ok(find(tree, (node) => node.props?.role === "alert"));
  assert.equal(
    find(tree, (node) => node.type === "SelectUserCountries"),
    undefined
  );
  fail = false;
  find(
    tree,
    (node) => node.type === "Button" && node.props.children === "Reintentar"
  ).props.onClick();
  view.render();
  await view.flush();
  assert.deepEqual(
    find(view.render(), (node) => node.type === "SelectUserCountries").props.countryIds,
    [1]
  );
});

for (const failure of [
  new ApiError(409, "Duplicate email"),
  Object.assign(new Error("Duplicate email"), { isAxiosError: true, response: { status: 409 } })
]) {
  test(`duplicate email is shown and editing remains enabled (${failure.constructor.name})`, async () => {
    const { view, messages } = formHarness(
      {
        updateUser: async () => {
          throw failure;
        }
      },
      7
    );
    view.render();
    await view.flush();
    let tree = view.render();
    find(
      tree,
      (node) => node.type === "Button" && node.props.children === "Editar Usuario"
    ).props.onClick();
    await find(view.render(), (node) => node.type === "form").props.onSubmit(userForm);
    assert.match(messages.at(-1)[1], /email ya esta en uso/);
    tree = view.render();
    assert.ok(find(tree, (node) => node.type === "Button" && node.props.htmlType === "submit"));
  });
}

function marketHarness(services = {}) {
  const messages = [];
  const countries = {
    data: { data: [{ id: 1, country_name: "One" }] },
    isLoading: false,
    mutate: async () => {}
  };
  const view = renderComponent(
    marketFile,
    "default",
    {
      swr: { __esModule: true, default: () => countries, mutate() {} },
      "@/utils/api/api": { fetcher() {} },
      "@/context/MessageContext": {
        useMessageApi: () => ({
          showMessage: (...args) => messages.push(args)
        })
      },
      "@/modules/marketAdmin/hooks/useMarketAdminUserDetail": {
        useMarketAdminUserDetail: () => ({
          data: { id: 7, clients: [], role_name: "Analyst" },
          mutate() {}
        })
      },
      "@/modules/marketAdmin/hooks/useMarketAdminFacturadores": {
        useMarketAdminFacturadores: () => ({})
      },
      "@/hooks/useClientsGroupsSimplified": { useClientsGroupsSimplified: () => ({}) },
      "@/services/users/users": {
        getUserById: async () => ({ data: profile }),
        getGroupsByUser: async () => ({ data: [] }),
        updateUserCountries: async () => {
          throw new ApiError(400, "Save failed");
        },
        ...services
      }
    },
    { params: { id: "7" } }
  );
  const section = () => find(view.render(), (node) => node.type === "PaisesSection").props;
  return { view, section, messages };
}

test("marketplace rolls back failed add/remove and never reports success", async () => {
  const { view, section, messages } = marketHarness();
  view.render();
  await view.flush();
  assert.deepEqual(section().asignadosIds, [1]);
  assert.equal(await section().onAgregar([2]), false);
  assert.deepEqual(section().asignadosIds, [1]);
  await section().onQuitar(1);
  assert.deepEqual(section().asignadosIds, [1]);
  assert.equal(messages.length, 2);
  assert.ok(messages.every(([type]) => type === "error"));
});

test("marketplace distinguishes a failed load from a valid empty scope and can retry", async () => {
  let fail = true;
  const { view, section } = marketHarness({
    getUserById: async () => {
      if (fail) throw new Error("Could not load countries");
      return { data: { ...profile, COUNTRY_IDS: [] } };
    }
  });
  view.render();
  await view.flush();
  assert.match(section().error, /Could not load countries/);
  fail = false;
  section().onRetry();
  view.render();
  await view.flush();
  assert.equal(section().error, null);
  assert.equal(section().loading, false);
  assert.deepEqual(section().asignadosIds, []);
});
