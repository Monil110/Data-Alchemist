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
        type: 'MissingRequiredColumns',
        severity: 'error',
        message: `Client ${index + 1} is missing required ClientID or ClientName`,
        affectedEntity: 'client',
        entityId: client.ClientID || `client-${index}`,
      });
    }
  });

  workers.forEach((worker, index) => {
    if (!worker.WorkerID || !worker.WorkerName) {
      errors.push({
        type: 'MissingRequiredColumns',
        severity: 'error',
        message: `Worker ${index + 1} is missing required WorkerID or WorkerName`,
        affectedEntity: 'worker',
        entityId: worker.WorkerID || `worker-${index}`,
      });
    }
  });

  tasks.forEach((task, index) => {
    if (!task.TaskID || !task.TaskName) {
      errors.push({
        type: 'MissingRequiredColumns',
        severity: 'error',
        message: `Task ${index + 1} is missing required TaskID or TaskName`,
        affectedEntity: 'task',
        entityId: task.TaskID || `task-${index}`,
      });
    }
  });

  // 2. Duplicate IDs validation
  const clientIds = new Set<string>();
  clients.forEach(client => {
    if (client.ClientID) {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          type: 'DuplicateID',
          severity: 'error',
          message: `Duplicate ClientID found: ${client.ClientID}`,
          affectedEntity: 'client',
          entityId: client.ClientID,
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
          type: 'DuplicateID',
          severity: 'error',
          message: `Duplicate WorkerID found: ${worker.WorkerID}`,
          affectedEntity: 'worker',
          entityId: worker.WorkerID,
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
          type: 'DuplicateID',
          severity: 'error',
          message: `Duplicate TaskID found: ${task.TaskID}`,
          affectedEntity: 'task',
          entityId: task.TaskID,
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
        type: 'OutOfRangeValue',
        severity: 'error',
        message: `Client ${client.ClientID} PriorityLevel must be between 1-5, got ${client.PriorityLevel}`,
        affectedEntity: 'client',
        entityId: client.ClientID,
      });
    }
  });

  tasks.forEach(task => {
    if (task.Duration && task.Duration < 1) {
      errors.push({
        type: 'OutOfRangeValue',
        severity: 'error',
        message: `Task ${task.TaskID} Duration must be at least 1, got ${task.Duration}`,
        affectedEntity: 'task',
        entityId: task.TaskID,
      });
    }
  });

  // 4. Unknown references validation
  clients.forEach(client => {
    if (client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!tasks.some(task => task.TaskID === taskId)) {
          errors.push({
            type: 'UnknownReference',
            severity: 'error',
            message: `Client ${client.ClientID} references unknown TaskID: ${taskId}`,
            affectedEntity: 'client',
            entityId: client.ClientID,
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
            type: 'SkillCoverage',
            severity: 'warning',
            message: `Required skill '${skill}' for Task ${task.TaskID} not covered by any worker`,
            affectedEntity: 'task',
            entityId: task.TaskID,
          });
        }
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
          type: 'CircularCoRunGroup',
          severity: 'error',
          message: `Circular co-run group detected involving TaskID ${taskId}`,
          affectedEntity: 'Task',
          entityId: taskId,
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
          type: 'ConflictingPhaseWindow',
          severity: 'error',
          message: `Task ${task.TaskID} preferred phases conflict with phase-window rule`,
          affectedEntity: 'Task',
          entityId: task.TaskID,
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
    if (phaseDurations[phase] > (phaseSlots[phase] || 0)) {
      errors.push({
        type: 'PhaseSlotSaturation',
        severity: 'warning',
        message: `Phase ${phase} is oversubscribed: total task durations (${phaseDurations[phase]}) > total worker slots (${phaseSlots[phase] || 0})`,
        affectedEntity: 'Phase',
        entityId: String(phase),
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
          type: 'SkillCoverage',
          severity: 'error',
          message: `Required skill '${skill}' for Task ${task.TaskID} not covered by any worker`,
          affectedEntity: 'Task',
          entityId: task.TaskID,
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
        type: 'MaxConcurrencyFeasibility',
        severity: 'warning',
        message: `Task ${task.TaskID} MaxConcurrent (${task.MaxConcurrent}) exceeds qualified, available workers (${qualified.length})`,
        affectedEntity: 'Task',
        entityId: task.TaskID,
      });
    }
  });

  return errors;
} 