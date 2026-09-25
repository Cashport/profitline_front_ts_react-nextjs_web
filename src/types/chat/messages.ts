export interface TypeContactMessage {
  name: Name
  phones: Phone[]
}

export interface Name {
  last_name: string
  first_name: string
  formatted_name: string
}

export interface Phone {
  type: string
  phone: string
  wa_id: string
}