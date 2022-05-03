import { PropsWithChildren, useEffect, useState } from 'react'
import { Stylesheet } from 'src/styles/types'

interface Props {
  show: boolean // Should the elements be on the page
  duration?: string // Duration of fade animation
  transparent?: boolean // Remove elements or just make them transparent when not shown
}

export function Fade(props: PropsWithChildren<Props>) {
  const { show, duration, transparent, children } = props
  const [render, setRender] = useState(show)

  useEffect(() => {
    if (show) setRender(true)
  }, [show])

  const onAnimationEnd = () => {
    if (!show) setRender(false)
  }

  return render ? (
    <div
      css={{
        animation: `${show ? 'fadeIn' : 'fadeOut'} ${duration ?? '1s'}`,
        position: 'relative',
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  ) : transparent ? (
    <div css={style.transparent} onAnimationEnd={onAnimationEnd}>
      {children}
    </div>
  ) : null
}

const style: Stylesheet = {
  transparent: {
    visibility: 'hidden',
    position: 'relative',
  },
}
