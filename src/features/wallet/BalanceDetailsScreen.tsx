import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { Table, TableColumn } from 'src/components/Table'
import { fetchBalancesActions, fetchBalancesSagaName } from 'src/features/wallet/fetchBalances'
import { BalanceTableRow } from 'src/features/wallet/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
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

  // const data = useMemo(() => {
  //   return validatorGroupsToTableData(groups)
  // }, [groups])
  const data = [] as any

  return (
    <ScreenContentFrame>
      <div css={style.content}>
        <h1 css={Font.h2Green}>Balance Details</h1>
        <Table<BalanceTableRow>
          columns={tableColumns}
          data={data}
          isLoading={status === SagaStatus.Started}
        />
      </div>
    </ScreenContentFrame>
  )
}

const tableColumns: TableColumn[] = [
  {
    header: 'Token',
    id: 'token',
  },
  {
    header: 'Balance',
    id: 'balance',
  },
  {
    header: 'Balance (Wei)',
    id: 'balanceWei',
  },
  {
    header: 'Contract Address',
    id: 'address',
    renderer: (addr) => shortenAddress(addr, true),
  },
]

const style: Stylesheet = {
  content: {
    width: '100%',
  },
}
