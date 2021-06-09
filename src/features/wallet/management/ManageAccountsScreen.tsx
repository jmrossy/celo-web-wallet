import { useMemo } from 'react'
import { SignerType } from 'src/blockchain/signer'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table, TableColumn } from 'src/components/Table'
import {
  AccountModalScreen,
  useManageAccountModal,
} from 'src/features/wallet/management/ManageAccountModal'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { formatNumberWithCommas } from 'src/utils/amount'

export function ManageAccountsScreen() {
  const address = useWalletAddress()
  const showAccountsModal = useManageAccountModal()

  const onClickAdd = () => {
    showAccountsModal(AccountModalScreen.AddAccount)
  }

  const data = useMemo(() => {
    return accountsToTableData(address)
  }, [address])

  return (
    <ScreenContentFrame showBackButton={true}>
      <div css={style.content}>
        <h2 css={style.header}>Manage Your Accounts</h2>
        <Table<AccountTableRow>
          columns={tableColumns}
          data={data}
          isLoading={false}
          initialSortBy="value"
        />
        <DashedBorderButton onClick={onClickAdd} margin="0.5em 0 0 0">
          + Add new account
        </DashedBorderButton>
      </div>
    </ScreenContentFrame>
  )
}

function accountsToTableData(address: string): AccountTableRow[] {
  return [{ id: address, address, name: 'Account 1', type: SignerType.Local, value: 100 }]
}

interface AccountTableRow {
  id: string
  name: string
  address: string
  type: SignerType
  value: number
}

const tableColumns: TableColumn[] = [
  {
    header: 'Name',
    id: 'name',
    renderer: renderNameWithIcon,
  },
  {
    header: 'Address',
    id: 'address',
    renderer: renderAddress,
  },
  {
    header: 'Type',
    id: 'type',
    renderer: (row) => (row.type === SignerType.Ledger ? 'Ledger' : 'Local'),
  },
  {
    header: 'Value (estimate)',
    id: 'value',
    renderer: (row) => formatNumberWithCommas(row.value),
  },
]

function renderNameWithIcon(row: AccountTableRow) {
  return (
    <Box align="center">
      <Identicon address={row.address} styles={style.identicon} />
      <div>{row.name}</div>
    </Box>
  )
}

function renderAddress(row: AccountTableRow) {
  return <CopiableAddress address={row.address} length="short" />
}

const style: Stylesheet = {
  content: {
    minWidth: 'calc(min(60vw, 40rem))',
  },
  header: {
    ...Font.h2,
    margin: '0 0 1.75em 0',
    textAlign: 'center',
  },
  identicon: {
    marginRight: '0.75em',
  },
}
