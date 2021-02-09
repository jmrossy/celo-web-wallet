import { Fragment, ReactElement, useMemo, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Column {
  header: string
  id: string // it's key in the data
}

type DataElement = { id: string } & Record<string, any>

interface Props<T extends DataElement> {
  columns: Column[]
  data: T[]
  renderExpanded: (data: T) => ReactElement
  initialSortBy?: string // column id
}

export function Table<T extends DataElement>(props: Props<T>) {
  const { columns, data, renderExpanded, initialSortBy } = props

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
    <table css={style.table}>
      <thead>
        <tr>
          {columns.map((column) => {
            const isSelected = column.id === sortBy
            const thStyle = isSelected ? [style.headerTh, style.headerThSelected] : style.headerTh
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
                  const cell = row[column.id]
                  return (
                    <td key={`table-cell-${i}-${j}`} css={style.td}>
                      <>
                        {j === 0 && (
                          <ChevronIcon
                            width="10px"
                            height="6px"
                            direction={isExpanded ? 's' : 'e'}
                            styles={style.rowChevron}
                          />
                        )}
                        {cell}
                      </>
                    </td>
                  )
                })}
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={columns.length}>{renderExpanded(row)}</td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

function sortDataBy<T extends DataElement>(data: T[], columnId: string, decending: boolean) {
  return [...data].sort((a, b) => {
    const order = decending ? a[columnId] < b[columnId] : a[columnId] >= b[columnId]
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
    padding: '0 20px 15px 20px',
    borderBottom: '1px solid #D8DADB',
    cursor: 'pointer',
  },
  headerThSelected: {
    opacity: 0.9,
    paddingRight: 0,
  },
  headerChevron: {
    opacity: 0.9,
    marginLeft: 8,
  },
  spacerTh: {
    height: 15,
  },
  td: {
    ...Font.body2,
    ...thTextAlign,
    paddingBottom: '1.75em',
    cursor: 'pointer',
  },
  rowChevron: {
    marginRight: 12,
    marginBottom: 2,
    opacity: 0.5,
  },
}
