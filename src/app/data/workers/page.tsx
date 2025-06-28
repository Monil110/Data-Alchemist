"use client";
import React, { useState, useEffect } from 'react';
import { useDataStore } from '@/store';
import { DataGrid } from '@/components/data-grid/data-grid';
import { Worker } from '@/types/worker';
import { ColumnDef } from '@tanstack/react-table';
import { ValidationPanel } from '@/components/validation/validation-panel';
import { useValidationStore } from '@/store/validation-slice';
import { ValidationStatusDashboard } from '@/components/validation/validation-summary';

const workerColumns: ColumnDef<Worker, any>[] = [
  { accessorKey: 'WorkerID', header: 'Worker ID' },
  { accessorKey: 'WorkerName', header: 'Worker Name' },
  { accessorKey: 'Skills', header: 'Skills' },
  { accessorKey: 'AvailableSlots', header: 'Available Slots' },
  { accessorKey: 'MaxLoadPerPhase', header: 'Max Load/Phase' },
  { accessorKey: 'WorkerGroup', header: 'Worker Group' },
  { accessorKey: 'QualificationLevel', header: 'Qualification Level' },
];

export default function WorkersPage() {
  const workers = useDataStore(s => s.workers);
  const setWorkers = useDataStore(s => s.setWorkers);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const runValidation = useValidationStore(s => s.runValidation);
  const validationErrorsList = useValidationStore(s => s.errors);

  useEffect(() => {
    runValidation();
  }, [workers, runValidation]);

  // Map validation errors to cell keys
  const validationErrors: Record<string, string> = {};
  validationErrorsList.forEach(err => {
    const rowIndex = workers.findIndex(w => w.WorkerID === err.entityId);
    if (rowIndex !== -1 && err.field) {
      validationErrors[`${rowIndex}-${err.field}`] = err.message;
    }
  });

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const updated = [...workers];
    const worker = { ...updated[rowIndex] };
    // Basic inline validation example
    if (columnId === 'MaxLoadPerPhase') {
      const num = Number(value);
      if (isNaN(num) || num < 1) {
        validationErrors[`${rowIndex}-${columnId}`] = 'Must be a positive number';
        worker[columnId] = num;
      } else {
        delete validationErrors[`${rowIndex}-${columnId}`];
        worker[columnId] = num;
      }
    } else {
      worker[columnId] = value;
      delete validationErrors[`${rowIndex}-${columnId}`];
    }
    updated[rowIndex] = worker;
    setWorkers(updated);
    runValidation();
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    const filtered = workers.filter((_, idx) => !selectedRows.includes(idx));
    setWorkers(filtered);
    setSelectedRows([]);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Workers</h2>
      <ValidationStatusDashboard />
      <ValidationPanel />
      <button
        onClick={handleBulkDelete}
        disabled={selectedRows.length === 0}
        style={{ marginBottom: 12, background: '#e53e3e', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 4 }}
      >
        Delete Selected
      </button>
      <DataGrid
        data={workers}
        columns={workerColumns}
        onCellEdit={handleCellEdit}
        validationErrors={validationErrors}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
