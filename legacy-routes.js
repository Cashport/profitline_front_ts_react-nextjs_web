// URLs anteriores (en español o camelCase) → URLs actuales en inglés. Redirección permanente
// (308): conserva parámetros y query string. Las necesitan los links guardados en la base
// (approval.approval_link), los correos ya enviados y los marcadores de los usuarios.
// Más específicas primero: Next usa la primera que coincide.
const LEGACY_ROUTES = [
  ["/clientes/detail/:clientId/project/:projectId/aplicacion", "/clients/detail/:clientId/project/:projectId/cash-application"],
  ["/clientes/detail/:clientId/project/:projectId/cartera", "/clients/detail/:clientId/project/:projectId/receivables"],
  ["/clientes/detail/:clientId/project/:projectId/contactos", "/clients/detail/:clientId/project/:projectId/contacts"],
  ["/clientes/detail/:clientId/project/:projectId/historial", "/clients/detail/:clientId/project/:projectId/history"],
  ["/clientes/detail/:clientId/project/:projectId/notas", "/clients/detail/:clientId/project/:projectId/notes"],
  ["/clientes/detail/:clientId/project/:projectId/pagos", "/clients/detail/:clientId/project/:projectId/payments"],
  ["/clientes/detail/:clientId/project/:projectId/saldos", "/clients/detail/:clientId/project/:projectId/balances"],
  ["/clientes", "/clients"],
  ["/comercio/pedidoConfirmado", "/commerce/order-confirmed"],
  ["/comercio/pedido", "/commerce/order"],
  ["/comercio", "/commerce"],
  ["/descuentos/paquete", "/discounts/package"],
  ["/descuentos/regla", "/discounts/rule"],
  ["/descuentos", "/discounts"],
  ["/logistica-inversa/aprobaciones", "/reverse-logistics/approvals"],
  ["/logistica-inversa/devoluciones", "/reverse-logistics/returns"],
  ["/logistica-inversa", "/reverse-logistics"],
  ["/market-admin/bonusAndDiscounts/gestion", "/market-admin/bonuses-and-discounts/management"],
  ["/market-admin/bonusAndDiscounts/paquete", "/market-admin/bonuses-and-discounts/package"],
  ["/market-admin/bonusAndDiscounts/regla", "/market-admin/bonuses-and-discounts/rule"],
  ["/market-admin/bonusAndDiscounts", "/market-admin/bonuses-and-discounts"],
  ["/market-admin/clientes", "/market-admin/clients"],
  ["/market-admin/productos", "/market-admin/products"],
  ["/market-admin/usuarios", "/market-admin/users"],
  ["/mobile/confirmPayment", "/mobile/confirm-payment"],
  ["/auth/changePass", "/auth/change-password"],
  ["/applyModule", "/cash-application"],
  ["/aprobaciones", "/approvals"],
  ["/banco", "/banks"],
  ["/blockingAlerts", "/blocking-alerts"],
  ["/conciliacion", "/reconciliation"],
  ["/cuentas-medicas", "/medical-accounts"],
  ["/gestor-tareas", "/legacy-task-manager"],
  ["/newDashboard", "/new-dashboard"],
  ["/notificaciones", "/notifications"],
  ["/portal-archivos", "/file-portal"],
  ["/precintos", "/seals"],
  ["/proveedores", "/suppliers"],
  ["/proyectos", "/projects"],
  ["/salud-automatizaciones", "/bot-health"],
  ["/torreControl", "/control-tower"],
];

module.exports = LEGACY_ROUTES.map(([source, destination]) => ({
  source: `${source}/:path*`,
  destination: `${destination}/:path*`,
  permanent: true
}));
