"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const runValidation = useValidationStore(s => s.runValidation);
  const validationErrorsList = useValidationStore(s => s.errors);

  useEffect(() => {
    runValidation();
  }, [workers, runValidation]);

  // Map validation errors to cell keys
  const mappedValidationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    validationErrorsList.forEach(err => {
      const rowIndex = workers.findIndex(w => w.WorkerID === err.id);
      if (rowIndex !== -1 && err.field) {
        errors[`${rowIndex}-${err.field}`] = err.message;
      }
    });
    return errors;
  }, [validationErrorsList, workers]);

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const updated = [...workers];
    const worker = { ...updated[rowIndex] };
    // Basic inline validation example
    if (columnId === 'MaxLoadPerPhase') {
      const num = Number(value);
      if (isNaN(num) || num < 1) {
        setValidationErrors(prev => ({ ...prev, [`${rowIndex}-${columnId}`]: 'Must be a positive number' }));
        return;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${rowIndex}-${columnId}`];
          return newErrors;
        });
        (worker as any)[columnId] = num;
      }
    } else {
      (worker as any)[columnId] = value;
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${rowIndex}-${columnId}`];
        return newErrors;
      });
    }
    updated[rowIndex] = worker as Worker;
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
        validationErrors={{ ...validationErrors, ...mappedValidationErrors }}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
