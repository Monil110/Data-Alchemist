"use client";
import React, { useState, useEffect } from 'react';
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
  validationErrorsList.forEach(err => {
    const rowIndex = tasks.findIndex(t => t.TaskID === err.entityId);
    if (rowIndex !== -1 && err.field) {
      validationErrors[`${rowIndex}-${err.field}`] = err.message;
    }
  });

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const updated = [...tasks];
    const task = { ...updated[rowIndex] };
    // Basic inline validation example
    if (columnId === 'Duration' || columnId === 'MaxConcurrent') {
      const num = Number(value);
      if (isNaN(num) || num < 1) {
        setValidationErrors(prev => ({ ...prev, [`${rowIndex}-${columnId}`]: 'Must be a positive number' }));
      } else {
        delete validationErrors[`${rowIndex}-${columnId}`];
        setValidationErrors({ ...validationErrors });
        task[columnId] = num;
      }
    } else {
      task[columnId] = value;
      delete validationErrors[`${rowIndex}-${columnId}`];
      setValidationErrors({ ...validationErrors });
    }
    updated[rowIndex] = task;
    setTasks(updated);
    runValidation();
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    const filtered = tasks.filter((_, idx) => !selectedRows.includes(idx));
    setTasks(filtered);
    setSelectedRows([]);
  };

  // Advanced parser for natural language queries
  function filterTasksByQuery(tasks: any[], query: string) {
    if (!query.trim()) return tasks;
    let filtered = tasks;
    // Numeric comparison: "duration > 120" or "Duration >= 60"
    const durationMatch = query.match(/duration\s*(=|>|<|>=|<=|is|:)?\s*(\d+)/i);
    if (durationMatch) {
      const op = durationMatch[1] || '=';
      const duration = parseInt(durationMatch[2], 10);
      filtered = filtered.filter(t => {
        if (op === '>' || op === 'gt') return t.Duration > duration;
        if (op === '<' || op === 'lt') return t.Duration < duration;
        if (op === '>=' || op === 'ge') return t.Duration >= duration;
        if (op === '<=' || op === 'le') return t.Duration <= duration;
        return t.Duration === duration;
      });
    }
    // Array inclusion: "with skill S1" or "skill S1"
    const skillMatch = query.match(/skill\s*(id)?\s*(=|is|:)?\s*([\w-]+)/i);
    if (skillMatch) {
      const skillId = skillMatch[3];
      filtered = filtered.filter(t => t.RequiredSkillIDs && t.RequiredSkillIDs.includes(skillId));
    }
    // Status filter: "active" or "status active"
    const statusMatch = query.match(/status\s*(=|is|:)?\s*(\w+)/i);
    if (statusMatch) {
      const status = statusMatch[2];
      filtered = filtered.filter(t => t.Status && t.Status.toLowerCase() === status.toLowerCase());
    }
    // Phase filter: "phase 1" or "phase 1"
    const phaseMatch = query.match(/phase\s*(=|is|:)?\s*(\d+)/i);
    if (phaseMatch) {
      const phase = parseInt(phaseMatch[2], 10);
      filtered = filtered.filter(t => t.Phase === phase);
    }
    // Logical AND: "duration > 120 and with skill S1"
    if (/ and /i.test(query)) {
      const parts = query.split(/ and /i);
      return parts.reduce((acc, part) => filterTasksByQuery(acc, part), tasks);
    }
    // Logical OR: "duration 180 or duration 240"
    if (/ or /i.test(query)) {
      const parts = query.split(/ or /i);
      const sets = parts.map(part => filterTasksByQuery(tasks, part));
      // Union of all sets
      const union = sets.flat().filter((v, i, arr) => arr.findIndex(x => x.TaskID === v.TaskID) === i);
      return union;
    }
    return filtered;
  }

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
        validationErrors={validationErrors}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}
