export interface ValidatorGroup {
  address: string
  name: string
  url: string
  eligible: boolean
  capacity: string
  votes: string
  members: Record<string, Validator>
}

export interface ValidatorGroupTableRow {
  id: string
  address: string
  name: string
  elected: string
  votes: string
  percent: string
  status: ValidatorGroupStatus
}

export enum ValidatorGroupStatus {
  Good = 'Good',
  Okay = 'Okay',
  Poor = 'Poor',
  Full = 'Full',
}

export enum ValidatorStatus {
  Elected,
  NotElected,
}

export interface Validator {
  address: string
  name: string
  score: string
  signer: string
  status: ValidatorStatus
}
