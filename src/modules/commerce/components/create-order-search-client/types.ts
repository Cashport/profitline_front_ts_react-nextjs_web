export interface IClientOption {
  value: string;
  label: string;
  email: string;
  payment_type: number;
}

export interface ISelectedAddress {
  id?: number;
  city: string;
  dispatch_address: string;
  email?: string;
}
