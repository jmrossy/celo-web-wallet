import { CircleIcon } from 'src/components/icons/Circle'
import { Box } from 'src/components/layout/Box'

// A.k.a. three dots dropdown
export function KebabMenuIcon({
  color,
  size,
  margin,
}: {
  color: string
  size: number
  margin?: string
}) {
  return (
    <Box direction="column" align="center" margin={margin}>
      <CircleIcon size={size} color={color} />
      <CircleIcon size={size} color={color} margin={`${size * 0.8}px 0 0 0`} />
      <CircleIcon size={size} color={color} margin={`${size * 0.8}px 0 0 0`} />
    </Box>
  )
}
