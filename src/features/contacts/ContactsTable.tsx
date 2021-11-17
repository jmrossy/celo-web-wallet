import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/rootReducer'
import { Button } from '../../components/buttons/Button'
import { Box } from '../../components/layout/Box'
import { useModal } from '../../components/modal/useModal'
import { RenameAccountModal, RenameForm } from '../../components/RenameModal'
import { Table, TableColumn } from '../../components/table/Table'
import { createAddressField, createAddressNameField } from '../../components/table/tableUtils'
import { AddContactModal } from './AddContactModal'
import { removeContact, renameContact } from './contactsSlice'
import { ContactMap } from './types'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'

export function ContactsTable({ isMobile }: { isMobile: boolean }) {
  const contacts = useSelector((s: RootState) => s.contacts.contacts)

  const { showModalAsync, showModalWithContent, closeModal } = useModal()
  const dispatch = useDispatch()

  const onClickAdd = () => {
    showModalWithContent({
      head: 'Add New Contact',
      content: <AddContactModal contacts={contacts} close={closeModal} />,
      headColor: Color.primaryGreen,
    })
  }

  const onClickEditName = async (row: ContactTableRow) => {
    const onEditNameSubmit = (values: RenameForm) => {
      if (values.newName !== row.name) {
        dispatch(renameContact({ address: row.address, newName: values.newName }))
      }
      closeModal()
    }
    showModalWithContent({
      head: 'Rename Contact',
      content: <RenameAccountModal onSubmit={onEditNameSubmit} label="contact" />,
    })
  }

  const onClickRemove = async (id: string) => {
    const answer = await showModalAsync({
      head: 'Remove Contact Confirmation',
      subHead: 'Are you sure you want to remove this contact?',
      body: 'Removing will not affect your transactions or your history with this address.',
      actions: [
        { key: 'cancel', label: 'Cancel', color: Color.primaryWhite },
        { key: 'remove', label: 'Remove' },
      ],
    })
    if (answer && answer.key === 'remove') {
      dispatch(removeContact(id))
    }
  }

  const tableColumns = getTableColumns(isMobile, onClickEditName)
  const data = useMemo(() => {
    return contactsToTableData(contacts, onClickRemove)
  }, [contacts])

  return (
    <>
      <Box align="center" justify="between" margin={`2em ${data.length ? '0.7em' : '0'} 1.2em 0`}>
        <h2 css={Font.tableHeader}>Your Contacts</h2>
        <Button onClick={onClickAdd} size="xs" height="2em">
          Add Contact
        </Button>
      </Box>
      <Table<ContactTableRow>
        columns={tableColumns}
        data={data}
        initialSortBy="name"
        hideDividerLine={true}
      />
    </>
  )
}

function contactsToTableData(
  contacts: ContactMap,
  onRemove: (id: string) => void
): ContactTableRow[] {
  if (!contacts) return []
  return Object.values(contacts).map((a) => ({
    id: a.address,
    address: a.address,
    name: a.name,
    onRemove,
  }))
}

interface ContactTableRow {
  id: string
  name: string
  address: string
  onRemove?: (id: string) => void
}

function getTableColumns(
  isMobile: boolean,
  onClickEditName: (row: ContactTableRow) => void
): TableColumn[] {
  return [
    createAddressNameField<ContactTableRow>(onClickEditName, 30),
    createAddressField<ContactTableRow>(isMobile),
  ]
}
