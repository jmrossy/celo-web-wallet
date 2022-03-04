export interface Contact {
  address: Address
  name: string
}

export type ContactMap = Record<Address, Contact>
