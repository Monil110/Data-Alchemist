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

  // Advanced parser for natural language queries
  function filterWorkersByQuery(workers: any[], query: string) {
    if (!query.trim()) return workers;
    let filtered = workers;
    // Numeric comparison: "capacity > 80" or "Capacity >= 50"
    const capacityMatch = query.match(/capacity\s*(=|>|<|>=|<=|is|:)?\s*(\d+)/i);
    if (capacityMatch) {
      const op = capacityMatch[1] || '=';
      const capacity = parseInt(capacityMatch[2], 10);
      filtered = filtered.filter(w => {
        if (op === '>' || op === 'gt') return w.Capacity > capacity;
        if (op === '<' || op === 'lt') return w.Capacity < capacity;
        if (op === '>=' || op === 'ge') return w.Capacity >= capacity;
        if (op === '<=' || op === 'le') return w.Capacity <= capacity;
        return w.Capacity === capacity;
      });
    }
    // Array inclusion: "with skill S1" or "skill S1"
    const skillMatch = query.match(/skill\s*(id)?\s*(=|is|:)?\s*([\w-]+)/i);
    if (skillMatch) {
      const skillId = skillMatch[3];
      filtered = filtered.filter(w => w.SkillIDs && w.SkillIDs.includes(skillId));
    }
    // Status filter: "available" or "status available"
    const statusMatch = query.match(/status\s*(=|is|:)?\s*(\w+)/i);
    if (statusMatch) {
      const status = statusMatch[2];
      filtered = filtered.filter(w => w.Status && w.Status.toLowerCase() === status.toLowerCase());
    }
    // Logical AND: "capacity > 80 and with skill S1"
    if (/ and /i.test(query)) {
      const parts = query.split(/ and /i);
      return parts.reduce((acc, part) => filterWorkersByQuery(acc, part), workers);
    }
    // Logical OR: "capacity 100 or capacity 90"
    if (/ or /i.test(query)) {
      const parts = query.split(/ or /i);
      const sets = parts.map(part => filterWorkersByQuery(workers, part));
      // Union of all sets
      const union = sets.flat().filter((v, i, arr) => arr.findIndex(x => x.WorkerID === v.WorkerID) === i);
      return union;
    }
    return filtered;
  }

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
