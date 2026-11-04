// Un archivo por módulo (namespace). Al agregar uno nuevo, créalo en es/ y en/ e impórtalo en ambos índices.
import type { Messages } from "../../types";
import common from "./common.json";
import shell from "./shell.json";
import auth from "./auth.json";
import components from "./components.json";
import platform from "./platform.json";
import meta from "./meta.json";
import shared from "./shared.json";
import modals from "./modals.json";
import clients from "./clients.json";
import projects from "./projects.json";
import suppliers from "./suppliers.json";
import discounts from "./discounts.json";
import marketAdmin from "./marketAdmin.json";
import commerce from "./commerce.json";
import publicPortals from "./publicPortals.json";
import dataQuality from "./dataQuality.json";
import botHealth from "./botHealth.json";
import wallet from "./wallet.json";
import novelties from "./novelties.json";
import balances from "./balances.json";
import blockingAlerts from "./blockingAlerts.json";
import reconciliation from "./reconciliation.json";
import collections from "./collections.json";
import controlTower from "./controlTower.json";
import newDashboard from "./newDashboard.json";
import reports from "./reports.json";
import visits from "./visits.json";
import surveys from "./surveys.json";
import purchaseOrders from "./purchaseOrders.json";
import reverseLogistics from "./reverseLogistics.json";
import seals from "./seals.json";
import medicalAccounts from "./medicalAccounts.json";
import approvals from "./approvals.json";
import banks from "./banks.json";
import chat from "./chat.json";
import taskManager from "./taskManager.json";
import tickets from "./tickets.json";
import massCommunications from "./massCommunications.json";

// Tipado contra el español: si falta una clave en inglés, TypeScript lo marca.
const messages: Messages = {
  common,
  shell,
  auth,
  components,
  platform,
  meta,
  shared,
  modals,
  clients,
  projects,
  suppliers,
  discounts,
  marketAdmin,
  commerce,
  publicPortals,
  dataQuality,
  botHealth,
  wallet,
  novelties,
  balances,
  blockingAlerts,
  reconciliation,
  collections,
  controlTower,
  newDashboard,
  reports,
  visits,
  surveys,
  purchaseOrders,
  reverseLogistics,
  seals,
  medicalAccounts,
  approvals,
  banks,
  chat,
  taskManager,
  tickets,
  massCommunications
};

export default messages;
