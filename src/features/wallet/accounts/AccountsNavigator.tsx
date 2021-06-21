import { Outlet } from 'react-router-dom'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Styles } from 'src/styles/types'

export function AccountsNavigator() {
  return (
    <ScreenContentFrame showBackButton={true}>
      <div css={contentContainer}>
        <Outlet />
      </div>
    </ScreenContentFrame>
  )
}

const contentContainer: Styles = {
  minWidth: 'calc(min(60vw, 40rem))',
}
