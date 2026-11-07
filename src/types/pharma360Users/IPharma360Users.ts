export interface IPharma360User {
  id: string;
  email: string;
  rolId: string | null;
  rolNombre: string | null;
  activo: boolean;
  ultimaValidacionOtp: string | null;
}

export interface IPharma360UsersPage {
  total: number;
  pagina: number;
  tamano: number;
  items: IPharma360User[];
}

export interface IPharma360Role {
  id: string;
  nombre: string;
}

export interface IPharma360RolesResponse {
  items: IPharma360Role[];
}
