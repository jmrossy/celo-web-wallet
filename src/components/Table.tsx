import { ReactElement, useMemo, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

interface Column {
  header: string
  id: string // it's key in the data
}

type DataElement = Record<string, string | ReactElement>

interface Props {
  columns: Column[]
  data: DataElement[]
  initialSortBy?: string // column id
}

export function Table(props: Props) {
  const { columns, data, initialSortBy } = props

  const [sortBy, setSortBy] = useState(initialSortBy ?? columns[0].id)
  const [sortDesc, setSortDesc] = useState(true)

  // React doesn't seem to export the type we need here, using any
  const onColumnClick = (event: any) => {
    const cellIndex = event?.target?.cellIndex
    if (cellIndex === null || cellIndex === undefined) {
      throw new Error('table event missing cellIndex')
    }
    const columnId = columns[cellIndex].id
    if (columnId === sortBy) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(columnId)
      setSortDesc(true)
    }
  }

  const sortedData = useMemo(() => {
    return sortDataBy(data, sortBy, sortDesc)
  }, [data, sortBy, sortDesc])

  return (
    <table css={style.table}>
      <thead>
        <tr>
          {columns.map((column) => {
            const isSelected = column.id === sortBy
            const thStyle = isSelected ? [style.headerTh, style.headerThSelected] : style.headerTh
            return (
              <th key={`table-column-${column.id}`} onClick={onColumnClick} css={thStyle}>
                <>
                  {column.header}
                  {isSelected && (
                    <ChevronIcon width="14px" height="8px" direction={sortDesc ? 's' : 'n'} />
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
          return (
            <tr key={`table-row-${i}`}>
              {Object.keys(row).map((cell, j) => {
                return (
                  <td key={`table-cell-${i}-${j}`} css={style.th}>
                    {row[cell]}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// export function Table(props: Props) {
//   const { columns, data } = props
//   const tableInstance = useTable<Record<string,string>>({ columns, data }, useSortBy)

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance

//   return (
//     <table {...getTableProps()}>
//       <thead>
//         {headerGroups.map((group) => {
//           const { key, ...groupProps } = group.getHeaderGroupProps()
//           return (
//             <tr key={key} {...groupProps}>
//               {group.headers.map((_column) => {
//                 const sortProps = _column.getSortByToggleProps()
//                 const { key, ...headerProps } = _column.getHeaderProps(sortProps)
//                 return (
//                   <th key={key} {...headerProps}>
//                     {_column.render('Header')}
//                   </th>
//                 )
//               })}
//             </tr>
//           )
//         })}
//       </thead>
//       <tbody {...getTableBodyProps()}>
//         {rows.map((row) => {
//           prepareRow(row)
//           const { key, ...rowProps } = row.getRowProps()
//           return (
//             <tr key={key} {...rowProps}>
//               {row.cells.map((cell) => {
//                 const { key, ...cellProps } = cell.getCellProps()
//                 return (
//                   <td key={key} {...cellProps}>
//                     {cell.render('Cell')}
//                   </td>
//                 )
//               })}
//             </tr>
//           )
//         })}
//       </tbody>
//     </table>
//   )
// }

function sortDataBy(data: DataElement[], columnId: string, decending: boolean) {
  return [...data].sort((a, b) => {
    const order = decending ? a[columnId] < b[columnId] : a[columnId] >= b[columnId]
    return order ? -1 : 1
  })
}

const thTextAlign = {
  textAlign: 'center',
  ':first-of-type': {
    textAlign: 'left',
  },
  ':last-of-type': {
    textAlign: 'right',
  },
}

const style: Stylesheet = {
  table: {
    width: '100%',
    maxWidth: '80em',
    borderSpacing: 0,
  },
  headerTh: {
    ...Font.body2,
    ...Font.bold,
    opacity: 0.7,
    ...thTextAlign,
    paddingBottom: '0.8em',
    borderBottom: '1px solid #D8DADB',
    cursor: 'pointer',
  },
  headerThSelected: {
    opacity: 0.9,
  },
  th: {
    ...Font.body2,
    ...thTextAlign,
    paddingBottom: '1.5em',
    cursor: 'pointer',
  },
  spacerTh: {
    height: '0.8em',
  },
}
