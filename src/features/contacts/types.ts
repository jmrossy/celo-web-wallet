export interface Contact {
  address: string
  name: string
}

export type ContactMap = Record<string, Contact> // address to contact
