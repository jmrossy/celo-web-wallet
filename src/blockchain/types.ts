import type { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import type { LedgerSigner } from 'src/features/ledger/LedgerSigner'

export enum SignerType {
  Local = 'local',
  Ledger = 'ledger',
}

interface CeloWalletSigner {
  type: SignerType.Local
  signer: CeloWallet
}

interface CeloLedgerSigner {
  type: SignerType.Ledger
  signer: LedgerSigner
}

export type CeloSigner = CeloWalletSigner | CeloLedgerSigner
