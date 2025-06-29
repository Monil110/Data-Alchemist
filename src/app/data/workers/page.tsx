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

  // Advanced parser for natural language queries
  function filterWorkersByQuery(workers: Worker[], query: string): Worker[] {
    if (!query.trim()) return workers;
    let filtered = workers;
    
    // Numeric comparison: "maxload > 80" or "MaxLoadPerPhase >= 50"
    const maxLoadMatch = query.match(/maxload(perphase)?\s*(=|>|<|>=|<=|is|:)?\s*(\d+)/i);
    if (maxLoadMatch) {
      const op = maxLoadMatch[2] || '=';
      const maxLoadStr = maxLoadMatch[3];
      if (maxLoadStr) {
        const maxLoad = parseInt(maxLoadStr, 10);
        filtered = filtered.filter(w => {
          if (op === '>' || op === 'gt') return w.MaxLoadPerPhase > maxLoad;
          if (op === '<' || op === 'lt') return w.MaxLoadPerPhase < maxLoad;
          if (op === '>=' || op === 'ge') return w.MaxLoadPerPhase >= maxLoad;
          if (op === '<=' || op === 'le') return w.MaxLoadPerPhase <= maxLoad;
          return w.MaxLoadPerPhase === maxLoad;
        });
      }
    }
    
    // Array inclusion: "with skill S1" or "skill S1"
    const skillMatch = query.match(/skill\s*(id)?\s*(=|is|:)?\s*([\w-]+)/i);
    if (skillMatch) {
      const skillId = skillMatch[3];
      if (skillId) {
        filtered = filtered.filter(w => w.Skills && w.Skills.includes(skillId));
      }
    }
    
    // Group filter: "group A" or "worker group A"
    const groupMatch = query.match(/group\s*(=|is|:)?\s*([\w-]+)/i);
    if (groupMatch) {
      const group = groupMatch[2];
      if (group) {
        filtered = filtered.filter(w => w.WorkerGroup && w.WorkerGroup.toLowerCase() === group.toLowerCase());
      }
    }
    
    // Qualification filter: "qualification high" or "level high"
    const qualMatch = query.match(/qualification(level)?\s*(=|is|:)?\s*([\w-]+)/i);
    if (qualMatch) {
      const qual = qualMatch[3];
      if (qual) {
        filtered = filtered.filter(w => w.QualificationLevel && w.QualificationLevel.toLowerCase() === qual.toLowerCase());
      }
    }
    
    // Logical AND: "maxload > 80 and with skill S1"
    if (/ and /i.test(query)) {
      const parts = query.split(/ and /i);
      return parts.reduce((acc, part) => filterWorkersByQuery(acc, part), workers);
    }
    
    // Logical OR: "maxload 100 or maxload 90"
    if (/ or /i.test(query)) {
      const parts = query.split(/ or /i);
      const sets: Worker[][] = parts.map(part => filterWorkersByQuery(workers, part));
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
        validationErrors={{ ...validationErrors, ...mappedValidationErrors }}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
