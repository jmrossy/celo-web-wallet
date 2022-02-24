import { useEffect, useMemo } from 'react'
import { useAppDispatch } from 'src/app/hooks'
import { Address } from 'src/components/Address'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { TokenIcon } from 'src/components/icons/tokens/TokenIcon'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { ModalAction } from 'src/components/modal/modal'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { Table, TableColumn } from 'src/components/table/Table'
import { config } from 'src/config'
import { fetchBalancesActions, fetchBalancesSagaName } from 'src/features/balances/fetchBalances'
import { useBalancesWithTokens } from 'src/features/balances/hooks'
import { BalancesWithTokens, BalanceTableRow } from 'src/features/balances/types'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { AddTokenModal } from 'src/features/tokens/AddTokenModal'
import { removeToken } from 'src/features/tokens/tokensSlice'
import { isNativeToken } from 'src/features/tokens/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { LockedCELO } from 'src/tokens'
import { shortenAddress } from 'src/utils/addresses'
import { fromWeiRounded } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

export function BalanceDetailsScreen() {
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  const balances = useBalancesWithTokens()

  useEffect(() => {
    dispatch(fetchBalancesActions.trigger())
  }, [])

  const status = useSagaStatus(
    fetchBalancesSagaName,
    'Error Fetching Balances',
    'Something went wrong when loading balances, sorry! Please try again later.'
  )

  const { showModal, showModalWithContent, closeModal } = useModal()

  const onClickAdd = () => {
    showModalWithContent({ head: 'Add New Token', content: <AddTokenModal close={closeModal} /> })
  }

  const onClickRemove = (id: string) => {
    const actions = [
      { key: 'cancel', label: 'Cancel', color: Color.primaryWhite },
      { key: 'remove', label: 'Remove', color: Color.primaryGreen },
    ]
    const onActionClick = (action: ModalAction) => {
      if (action.key === 'remove') dispatch(removeToken(id))
      closeModal()
    }
    const tokenSymbol = balances.tokens[id].symbol
    showModal({
      head: 'Remove Token',
      subHead: `Would you like to remove ${tokenSymbol}?`,
      body: 'Note, this will not affect your balance. It will only hide this token from your wallet.',
      actions,
      onActionClick,
      size: 's',
    })
  }

  const onClickAddress = (row: BalanceTableRow) => {
    const name = row.token.name || row.token.symbol
    showModalWithContent({
      head: `${name} Token`,
      content: <TokenAddressDetails row={row} />,
    })
  }

  const tableColumns = getTableColumns(isMobile, onClickAddress)
  const tableData = useMemo(() => {
    return balancesToTableData(balances, onClickRemove)
  }, [balances])

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>Account Balance Details</h1>
        <Table<BalanceTableRow>
          columns={tableColumns}
          data={tableData}
          isLoading={status === SagaStatus.Started}
          initialSortBy="balance"
        />
        <DashedBorderButton onClick={onClickAdd} margin="0.5em 0 0 0">
          + Add a new currency/token
        </DashedBorderButton>
      </div>
    </ScreenContentFrame>
  )
}

function getTableColumns(isMobile: boolean, onClickAddress: (row: BalanceTableRow) => void) {
  const tableColumns: TableColumn[] = [
    {
      header: 'Currency',
      id: 'label',
      renderer: renderLabel,
    },
    {
      header: 'Balance',
      id: 'balance',
    },
    {
      header: 'Contract',
      id: 'address',
      renderer: createRenderAddress(onClickAddress),
    },
  ]

  const tableColumnsWithWei: TableColumn[] = [
    tableColumns[0],
    tableColumns[1],
    {
      header: 'Balance (Wei)',
      id: 'balanceWei',
    },
    tableColumns[2],
  ]

  return isMobile ? tableColumns : tableColumnsWithWei
}

function renderLabel(row: BalanceTableRow) {
  return (
    <Box align="center">
      <TokenIcon token={row.token} size="m" />
      <div css={style.tokenLabel}>{row.label}</div>
    </Box>
  )
}

function createRenderAddress(onClickAddress: (row: BalanceTableRow) => void) {
  const renderAddress = (row: BalanceTableRow) => {
    return (
      <button css={transparentButtonStyles} onClick={() => onClickAddress(row)}>
        {shortenAddress(row.address, true, true)}
      </button>
    )
  }
  return renderAddress
}

function TokenAddressDetails({ row }: { row: BalanceTableRow }) {
  return (
    <Box direction="column" align="center" margin="0 0 0.5em 0">
      <p css={style.tokenModalWarning}>
        This is the contract address, not your account! Do not send funds to this address!
      </p>
      <Address address={row.address} buttonType="copy" />
    </Box>
  )
}

function balancesToTableData(
  balances: BalancesWithTokens,
  onRemove: (id: string) => void
): BalanceTableRow[] {
  const tableRows: BalanceTableRow[] = []

  // Only show Locked CELO on desktop for now
  const tokens = config.isElectron
    ? {
        ...balances.tokens,
        [LockedCELO.address]: {
          ...LockedCELO,
          value: getTotalLockedCelo(balances).toString(),
        },
      }
    : balances.tokens

  for (const token of Object.values(tokens)) {
    const isNative = isNativeToken(token) || token.address === LockedCELO.address
    tableRows.push({
      id: token.address,
      label: token.symbol,
      balance: parseFloat(fromWeiRounded(token.value, token.decimals, false)),
      balanceWei: token.value,
      address: token.address,
      token,
      onRemove: !isNative ? onRemove : undefined,
    })
  }

  return tableRows
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '55rem',
  },
  h1: {
    ...Font.h2Green,
    marginBottom: '1.5em',
  },
  tokenLabel: {
    paddingLeft: '0.6em',
  },
  tokenModalWarning: {
    ...modalStyles.p,
    ...Font.bold,
    margin: '0 0 1.5em 0',
    maxWidth: '20em',
  },
}
