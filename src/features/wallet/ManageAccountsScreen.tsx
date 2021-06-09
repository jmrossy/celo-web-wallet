import { useMemo } from 'react'
import { SignerType } from 'src/blockchain/signer'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Table, TableColumn } from 'src/components/Table'
import { AccountModalScreen, useManageAccountModal } from 'src/features/wallet/ManageAccountModal'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
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
      <Box direction="column" align="center">
        <h2 css={style.header}>Manage Your Accounts</h2>
        <Table<AccountTableRow>
          columns={tableColumns}
          data={data}
          isLoading={false}
          initialSortBy="balance"
        />
        <DashedBorderButton onClick={onClickAdd} margin="0.5em 0 0 0">
          + Add new account
        </DashedBorderButton>
      </Box>
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
  },
  {
    header: 'Address',
    id: 'address',
    renderer: (row) => shortenAddress(row.address, true),
  },
  {
    header: 'Type',
    id: 'type',
  },
  {
    header: 'Value (estimate)',
    id: 'value',
    renderer: (group) => formatNumberWithCommas(Math.round(group.votes)),
  },
]

const style: Stylesheet = {
  header: {
    ...Font.h2,
    margin: '0 0 1.75em 0',
    textAlign: 'center',
  },
}
