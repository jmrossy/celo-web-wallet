import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { TransparentIconButton } from 'src/components/buttons/TransparentIconButton'
import { PencilIcon } from 'src/components/icons/Pencil'
import { Identicon } from 'src/components/Identicon'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Table, TableColumn } from 'src/components/Table'
import { MAX_ACCOUNT_NAME_LENGTH } from 'src/consts'
import {
  EditAccountAction,
  editAccountActions,
  editAccountSagaName,
} from 'src/features/wallet/editAccount'
import { useAccountList } from 'src/features/wallet/hooks'
import { StoredAccountData } from 'src/features/wallet/storage'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { trimToLength } from 'src/utils/string'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatus } from 'src/utils/useSagaStatus'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function ManageAccountsScreen() {
  const [refetchList, setRefetchList] = useState(false)
  const accounts = useAccountList(undefined, refetchList)

  const { showModalAsync, showModalWithContent, closeModal } = useModal()
  const dispatch = useDispatch()

  const onClickEditName = async (row: AccountTableRow) => {
    showModalWithContent({
      head: 'Rename Account',
      content: <RenameAccountModal row={row} close={closeModal} />,
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

  const isMobile = useIsMobile()
  const tableColumns = getTableColumns(isMobile, onClickEditName)
  const data = useMemo(() => {
    return accountsToTableData(accounts, onClickRemove)
  }, [accounts])

  const navigate = useNavigate()
  const onClickAdd = () => {
    navigate('/accounts/add')
  }

  const status = useSagaStatus(
    editAccountSagaName,
    'Error Modifying Account',
    'Something went wrong, sorry!',
    () => setRefetchList(!refetchList)
  )

  return (
    <>
      <h2 css={Font.h2Center}>Manage Your Accounts</h2>
      <Table<AccountTableRow>
        columns={tableColumns}
        data={data}
        isLoading={!accounts}
        initialSortBy="name"
      />
      <DashedBorderButton
        onClick={onClickAdd}
        margin="0.5em 0 0 0"
        disabled={status === SagaStatus.Started}
      >
        + Add new account
      </DashedBorderButton>
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
  address: string
  type: SignerType
  onRemove?: (id: string) => void
}

function getTableColumns(
  isMobile: boolean,
  onClickEditName: (row: AccountTableRow) => void
): TableColumn[] {
  return [
    {
      header: 'Name',
      id: 'name',
      renderer: createRenderName(onClickEditName),
    },
    {
      header: 'Type',
      id: 'type',
      renderer: renderType,
    },
    {
      header: 'Address',
      id: 'address',
      renderer: createRenderAddress(isMobile),
    },
  ]
}

function createRenderName(onClickEditName: (row: AccountTableRow) => void) {
  const renderName = (row: AccountTableRow) => (
    <Box align="center">
      <Identicon address={row.address} styles={style.identicon} />
      <div>{trimToLength(row.name, 20)}</div>
      <TransparentIconButton
        title="Edit account name"
        icon={<PencilIcon color="#3d434a" styles={style.pencilIcon} />}
        margin="0 0 0 0.5em"
        onClick={() => onClickEditName(row)}
      />
    </Box>
  )
  return renderName
}

function createRenderAddress(isMobile: boolean) {
  const renderAddress = (row: AccountTableRow) => (
    <CopiableAddress address={row.address} length={isMobile ? 'short' : 'full'} />
  )
  return renderAddress
}

function renderType(row: AccountTableRow) {
  return row.type === SignerType.Ledger ? 'Ledger' : 'Local'
}

interface RenameForm {
  newName: string
}

function RenameAccountModal(props: { row: AccountTableRow; close: () => void }) {
  const { row, close } = props
  const dispatch = useDispatch()

  const onSubmit = (values: RenameForm) => {
    if (values.newName !== row.name) {
      dispatch(
        editAccountActions.trigger({
          action: EditAccountAction.Rename,
          address: row.address,
          newName: values.newName,
        })
      )
    }
    close()
  }

  const { values, errors, handleChange, handleBlur, handleSubmit } = useCustomForm<RenameForm>(
    { newName: '' },
    onSubmit,
    validateForm
  )

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={style.renameDescription}>Please input a new name for the account.</p>
        <TextInput
          name="newName"
          value={values.newName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="My new name"
          width="11em"
          {...errors['newName']}
        />
        <Button size="s" margin="1.8em 0 0 0" type="submit">
          Rename
        </Button>
      </Box>
    </form>
  )
}

function validateForm(values: RenameForm): ErrorState {
  if (!values.newName) return invalidInput('newName', 'New name is required')
  if (values.newName.length > MAX_ACCOUNT_NAME_LENGTH)
    return invalidInput('newName', 'New name is too long')
  return { isValid: true }
}

const style: Stylesheet = {
  identicon: {
    marginRight: '0.75em',
  },
  pencilIcon: {
    width: '0.7em',
    height: 'auto',
  },
  accountTypeIcon: {
    width: '1em',
    height: 'auto',
    marginLeft: '0.5em',
  },
  renameDescription: {
    ...modalStyles.p,
    margin: '0 0 1.75em 0',
  },
}
