import { Client } from '@/types/client';
import { Worker } from '@/types/worker';
import { Task } from '@/types/task';
import { BusinessRule } from '@/types/rules';
import { ValidationError } from '@/types/validation';

export function validateAll(
  clients: Client[],
  workers: Worker[],
  tasks: Task[],
  businessRules: BusinessRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Missing required columns validation
  clients.forEach((client, index) => {
    if (!client.ClientID || !client.ClientName) {
      errors.push({
        id: `missing_columns_client_${Date.now()}`,
        entityType: 'client',
        severity: 'error',
        message: `Client ${index + 1} is missing required ClientID or ClientName`,
        affectedEntity: 'client',
        suggestions: ['Add the missing columns: ClientID, ClientName']
      });
    }
  });

  workers.forEach((worker, index) => {
    if (!worker.WorkerID || !worker.WorkerName) {
      errors.push({
        id: `missing_columns_worker_${Date.now()}`,
        entityType: 'worker',
        severity: 'error',
        message: `Worker ${index + 1} is missing required WorkerID or WorkerName`,
        affectedEntity: 'worker',
        suggestions: ['Add the missing columns: WorkerID, WorkerName']
      });
    }
  });

  tasks.forEach((task, index) => {
    if (!task.TaskID || !task.TaskName) {
      errors.push({
        id: `missing_columns_task_${Date.now()}`,
        entityType: 'task',
        severity: 'error',
        message: `Task ${index + 1} is missing required TaskID or TaskName`,
        affectedEntity: 'task',
        suggestions: ['Add the missing columns: TaskID, TaskName']
      });
    }
  });

  // 2. Duplicate IDs validation
  const clientIds = new Set<string>();
  clients.forEach(client => {
    if (client.ClientID) {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          id: `duplicate_id_client_${client.ClientID}`,
          entityType: 'client',
          severity: 'error',
          message: `Duplicate ClientID found: ${client.ClientID}`,
          field: 'ClientID',
          value: client.ClientID,
          affectedEntity: 'client'
        });
      } else {
        clientIds.add(client.ClientID);
      }
    }
  });

  const workerIds = new Set<string>();
  workers.forEach(worker => {
    if (worker.WorkerID) {
      if (workerIds.has(worker.WorkerID)) {
        errors.push({
          id: `duplicate_id_worker_${worker.WorkerID}`,
          entityType: 'worker',
          severity: 'error',
          message: `Duplicate WorkerID found: ${worker.WorkerID}`,
          field: 'WorkerID',
          value: worker.WorkerID,
          affectedEntity: 'worker'
        });
      } else {
        workerIds.add(worker.WorkerID);
      }
    }
  });

  const taskIds = new Set<string>();
  tasks.forEach(task => {
    if (task.TaskID) {
      if (taskIds.has(task.TaskID)) {
        errors.push({
          id: `duplicate_id_task_${task.TaskID}`,
          entityType: 'task',
          severity: 'error',
          message: `Duplicate TaskID found: ${task.TaskID}`,
          field: 'TaskID',
          value: task.TaskID,
          affectedEntity: 'task'
        });
      } else {
        taskIds.add(task.TaskID);
      }
    }
  });

  // 3. Out-of-range values validation
  clients.forEach(client => {
    if (client.PriorityLevel && (client.PriorityLevel < 1 || client.PriorityLevel > 5)) {
      errors.push({
        id: `out_of_range_value_client_${client.ClientID}`,
        entityType: 'client',
        severity: 'error',
        message: `Client ${client.ClientID} PriorityLevel must be between 1-5, got ${client.PriorityLevel}`,
        field: 'PriorityLevel',
        value: client.PriorityLevel,
        affectedEntity: 'client'
      });
    }
  });

  tasks.forEach(task => {
    if (task.Duration && task.Duration < 1) {
      errors.push({
        id: `out_of_range_value_task_${task.TaskID}`,
        entityType: 'task',
        severity: 'error',
        message: `Task ${task.TaskID} Duration must be at least 1, got ${task.Duration}`,
        field: 'Duration',
        value: task.Duration,
        affectedEntity: 'task'
      });
    }
  });

  // 4. Unknown references validation
  clients.forEach(client => {
    if (client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!tasks.some(task => task.TaskID === taskId)) {
          errors.push({
            id: `unknown_reference_client_${client.ClientID}_${taskId}`,
            entityType: 'client',
            severity: 'error',
            message: `Client ${client.ClientID} references unknown TaskID: ${taskId}`,
            field: 'RequestedTaskIDs',
            value: taskId,
            affectedEntity: 'client'
          });
        }
      });
    }
  });

  // 5. Basic skill coverage validation
  const allWorkerSkills = new Set<string>();
  workers.forEach(worker => {
    if (worker.Skills && Array.isArray(worker.Skills)) {
      worker.Skills.forEach(skill => allWorkerSkills.add(skill));
    }
  });

  tasks.forEach(task => {
    if (task.RequiredSkills && Array.isArray(task.RequiredSkills)) {
      task.RequiredSkills.forEach(skill => {
        if (!allWorkerSkills.has(skill)) {
          errors.push({
            id: `skill_coverage_task_${task.TaskID}_${skill}`,
            entityType: 'task',
            severity: 'warning',
            message: `Required skill '${skill}' for Task ${task.TaskID} not covered by any worker`,
            field: 'RequiredSkills',
            value: skill,
            affectedEntity: 'task'
          });
        }
      });
    }
  });

  // 6. Malformed lists (non-numeric in AvailableSlots)
  workers.forEach(worker => {
    if (worker.AvailableSlots && Array.isArray(worker.AvailableSlots)) {
      worker.AvailableSlots.forEach((slot, idx) => {
        if (typeof slot !== 'number' || isNaN(slot)) {
          errors.push({
            id: `malformed_list_worker_${worker.WorkerID}_${idx}`,
            entityType: 'worker',
            severity: 'error',
            message: `Worker ${worker.WorkerID} has non-numeric value in AvailableSlots at index ${idx}`,
            field: `AvailableSlots[${idx}]`,
            value: slot,
            affectedEntity: 'worker'
          });
        }
      });
    }
    if (worker.Skills && !Array.isArray(worker.Skills)) {
      errors.push({
        id: `malformed_list_worker_${worker.WorkerID}_skills`,
        entityType: 'worker',
        severity: 'error',
        message: `Worker ${worker.WorkerID} has malformed Skills list`,
        field: 'Skills',
        value: worker.Skills,
        affectedEntity: 'worker'
      });
    }
  });

  // 7. Broken JSON in AttributesJSON
  clients.forEach(client => {
    if (client.AttributesJSON && typeof client.AttributesJSON === 'string') {
      try {
        JSON.parse(client.AttributesJSON);
      } catch {
        errors.push({
          id: `broken_json_client_${client.ClientID}`,
          entityType: 'client',
          severity: 'error',
          message: `Client ${client.ClientID} has invalid JSON in AttributesJSON`,
          field: 'AttributesJSON',
          value: client.AttributesJSON,
          affectedEntity: 'client'
        });
      }
    }
  });

  // 8. Overloaded workers (AvailableSlots.length < MaxLoadPerPhase)
  workers.forEach(worker => {
    if (
      Array.isArray(worker.AvailableSlots) &&
      typeof worker.MaxLoadPerPhase === 'number' &&
      worker.AvailableSlots.length < worker.MaxLoadPerPhase
    ) {
      errors.push({
        id: `overloaded_worker_${worker.WorkerID}`,
        entityType: 'worker',
        severity: 'error',
        message: `Worker ${worker.WorkerID} has MaxLoadPerPhase (${worker.MaxLoadPerPhase}) greater than AvailableSlots (${worker.AvailableSlots.length})`,
        field: 'MaxLoadPerPhase',
        value: worker.MaxLoadPerPhase,
        affectedEntity: 'worker'
      });
    }
  });

  // 8. Circular co-run groups (A→B→C→A)
  // Assume co-run rules have type 'co-run' and a 'group' array of TaskIDs
  const coRunGroups = businessRules.filter(r => r.type === 'co-run' && Array.isArray((r as any).group));
  const visited: Record<string, boolean> = {};
  const stack: Record<string, boolean> = {};
  function hasCycle(taskId: string, group: string[]): boolean {
    if (!visited[taskId]) {
      visited[taskId] = true;
      stack[taskId] = true;
      for (const neighbor of group) {
        if (!visited[neighbor] && hasCycle(neighbor, group)) return true;
        else if (stack[neighbor]) return true;
      }
    }
    stack[taskId] = false;
    return false;
  }
  coRunGroups.forEach(rule => {
    const group = (rule as any).group as string[];
    for (const taskId of group) {
      if (hasCycle(taskId, group)) {
        errors.push({
          id: `circular_co_run_group_${taskId}`,
          entityType: 'Task',
          severity: 'error',
          message: `Circular co-run group detected involving TaskID ${taskId}`,
          field: 'group',
          value: group.join(', '),
          affectedEntity: 'Task',
          suggestions: []
        });
        break;
      }
    }
  });

  // 9. Conflicting rules vs. phase-window constraints
  // Assume phase-window rules have type 'phase-window' and fields: taskId, allowedPhases
  const phaseWindowRules = businessRules.filter(r => r.type === 'phase-window');
  phaseWindowRules.forEach(rule => {
    const task = tasks.find(t => t.TaskID === (rule as any).taskId);
    if (task && Array.isArray((rule as any).allowedPhases) && Array.isArray(task.PreferredPhases)) {
      const allowed = (rule as any).allowedPhases as number[];
      const preferred = task.PreferredPhases as number[];
      if (!preferred.every(phase => allowed.includes(phase))) {
        errors.push({
          id: `conflicting_phase_window_${task.TaskID}`,
          entityType: 'Task',
          severity: 'error',
          message: `Task ${task.TaskID} preferred phases conflict with phase-window rule`,
          field: 'PreferredPhases',
          value: preferred.join(', '),
          affectedEntity: 'Task',
          suggestions: []
        });
      }
    }
  });

  // 10. Phase-slot saturation: sum of task durations per phase ≤ total worker slots
  const phaseDurations: Record<number, number> = {};
  tasks.forEach(task => {
    if (Array.isArray(task.PreferredPhases)) {
      task.PreferredPhases.forEach(phase => {
        phaseDurations[phase] = (phaseDurations[phase] || 0) + (task.Duration || 0);
      });
    }
  });
  const phaseSlots: Record<number, number> = {};
  workers.forEach(worker => {
    if (Array.isArray(worker.AvailableSlots)) {
      worker.AvailableSlots.forEach(phase => {
        phaseSlots[phase] = (phaseSlots[phase] || 0) + 1;
      });
    }
  });
  Object.keys(phaseDurations).forEach(phaseStr => {
    const phase = Number(phaseStr);
    if (
      typeof phaseDurations[phase] !== 'undefined' &&
      phaseDurations[phase] > (phaseSlots[phase] || 0)
    ) {
      errors.push({
        id: `phase_slot_saturation_${phase}`,
        entityType: 'Phase',
        severity: 'warning',
        message: `Phase ${phase} is oversubscribed: total task durations (${phaseDurations[phase]}) > total worker slots (${phaseSlots[phase] || 0})`,
        field: 'AvailableSlots',
        value: undefined,
        affectedEntity: 'Phase',
        suggestions: []
      });
    }
  });

  // 11. Skill-coverage matrix: every RequiredSkill maps to ≥1 worker
  const allSkills = new Set<string>();
  workers.forEach(w => (w.Skills || []).forEach((s: string) => allSkills.add(s)));
  tasks.forEach(task => {
    (task.RequiredSkills || []).forEach(skill => {
      if (!allSkills.has(skill)) {
        errors.push({
          id: `skill_coverage_task_${task.TaskID}_${skill}`,
          entityType: 'Task',
          severity: 'error',
          message: `Required skill '${skill}' for Task ${task.TaskID} not covered by any worker`,
          field: 'RequiredSkills',
          value: skill,
          affectedEntity: 'Task',
          suggestions: []
        });
      }
    });
  });

  // 12. Max-concurrency feasibility: MaxConcurrent ≤ count of qualified, available workers
  tasks.forEach(task => {
    const qualified = workers.filter(w =>
      (w.Skills || []).some((s: string) => (task.RequiredSkills || []).includes(s)) &&
      (w.AvailableSlots || []).some((slot: number) => (task.PreferredPhases || []).includes(slot))
    );
    if (task.MaxConcurrent > qualified.length) {
      errors.push({
        id: `max_concurrency_feasibility_${task.TaskID}`,
        entityType: 'Task',
        severity: 'warning',
        message: `Task ${task.TaskID} MaxConcurrent (${task.MaxConcurrent}) exceeds qualified, available workers (${qualified.length})`,
        field: 'MaxConcurrent',
        value: task.MaxConcurrent,
        affectedEntity: 'Task',
        suggestions: []
      });
    }
  });

  return errors;
} 