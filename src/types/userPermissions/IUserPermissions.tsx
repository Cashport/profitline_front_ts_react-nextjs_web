export interface IUserPermissions {
  status: number;
  message: string;
  data: IPermissionData;
}

interface IPermissionData {
  permissions: IPermissionsByProject[];
  id_user: number;
  userName: string;
  preferences: IPreferences;
  isMarketplaceGuest?: boolean;
  guestName?: string;
  guestId?: string;
  guestDocument?: string;
  guestEmail?: string;
}

interface IPreferences {
  currency: string;
  id: string;
  /** Idioma guardado en el usuario; null si nunca lo eligió. */
  language?: "es" | "en" | null;
}

interface IPermissionsByProject {
  project_id: number;
  rol_id: number;
  name: string;
  logo: string | null;
  views_permissions?: IViewPermission[];
  action_permissions?: string[];
  is_super_admin: boolean;
}

export interface IViewPermission {
  page_name: string | "Configuracion" | "Clientes";
  components: IComponentPermission[];
}

export interface IComponentPermission {
  component_name: string;
  create_permission: boolean;
  update_permission: boolean;
  delete_permission: boolean;
}
