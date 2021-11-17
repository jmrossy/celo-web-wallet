import { CopiableAddress } from '../buttons/CopiableAddress'
import { TransparentIconButton } from '../buttons/TransparentIconButton'
import { PencilIcon } from '../icons/Pencil'
import { Identicon } from '../Identicon'
import { Box } from '../layout/Box'
import { Stylesheet } from '../../styles/types'
import { trimToLength } from '../../utils/string'

export function createAddressField<P extends { address: string }>(isMobile: boolean) {
  const renderer = (row: P) => (
    <CopiableAddress address={row.address} length={isMobile ? 'short' : 'full'} />
  )
  return {
    header: 'Address',
    id: 'address',
    renderer,
  }
}

export function createAddressNameField<P extends { address: string; name: string }>(
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
