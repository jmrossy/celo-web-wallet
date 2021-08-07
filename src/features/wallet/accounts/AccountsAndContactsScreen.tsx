import { ContactsTable } from 'src/features/contacts/ContactsTable'
import { AccountsTable } from 'src/features/wallet/accounts/AccountsTable'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'

export function AccountsAndContactsScreen() {
  const isMobile = useIsMobile()

  return (
    <>
      <h2 css={Font.h2Center}>{'Accounts & Contacts'}</h2>
      <AccountsTable isMobile={isMobile} />
      <ContactsTable isMobile={isMobile} />
    </>
  )
}
