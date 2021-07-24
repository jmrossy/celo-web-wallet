import { Fragment, FunctionComponent, ReactElement, useMemo, useState } from 'react'
import { CloseButton } from 'src/components/buttons/CloseButton'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { Spinner } from 'src/components/Spinner'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

export interface TableColumn {
  id: string // its key in the data
  header: string
  renderer?: (dataCell: any) => string | ReactElement
}

type DataElement = { id: string; onRemove?: (id: string) => void } & Record<string, any>

interface Props<T extends DataElement> {
  columns: TableColumn[]
  data: T[]
  ExpandedRow?: FunctionComponent<{ row: T }>
  initialSortBy?: string // column id
  isLoading?: boolean
  hideDividerLine?: boolean
}

export function Table<T extends DataElement>(props: Props<T>) {
  const { columns, data, ExpandedRow, initialSortBy, isLoading, hideDividerLine } = props

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

  const tableStyle = useMemo(() => getTableStyle(data, isLoading), [data, isLoading])

  return (
    <div css={style.container}>
      <table css={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSelected = column.id === sortBy
              return (
                <th
                  key={`table-column-${column.id}`}
                  onClick={() => onColumnClick(column.id)}
                  css={getThStyle(isSelected, hideDividerLine)}
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
                        <div css={{ position: 'relative' }}>
                          {j === 0 && ExpandedRow && (
                            <ChevronIcon
                              width="8px"
                              height="6px"
                              direction={isExpanded ? 's' : 'e'}
                              styles={style.rowChevron}
                            />
                          )}
                          {column.renderer ? column.renderer(row) : row[column.id]}
                          {row.onRemove && j === columns.length - 1 && (
                            <div css={style.removeButtonContainer}>
                              <CloseButton
                                title="Remove"
                                onClick={() => row.onRemove!(row.id)}
                                styles={style.removeButton}
                                iconStyles={style.removeButton}
                              />
                            </div>
                          )}
                        </div>
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

function getTableStyle(data: DataElement[], isLoading?: boolean): Styles {
  const hasRemoveButton = data.findIndex((d) => !!d.onRemove) >= 0
  const baseStyles = hasRemoveButton ? tableWithRemoveButtons : style.table
  return isLoading
    ? {
        ...baseStyles,
        opacity: 0.7,
        filter: 'blur(3px)',
      }
    : baseStyles
}

function getThStyle(isSelected: boolean, hideBorder?: boolean): Styles {
  const thStyle = isSelected ? headerThSelected : style.headerTh
  return hideBorder ? { ...thStyle, border: 'none', paddingBottom: 0 } : thStyle
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
    opacity: 0.9,
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
  removeButtonContainer: {
    position: 'absolute',
    right: '-3em',
    top: '14%',
    paddingRight: '0.75em',
  },
  removeButton: {
    height: '1em',
    width: '1em',
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

const tableWithRemoveButtons: Styles = {
  ...style.table,
  width: '93%',
  [mq[768]]: {
    width: '95%',
  },
  [mq[1024]]: {
    width: '96%',
  },
  [mq[1200]]: {
    width: '98%',
  },
}

const headerThSelected: Styles = {
  ...style.headerTh,
  opacity: 1,
  paddingRight: 0,
}

const tdExandable: Styles = {
  ...style.td,
  cursor: 'pointer',
}
