import type {
  IPharma360RolesResponse,
  IPharma360User,
  IPharma360UsersPage
} from "@/types/pharma360Users/IPharma360Users";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

const BASE = "/integration/profit360/users";

// GET /integration/profit360/users — usuarios de Pharma 360 (paginado, búsqueda por correo).
export const getPharma360Users = async (
  busqueda: string,
  pagina: number,
  tamano: number
): Promise<GenericResponse<IPharma360UsersPage>> => {
  const qs = new URLSearchParams({ pagina: String(pagina), tamano: String(tamano) });
  if (busqueda) qs.set("busqueda", busqueda);
  return API.get(`${BASE}?${qs.toString()}`);
};

// GET /integration/profit360/users/roles — roles para el selector.
export const getPharma360Roles = async (): Promise<GenericResponse<IPharma360RolesResponse>> =>
  API.get(`${BASE}/roles`);

// POST /integration/profit360/users — crea el usuario y le envía el correo para definir su contraseña.
export const createPharma360User = async (
  email: string,
  rolId?: string
): Promise<GenericResponse<IPharma360User>> => API.post(BASE, { email, rolId });

// PUT /integration/profit360/users/:id/role
export const changePharma360UserRole = async (
  id: string,
  rolId: string
): Promise<GenericResponse<unknown>> =>
  API.put(`${BASE}/${encodeURIComponent(id)}/role`, { rolId });

// PUT /integration/profit360/users/:id/status — desactivar impide nuevos inicios de sesión.
export const changePharma360UserStatus = async (
  id: string,
  activo: boolean
): Promise<GenericResponse<unknown>> =>
  API.put(`${BASE}/${encodeURIComponent(id)}/status`, { activo });

// POST /integration/profit360/users/:id/revoke-otp — pedirá un código en su próximo inicio de sesión.
export const revokePharma360UserOtp = async (id: string): Promise<GenericResponse<unknown>> =>
  API.post(`${BASE}/${encodeURIComponent(id)}/revoke-otp`, {});
