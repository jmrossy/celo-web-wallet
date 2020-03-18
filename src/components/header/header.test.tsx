import * as React from 'react'
import { renderWithProvider } from '../../test/utils'
import Header from './header'

describe(Header, () => {
  test('snapshot', () => {
    const { asFragment } = renderWithProvider(<Header />)
    expect(asFragment()).toMatchSnapshot()
  })
})
