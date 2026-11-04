const test = require("node:test");
const assert = require("node:assert/strict");
const zlib = require("node:zlib");

const { compactTokenPermissions } = require("../src/utils/permissions/tokenPermissions.ts");

const views = [
  {
    page_name: "Clientes",
    components: [
      {
        component_name: "Listado",
        create_permission: true,
        update_permission: true,
        delete_permission: false
      }
    ]
  }
];

const superAdmin = {
  project_id: 1,
  rol_id: 2,
  name: "Proyecto",
  logo: "https://cdn/logo.png",
  views_permissions: views,
  action_permissions: ["CREAR"],
  is_super_admin: true
};

const normalUser = {
  project_id: 2,
  rol_id: 4,
  name: "Proyecto 2",
  logo: null,
  views_permissions: views,
  action_permissions: [],
  is_super_admin: false
};

test("super admin: quita views_permissions y conserva el resto del payload", () => {
  const input = { permissions: [superAdmin], id_user: 7, userName: "Admin", preferences: { currency: "COP", id: "es-CO" } };
  const output = compactTokenPermissions(input);

  assert.equal(output.permissions[0].views_permissions, undefined);
  assert.equal(output.permissions[0].is_super_admin, true);
  assert.equal(output.permissions[0].project_id, 1);
  assert.equal(output.permissions[0].rol_id, 2);
  assert.equal(output.permissions[0].name, "Proyecto");
  assert.equal(output.permissions[0].logo, "https://cdn/logo.png");
  assert.deepEqual(output.permissions[0].action_permissions, ["CREAR"]);
  assert.equal(output.id_user, 7);
  assert.equal(output.userName, "Admin");
  assert.deepEqual(output.preferences, { currency: "COP", id: "es-CO" });
});

test("usuario normal: el payload queda intacto", () => {
  const input = { permissions: [normalUser], id_user: 8, userName: "Usuario" };
  const output = compactTokenPermissions(input);
  assert.deepEqual(output, input);
});

test("payload mixto: solo se compacta la entrada de super admin", () => {
  const input = { permissions: [normalUser, superAdmin], id_user: 9, userName: "Mixto" };
  const output = compactTokenPermissions(input);

  assert.deepEqual(output.permissions[0], normalUser);
  assert.equal(output.permissions[1].views_permissions, undefined);
  assert.equal(output.permissions[1].is_super_admin, true);
});

test("sin permissions: devuelve el mismo objeto", () => {
  const input = { id_user: 1, userName: "Sin proyectos", preferences: { currency: "COP", id: "es-CO" } };
  assert.equal(compactTokenPermissions(input), input);
  assert.equal(compactTokenPermissions(null), null);
  assert.equal(compactTokenPermissions(undefined), undefined);
});

test("tamaño: el payload real de un super admin baja muy por debajo del límite de headers", () => {
  // Reproduce el peor caso medido en producción: 48 proyectos × 64 componentes.
  const projects = Array.from({ length: 48 }, (_, index) => ({
    ...superAdmin,
    project_id: index + 1,
    views_permissions: undefined
  }));
  const bigViews = Array.from({ length: 64 }, (_, index) => ({
    page_name: `Pagina ${index}`,
    components: [
      {
        component_name: `Componente ${index}`,
        create_permission: true,
        update_permission: true,
        delete_permission: true
      }
    ]
  }));
  const superAdminPayload = {
    permissions: projects.map((project) => ({ ...project, views_permissions: bigViews })),
    id_user: 797,
    userName: "Super Admin",
    preferences: { currency: "COP", id: "es-CO" }
  };

  const beforeJson = Buffer.byteLength(JSON.stringify(superAdminPayload));
  const compacted = compactTokenPermissions(superAdminPayload);
  const afterJson = Buffer.byteLength(JSON.stringify(compacted));
  const claimBytes = zlib.deflateSync(Buffer.from(JSON.stringify(compacted))).toString("base64").length;

  assert.ok(beforeJson > 400_000, `json antes demasiado chico: ${beforeJson}`);
  assert.ok(afterJson < 20_000, `json después demasiado grande: ${afterJson}`);
  assert.ok(claimBytes < 4_096, `claim comprimido demasiado grande: ${claimBytes}`);
});
