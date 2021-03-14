import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { defaultButtonStyles } from 'src/components/buttons/Button'
import { CopiableAddress } from 'src/components/buttons/CopiableAddress'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { Table, TableColumn } from 'src/components/Table'
import { getTotalLockedCelo } from 'src/features/lock/utils'
import { AddTokenModal } from 'src/features/wallet/AddTokenModal'
import { fetchBalancesActions, fetchBalancesSagaName } from 'src/features/wallet/fetchBalances'
import { Balances, BalanceTableRow, TokenBalances } from 'src/features/wallet/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { LockedCELO, Token } from 'src/tokens'
import { fromWeiRounded } from 'src/utils/amount'
import { SagaStatus } from 'src/utils/saga'

export function BalanceDetailsScreen() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchBalancesActions.trigger())
  }, [])

  const status = useSagaStatus(
    fetchBalancesSagaName,
    'Error Fetching Balances',
    'Something went wrong when loading balances, sorry! Please try again later.'
  )

  const balances = useSelector((state: RootState) => state.wallet.balances)

  const data = useMemo(() => {
    return balancesToTableData(balances)
  }, [balances])

  const isMobile = useIsMobile()
  const responsiveTableColumns = isMobile ? tableColumns : tableColumnsWithWei

  const { showModalWithContent, closeModal } = useModal()
  const onClickAdd = () => {
    showModalWithContent('Add New Token', <AddTokenModal close={closeModal} />)
  }

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={style.h1}>Account Balance Details</h1>
        <Table<BalanceTableRow>
          columns={responsiveTableColumns}
          data={data}
          isLoading={status === SagaStatus.Started}
          initialSortBy="balance"
        />
        <button css={style.addButton} onClick={onClickAdd}>
          + Add a new currency/token
        </button>
      </div>
    </ScreenContentFrame>
  )
}

const tableColumns: TableColumn[] = [
  {
    header: 'Currency',
    id: 'token',
  },
  {
    header: 'Balance',
    id: 'balance',
  },
  {
    header: 'Contract Address',
    id: 'address',
    renderer: renderAddress,
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

function renderAddress(token: Token) {
  return <CopiableAddress address={token.address} length="short" />
}

function balancesToTableData(balances: Balances): BalanceTableRow[] {
  const tableRows: BalanceTableRow[] = []

  const tokensWithLocked: TokenBalances = {
    ...balances.tokens,
    lockedCELO: {
      ...LockedCELO,
      value: getTotalLockedCelo(balances).toString(),
    },
  }

  for (const token of Object.values(tokensWithLocked)) {
    tableRows.push({
      id: token.id,
      token: token.label,
      balance: parseFloat(fromWeiRounded(token.value, token)),
      balanceWei: token.value,
      address: token.address,
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
    marginBottom: '2em',
  },
  addButton: {
    ...defaultButtonStyles,
    width: '100%',
    padding: '0.5em 1em',
    borderRadius: 6,
    color: `${Color.primaryBlack}cc`,
    backgroundColor: Color.fillLighter,
    ':hover': {
      backgroundColor: Color.fillLight,
    },
    ':active': {
      backgroundColor: Color.fillMedium,
    },
  },
}
