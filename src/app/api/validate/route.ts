import { NextRequest, NextResponse } from 'next/server';
import { Client, Worker, Task, ValidationError, ValidationErrorType } from '@/types';

function validateClients(clients: Client[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  clients.forEach((client, idx) => {
    if (!client.ClientID || client.ClientID.trim() === '') {
      errors.push({
        id: `client-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'ClientID is required',
        entityType: 'client',
        entityId: client.ClientID || '',
        field: 'ClientID',
        row: idx + 1
      });
    } else if (seenIds.has(client.ClientID)) {
      errors.push({
        id: `client-${idx}`,
        type: ValidationErrorType.DUPLICATE_ID,
        severity: 'error',
        message: `Duplicate ClientID: ${client.ClientID}`,
        entityType: 'client',
        entityId: client.ClientID,
        field: 'ClientID',
        row: idx + 1
      });
    } else {
      seenIds.add(client.ClientID);
    }
    if (!client.ClientName || client.ClientName.trim() === '') {
      errors.push({
        id: `client-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'ClientName is required',
        entityType: 'client',
        entityId: client.ClientID || '',
        field: 'ClientName',
        row: idx + 1
      });
    }
    if (typeof client.PriorityLevel !== 'number' || isNaN(client.PriorityLevel)) {
      errors.push({
        id: `client-${idx}`,
        type: ValidationErrorType.OUT_OF_RANGE,
        severity: 'warning',
        message: 'PriorityLevel should be a number',
        entityType: 'client',
        entityId: client.ClientID || '',
        field: 'PriorityLevel',
        row: idx + 1
      });
    }
  });
  return errors;
}

function validateWorkers(workers: Worker[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  workers.forEach((worker, idx) => {
    if (!worker.WorkerID || worker.WorkerID.trim() === '') {
      errors.push({
        id: `worker-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'WorkerID is required',
        entityType: 'worker',
        entityId: worker.WorkerID || '',
        field: 'WorkerID',
        row: idx + 1
      });
    } else if (seenIds.has(worker.WorkerID)) {
      errors.push({
        id: `worker-${idx}`,
        type: ValidationErrorType.DUPLICATE_ID,
        severity: 'error',
        message: `Duplicate WorkerID: ${worker.WorkerID}`,
        entityType: 'worker',
        entityId: worker.WorkerID,
        field: 'WorkerID',
        row: idx + 1
      });
    } else {
      seenIds.add(worker.WorkerID);
    }
    if (!worker.WorkerName || worker.WorkerName.trim() === '') {
      errors.push({
        id: `worker-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'WorkerName is required',
        entityType: 'worker',
        entityId: worker.WorkerID || '',
        field: 'WorkerName',
        row: idx + 1
      });
    }
    if (!Array.isArray(worker.Skills) || worker.Skills.length === 0) {
      errors.push({
        id: `worker-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'warning',
        message: 'Skills should be a non-empty array',
        entityType: 'worker',
        entityId: worker.WorkerID || '',
        field: 'Skills',
        row: idx + 1
      });
    }
  });
  return errors;
}

function validateTasks(tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  tasks.forEach((task, idx) => {
    if (!task.TaskID || task.TaskID.trim() === '') {
      errors.push({
        id: `task-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'TaskID is required',
        entityType: 'task',
        entityId: task.TaskID || '',
        field: 'TaskID',
        row: idx + 1
      });
    } else if (seenIds.has(task.TaskID)) {
      errors.push({
        id: `task-${idx}`,
        type: ValidationErrorType.DUPLICATE_ID,
        severity: 'error',
        message: `Duplicate TaskID: ${task.TaskID}`,
        entityType: 'task',
        entityId: task.TaskID,
        field: 'TaskID',
        row: idx + 1
      });
    } else {
      seenIds.add(task.TaskID);
    }
    if (!task.TaskName || task.TaskName.trim() === '') {
      errors.push({
        id: `task-${idx}`,
        type: ValidationErrorType.MISSING_REQUIRED,
        severity: 'error',
        message: 'TaskName is required',
        entityType: 'task',
        entityId: task.TaskID || '',
        field: 'TaskName',
        row: idx + 1
      });
    }
    if (typeof task.Duration !== 'number' || isNaN(task.Duration) || task.Duration < 1) {
      errors.push({
        id: `task-${idx}`,
        type: ValidationErrorType.OUT_OF_RANGE,
        severity: 'warning',
        message: 'Duration should be a number >= 1',
        entityType: 'task',
        entityId: task.TaskID || '',
        field: 'Duration',
        row: idx + 1
      });
    }
  });
  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const { clients, workers, tasks } = await req.json();
    let errors: ValidationError[] = [];

    if (clients && Array.isArray(clients)) {
      errors = errors.concat(validateClients(clients));
    }
    if (workers && Array.isArray(workers)) {
      errors = errors.concat(validateWorkers(workers));
    }
    if (tasks && Array.isArray(tasks)) {
      errors = errors.concat(validateTasks(tasks));
    }

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      totalErrors: errors.length
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Failed to validate data' }, { status: 500 });
  }
}
