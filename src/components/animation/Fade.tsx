import { PropsWithChildren, useEffect, useState } from 'react'

interface Props {
  show: boolean
  duration?: string
}

export function Fade(props: PropsWithChildren<Props>) {
  const { show, duration, children } = props
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
  ) : null
}
