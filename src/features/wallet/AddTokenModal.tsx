import { useDispatch } from 'react-redux'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'

export function AddTokenModal(props: { close: () => void }) {
  const dispatch = useDispatch()

  const onClickAdd = () => {
    console.log('adding!')
  }

  return (
    <Box direction="column" align="center">
      <p>Any ERC-20 compatible tokens can be added to your wallet.</p>
      <p>Choose a known token or enter the contract address.</p>
      <Box direction="row" align="center">
        <Button size="s" color={Color.altGrey} margin="1em" onClick={props.close}>
          Cancel
        </Button>
        <Button size="s" margin="1em" onClick={onClickAdd}>
          Add
        </Button>
      </Box>
    </Box>
  )
}
