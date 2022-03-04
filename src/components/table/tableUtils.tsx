import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { TransparentIconButton } from 'src/components/buttons/TransparentIconButton'
import { PencilIcon } from 'src/components/icons/Pencil'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Stylesheet } from 'src/styles/types'
import { trimToLength } from 'src/utils/string'

export function createAddressField<P extends { address: Address }>(isMobile: boolean) {
  const renderer = (row: P) => (
    <CopiableAddress address={row.address} length={isMobile ? 'short' : 'full'} />
  )
  return {
    header: 'Address',
    id: 'address',
    renderer,
  }
}

export function createAddressNameField<P extends { address: Address; name: string }>(
  onClickEdit: (row: P) => void,
  maxLength = 22
) {
  const renderer = (row: P) => (
    <Box align="center">
      <Identicon address={row.address} styles={style.identicon} size={28} />
      <div>{trimToLength(row.name, maxLength)}</div>
      <TransparentIconButton
        title="Edit name"
        icon={<PencilIcon color="#3d434a" styles={style.pencilIcon} />}
        margin="0 0 0 0.5em"
        onClick={() => onClickEdit(row)}
      />
    </Box>
  )
  return {
    header: 'Name',
    id: 'name',
    renderer,
  }
}

const style: Stylesheet = {
  identicon: {
    marginRight: '0.75em',
  },
  pencilIcon: {
    width: '0.7em',
    height: 'auto',
  },
}
