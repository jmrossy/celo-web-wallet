import { Outlet } from 'react-router'
import { ScreenFrameWithFeed } from 'src/components/layout/ScreenFrameWithFeed'

export function HomeFrame() {
  return (
    <ScreenFrameWithFeed>
      <Outlet />
    </ScreenFrameWithFeed>
  )
}
