import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { RenameAccountModal, RenameForm } from 'src/components/RenameModal'
import { Table, TableColumn } from 'src/components/table/Table'
import { createAddressField, createAddressNameField } from 'src/components/table/tableUtils'
import { AddContactModal } from 'src/features/contacts/AddContactModal'
import { removeContact, renameContact } from 'src/features/contacts/contactsSlice'
import { ContactMap } from 'src/features/contacts/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'

export function ContactsTable({ isMobile }: { isMobile: boolean }) {
  const contacts = useAppSelector((s) => s.contacts.contacts)

  const { showModalAsync, showModalWithContent, closeModal } = useModal()
  const dispatch = useAppDispatch()

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
  address: Address
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
