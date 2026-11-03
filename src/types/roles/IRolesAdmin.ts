export interface ICatalogEndpoint {
  endpoint_id: number;
  route: string;
  method: string;
  path: string;
  mounted: boolean;
}

export interface ICatalogComponent {
  component_id: number;
  component_name: string;
  is_generic: boolean;
  roles_with_access: number;
  endpoints: ICatalogEndpoint[];
}

export interface ICatalogModule {
  page_id: number;
  page_name: string;
  product: "Cashport" | "TMS";
  components: ICatalogComponent[];
}

export interface IAdminRole {
  rol_id: number;
  rol_name: string;
  components: number;
  active_users: number;
  projects: number;
  is_system: boolean;
}

export interface IRoleDetail {
  rol_id: number;
  rol_name: string;
  is_system: boolean;
  component_ids: number[];
}
