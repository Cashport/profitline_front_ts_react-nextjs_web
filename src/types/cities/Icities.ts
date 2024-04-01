export interface Icities {
  data: Data;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface Config {
  transitional: Transitional;
  adapter: string[];
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Request;
  headers: ConfigHeaders;
  method: string;
  url: string;
}

export interface Request {}

export interface ConfigHeaders {
  accept: string;
  authorization: string;
}

export interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

export interface Data {
  status: number;
  message: string;
  data: Datum[];
}

export interface Datum {
  id: number;
  address: string;
  city: string;
  nit: string;
  position: Position;
}

export interface Position {
  lat: string;
  lon: string;
}

export interface WelcomeHeaders {
  contentType: string;
}
