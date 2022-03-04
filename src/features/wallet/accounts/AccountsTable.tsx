import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { RenameAccountModal, RenameForm } from 'src/components/RenameModal'
import { Table, TableColumn } from 'src/components/table/Table'
import { createAddressField, createAddressNameField } from 'src/components/table/tableUtils'
import {
  EditAccountAction,
  editAccountActions,
  editAccountSagaName,
} from 'src/features/wallet/editAccount'
import { useAccountList } from 'src/features/wallet/hooks'
import { StoredAccountData } from 'src/features/wallet/storage'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

export function AccountsTable({ isMobile }: { isMobile: boolean }) {
  const [refetchList, setRefetchList] = useState(false)
  const accounts = useAccountList(undefined, refetchList)

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showModalAsync, showModalWithContent, closeModal } = useModal()

  const onClickAdd = () => {
    navigate('/accounts/add')
  }

  const onClickEditName = async (row: AccountTableRow) => {
    const onEditNameSubmit = (values: RenameForm) => {
      if (values.newName !== row.name) {
        dispatch(
          editAccountActions.trigger({
            action: EditAccountAction.Rename,
            address: row.address,
            newName: values.newName,
          })
        )
      }
      closeModal()
    }
    showModalWithContent({
      head: 'Rename Account',
      content: <RenameAccountModal onSubmit={onEditNameSubmit} label="account" />,
    })
  }

  const onClickRemove = async (id: string) => {
    const answer = await showModalAsync({
      head: 'REMOVE ACCOUNT WARNING',
      subHead: 'Are you sure you want to remove this account?',
      body: 'The account will be deleted. Other accounts, including ones with the same key, will not be affected.',
      actions: [
        { key: 'cancel', label: 'Cancel', color: Color.primaryWhite },
        { key: 'remove', label: 'Remove', color: Color.primaryRed },
      ],
    })
    if (answer && answer.key === 'remove') {
      dispatch(editAccountActions.trigger({ action: EditAccountAction.Remove, address: id }))
    }
  }

  const tableColumns = getTableColumns(isMobile, onClickEditName)
  const data = useMemo(() => {
    return accountsToTableData(accounts, onClickRemove)
  }, [accounts])

  const status = useSagaStatus(
    editAccountSagaName,
    'Error Modifying Account',
    'Something went wrong, sorry!',
    () => setRefetchList(!refetchList)
  )

  return (
    <>
      <Box align="center" justify="between" margin="0 0.7em 1.2em 0">
        <h2 css={Font.tableHeader}>Your Accounts</h2>
        <Button
          onClick={onClickAdd}
          size="xs"
          disabled={status === SagaStatus.Started}
          height="2em"
        >
          Add Account
        </Button>
      </Box>
      <Table<AccountTableRow>
        columns={tableColumns}
        data={data}
        isLoading={!accounts}
        initialSortBy="name"
        hideDividerLine={true}
      />
    </>
  )
}

function accountsToTableData(
  accounts: StoredAccountData[] | null,
  onRemove: (id: string) => void
): AccountTableRow[] {
  if (!accounts) return []
  return accounts.map((a) => ({
    id: a.address,
    address: a.address,
    name: a.name,
    type: a.type,
    onRemove,
  }))
}

interface AccountTableRow {
  id: string
  name: string
  address: Address
  type: SignerType
  onRemove?: (id: string) => void
}

function getTableColumns(
  isMobile: boolean,
  onClickEditName: (row: AccountTableRow) => void
): TableColumn[] {
  return [
    createAddressNameField<AccountTableRow>(onClickEditName),
    {
      header: 'Type',
      id: 'type',
      renderer: (row: AccountTableRow) => (row.type === SignerType.Ledger ? 'Ledger' : 'Local'),
    },
    createAddressField<AccountTableRow>(isMobile),
  ]
}
