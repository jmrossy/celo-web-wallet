import { Fragment, FunctionComponent, ReactElement, useMemo, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { Spinner } from 'src/components/Spinner'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

export interface TableColumn {
  id: string // its key in the data
  header: string
  renderer?: (dataCell: any) => string | ReactElement
}

type DataElement = { id: string } & Record<string, any>

interface Props<T extends DataElement> {
  columns: TableColumn[]
  data: T[]
  ExpandedRow?: FunctionComponent<{ row: T }>
  initialSortBy?: string // column id
  isLoading?: boolean
}

export function Table<T extends DataElement>(props: Props<T>) {
  const { columns, data, ExpandedRow, initialSortBy, isLoading } = props

  const [sortBy, setSortBy] = useState(initialSortBy ?? columns[0].id)
  const [sortDesc, setSortDesc] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const sortedData = useMemo(() => {
    return sortDataBy<T>(data, sortBy, sortDesc)
  }, [data, sortBy, sortDesc])

  const onColumnClick = (columnId: string) => {
    if (columnId === sortBy) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(columnId)
      setSortDesc(true)
    }
  }

  const onRowClick = (id: string) => {
    setExpandedRows({ ...expandedRows, [id]: !expandedRows[id] })
  }

  return (
    <div css={style.container}>
      <table css={isLoading ? tableLoading : style.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSelected = column.id === sortBy
              const thStyle = isSelected ? headerThSelected : style.headerTh
              return (
                <th
                  key={`table-column-${column.id}`}
                  onClick={() => onColumnClick(column.id)}
                  css={thStyle}
                >
                  <>
                    {column.header}
                    {isSelected && (
                      <ChevronIcon
                        width="12px"
                        height="7px"
                        direction={sortDesc ? 's' : 'n'}
                        styles={style.headerChevron}
                      />
                    )}
                  </>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} css={style.spacerTh}></td>
          </tr>
          {sortedData.map((row, i) => {
            const isExpanded = !!expandedRows[row.id]
            return (
              <Fragment key={`table-row-${i}`}>
                <tr onClick={() => onRowClick(row.id)}>
                  {columns.map((column, j) => {
                    return (
                      <td key={`table-cell-${i}-${j}`} css={ExpandedRow ? tdExandable : style.td}>
                        <>
                          {j === 0 && ExpandedRow && (
                            <ChevronIcon
                              width="8px"
                              height="6px"
                              direction={isExpanded ? 's' : 'e'}
                              styles={style.rowChevron}
                            />
                          )}
                          {column.renderer ? column.renderer(row) : row[column.id]}
                        </>
                      </td>
                    )
                  })}
                </tr>
                {ExpandedRow && isExpanded && (
                  <tr>
                    <td colSpan={columns.length}>
                      <ExpandedRow row={row} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {isLoading && (
        <div css={style.spinner}>
          <Spinner />
        </div>
      )}
    </div>
  )
}

function sortDataBy<T extends DataElement>(data: T[], columnId: string, decending: boolean) {
  return [...data].sort((a, b) => {
    let aVal = a[columnId]
    let bVal = b[columnId]
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    const order = decending ? aVal > bVal : aVal <= bVal
    return order ? -1 : 1
  })
}

const thTextAlign = {
  textAlign: 'center',
  ':first-of-type': {
    textAlign: 'left',
    paddingLeft: 0,
  },
  ':last-of-type': {
    textAlign: 'right',
    paddingRight: 0,
  },
}

const style: Stylesheet = {
  container: {
    position: 'relative',
  },
  table: {
    width: '100%',
    maxWidth: '80em',
    borderSpacing: 0,
    '*': {
      transition: 'initial',
    },
  },
  headerTh: {
    ...Font.body2,
    ...Font.bold,
    opacity: 0.7,
    ...thTextAlign,
    padding: '0 20px 17px 20px',
    borderBottom: '1px solid #D8DADB',
    cursor: 'pointer',
  },
  headerChevron: {
    opacity: 0.9,
    marginLeft: 8,
  },
  spacerTh: {
    height: 17,
  },
  td: {
    ...Font.body2,
    ...thTextAlign,
    paddingBottom: '1.75em',
  },
  rowChevron: {
    marginRight: 12,
    marginBottom: 2,
    opacity: 0.5,
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 400,
    zIndex: 100,
    opacity: 0.7,
  },
}

const tableLoading: Styles = {
  ...style.table,
  opacity: 0.7,
  filter: 'blur(3px)',
}

const headerThSelected: Styles = {
  ...style.headerTh,
  opacity: 0.9,
  paddingRight: 0,
}

const tdExandable: Styles = {
  ...style.td,
  cursor: 'pointer',
}
