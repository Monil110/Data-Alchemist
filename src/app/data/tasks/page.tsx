"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '@/store';
import { DataGrid } from '@/components/data-grid/data-grid';
import { Task } from '@/types/task';
import { ColumnDef } from '@tanstack/react-table';
import { ValidationPanel } from '@/components/validation/validation-panel';
import { useValidationStore } from '@/store/validation-slice';
import { ValidationStatusDashboard } from '@/components/validation/validation-summary';

const taskColumns: ColumnDef<Task, any>[] = [
  { accessorKey: 'TaskID', header: 'Task ID' },
  { accessorKey: 'TaskName', header: 'Task Name' },
  { accessorKey: 'Category', header: 'Category' },
  { accessorKey: 'Duration', header: 'Duration' },
  { accessorKey: 'RequiredSkills', header: 'Required Skills' },
  { accessorKey: 'PreferredPhases', header: 'Preferred Phases' },
  { accessorKey: 'MaxConcurrent', header: 'Max Concurrent' },
];

export default function TasksPage() {
  const tasks = useDataStore(s => s.tasks);
  const setTasks = useDataStore(s => s.setTasks);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const runValidation = useValidationStore(s => s.runValidation);
  const validationErrorsList = useValidationStore(s => s.errors);

  useEffect(() => {
    runValidation();
  }, [tasks, runValidation]);

  // Map validation errors to cell keys
  const mappedValidationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    validationErrorsList.forEach(err => {
      const rowIndex = tasks.findIndex(t => t.TaskID === err.id);
      if (rowIndex !== -1 && err.field) {
        errors[`${rowIndex}-${err.field}`] = err.message;
      }
    });
    return errors;
  }, [validationErrorsList, tasks]);

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const updated = [...tasks];
    const task = { ...updated[rowIndex] };
    // Basic inline validation example
    if (columnId === 'Duration' || columnId === 'MaxConcurrent') {
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
        (task as any)[columnId] = num;
      }
    } else {
      (task as any)[columnId] = value;
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${rowIndex}-${columnId}`];
        return newErrors;
      });
    }
    updated[rowIndex] = task as Task;
    setTasks(updated);
    runValidation();
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    const filtered = tasks.filter((_, idx) => !selectedRows.includes(idx));
    setTasks(filtered);
    setSelectedRows([]);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Tasks</h2>
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
        data={tasks}
        columns={taskColumns}
        onCellEdit={handleCellEdit}
        validationErrors={{ ...validationErrors, ...mappedValidationErrors }}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
