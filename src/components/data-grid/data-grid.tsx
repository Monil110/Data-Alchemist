import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

interface DataGridProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  onCellEdit?: (rowIndex: number, columnId: string, value: any) => void;
  validationErrors?: Record<string, string>; // key: `${rowIndex}-${columnId}`
  onSelectionChange?: (selected: number[]) => void;
}

export function DataGrid<T extends object>({ data, columns, onCellEdit, validationErrors, onSelectionChange }: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});

  // Notify parent of selected row indices
  React.useEffect(() => {
    if (onSelectionChange) {
      const selected = Object.entries(selectedRows)
        .filter(([_, v]) => v)
        .map(([k]) => Number(k));
      onSelectionChange(selected);
    }
  }, [selectedRows, onSelectionChange]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    debugTable: false,
  });

  const allVisibleRowsSelected = table.getRowModel().rows.every(row => selectedRows[row.index]);
  const someVisibleRowsSelected = table.getRowModel().rows.some(row => selectedRows[row.index]);

  const handleSelectAll = () => {
    const newSelected: Record<number, boolean> = {};
    if (!allVisibleRowsSelected) {
      table.getRowModel().rows.forEach(row => {
        newSelected[row.index] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (rowIndex: number) => {
    setSelectedRows(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        className="mb-2 p-1 border rounded"
        style={{ minWidth: 200 }}
      />
      <table className="min-w-full border text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup, i) => (
            <tr key={headerGroup.id}>
              {i === 0 && (
                <th className="border px-2 py-1 bg-gray-100">
                  <input
                    type="checkbox"
                    checked={allVisibleRowsSelected}
                    ref={el => {
                      if (el) el.indeterminate = !allVisibleRowsSelected && someVisibleRowsSelected;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border px-2 py-1 bg-gray-100 cursor-pointer select-none"
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ▲'}
                  {header.column.getIsSorted() === 'desc' && ' ▼'}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              <td className="border px-2 py-1">
                <input
                  type="checkbox"
                  checked={!!selectedRows[row.index]}
                  onChange={() => handleSelectRow(row.index)}
                />
              </td>
              {row.getVisibleCells().map(cell => {
                const errorKey = `${row.index}-${cell.column.id}`;
                const hasError = validationErrors && validationErrors[errorKey];
                return (
                  <td
                    key={cell.id}
                    className={`border px-2 py-1 ${hasError ? 'bg-red-100' : ''}`}
                  >
                    {onCellEdit ? (
                      <input
                        className="w-full bg-transparent outline-none"
                        value={String(cell.getValue() ?? '')}
                        onChange={e => onCellEdit(row.index, cell.column.id, e.target.value)}
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                    {hasError && (
                      <div className="text-xs text-red-600">{validationErrors[errorKey]}</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
