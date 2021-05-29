import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignerType } from 'src/blockchain/signer'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Table, TableColumn } from 'src/components/Table'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { formatNumberWithCommas } from 'src/utils/amount'

export function ManageAccountsScreen() {
  const navigate = useNavigate()
  const address = useWalletAddress()

  const onClickAdd = () => {
    navigate('/accounts/add')
  }

  const data = useMemo(() => {
    return accountsToTableData(address)
  }, [address])

  return (
    <>
      <h2 css={Font.h2Center}>Manage Your Accounts</h2>
      <Table<AccountTableRow>
        columns={tableColumns}
        data={data}
        isLoading={false}
        initialSortBy="value"
      />
      <DashedBorderButton onClick={onClickAdd} margin="0.5em 0 0 0">
        + Add new account
      </DashedBorderButton>
    </>
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
  identicon: {
    marginRight: '0.75em',
  },
}
