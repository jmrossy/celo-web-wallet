import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { DONATION_ADDRESS } from 'src/consts'
import { Contact, ContactMap } from 'src/features/contacts/types'
import { logger } from 'src/utils/logger'

interface Contacts {
  contacts: ContactMap
}

const contactsInitialState: Contacts = {
  contacts: {
    [DONATION_ADDRESS]: { address: DONATION_ADDRESS, name: 'Othello Donations' },
  },
}

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: contactsInitialState,
  reducers: {
    addContact: (state, action: PayloadAction<Contact>) => {
      const newContact = action.payload
      const address = newContact.address
      if (state.contacts[address]) {
        logger.warn('Contact already exists for address:', address)
        return
      }
      state.contacts = { ...state.contacts, [address]: newContact }
    },
    removeContact: (state, action: PayloadAction<Address>) => {
      const address = action.payload
      if (!state.contacts[address]) {
        logger.warn('No contact found for address:', address)
        return
      }
      delete state.contacts[address]
    },
    renameContact: (state, action: PayloadAction<{ address: Address; newName: string }>) => {
      const { address, newName } = action.payload
      if (!state.contacts[address]) {
        logger.warn('No contact found for address:', address)
        return
      }
      state.contacts[address].name = newName
    },
    resetContacts: () => contactsInitialState,
  },
})

export const { addContact, removeContact, renameContact, resetContacts } = contactsSlice.actions
const contactsReducer = contactsSlice.reducer

const persistConfig = {
  key: 'contacts',
  storage: storage,
  whitelist: ['contacts'],
}

export const persistedContactsReducer = persistReducer<ReturnType<typeof contactsReducer>>(
  persistConfig,
  contactsReducer
)
