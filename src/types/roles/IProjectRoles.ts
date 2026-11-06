export interface IProjectRole {
  rol_id: number;
  rol_name: string;
  active_users: number;
  enabled: boolean;
}

export interface IProjectRolesConfig {
  /** false: el proyecto aún no tiene lista propia y ve todos los roles. */
  configured: boolean;
  roles: IProjectRole[];
}

export interface IBlockedProjectRole {
  rol_id: number;
  rol_name: string;
  active_users: number;
}
