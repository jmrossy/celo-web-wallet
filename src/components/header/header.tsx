import * as React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/rootReducer'

function Header() {
  const address = useSelector((s: RootState) => s.account.address)
  return (
    <h1
      css={{
        backgroundColor: 'green',
      }}
    >
      Your address is {address}
    </h1>
  )
}

export default Header
