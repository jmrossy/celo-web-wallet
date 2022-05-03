export function CircleIcon({
  color,
  size,
  margin,
}: {
  color: string
  size: string | number
  margin?: string
}) {
  return (
    <div
      css={{
        display: 'inline-block',
        background: color,
        width: size,
        height: size,
        margin,
        borderRadius: '50%',
      }}
    ></div>
  )
}
