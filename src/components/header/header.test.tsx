import * as React from 'react'
import { renderWithProvider } from '../../test/utils'
import Header from './header'

describe('Header', () => {
  it('matches snapshot', () => {
    const { getByText } = renderWithProvider(<Header />)
    const createButton = getByText('Create New Wallet')
    expect(createButton).toBeTruthy()
  })
})
