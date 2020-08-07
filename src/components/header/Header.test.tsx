import * as React from 'react'
import { renderWithProvider } from 'src/test/utils'
import { Header } from './Header'

describe('Header', () => {
  it('matches snapshot', () => {
    const { getByText } = renderWithProvider(<Header />)
    const createButton = getByText('Create New Wallet')
    expect(createButton).toBeTruthy()
  })
})
