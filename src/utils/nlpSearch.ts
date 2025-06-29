import { Client } from '@/types/client';
import { Worker } from '@/types/worker';
import { Task } from '@/types/task';

export interface SearchResult {
  id: string;
  entity: 'clients' | 'workers' | 'tasks';
  match: string;
  score: number;
  field: string;
  value: any;
}

// Local search implementation for basic queries
function localSearch(
  query: string,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Search in clients
  clients.forEach(client => {
    let score = 0;
    let match = '';
    let field = '';

    // Search by name
    if (client.ClientName?.toLowerCase().includes(queryLower)) {
      score += 80;
      match = `Name: ${client.ClientName}`;
      field = 'ClientName';
    }

    // Search by priority
    if (queryLower.includes('priority')) {
      const priorityMatch = queryLower.match(/priority\s*(\d+)/i);
      if (
        priorityMatch &&
        priorityMatch[1] !== undefined &&
        Number(client.PriorityLevel) === Number(priorityMatch[1])
      ) {
        score += 70;
        match = `Priority Level: ${client.PriorityLevel}`;
        field = 'PriorityLevel';
      }
    }

    // Search by requested tasks
    if (queryLower.includes('task') && client.RequestedTaskIDs && client.RequestedTaskIDs.length > 0) {
      const taskMatch = queryLower.match(/task\s*([a-zA-Z0-9]+)/i);
      if (taskMatch && taskMatch[1] !== undefined && client.RequestedTaskIDs.includes(taskMatch[1])) {
        score += 60;
        match = `Requested Task: ${taskMatch[1]}`;
        field = 'RequestedTaskIDs';
      }
    }

    if (score > 0) {
      results.push({
        id: client.ClientID,
        entity: 'clients',
        match,
        score,
        field,
        value: client[field as keyof Client]
      });
    }
  });

  // Search in workers
  workers.forEach(worker => {
    let score = 0;
    let match = '';
    let field = '';

    // Search by name
    if (worker.WorkerName?.toLowerCase().includes(queryLower)) {
      score += 80;
      match = `Name: ${worker.WorkerName}`;
      field = 'WorkerName';
    }

    // Search by skills
    if (queryLower.includes('skill') && worker.Skills && worker.Skills.length > 0) {
      const skillMatch = queryLower.match(/skill\s*([a-zA-Z0-9]+)/i);
      if (skillMatch && skillMatch[1] !== undefined && worker.Skills.includes(skillMatch[1])) {
        score += 70;
        match = `Skill: ${skillMatch[1]}`;
        field = 'Skills';
      }
    }

    // Search by worker group
    if (queryLower.includes('group') && worker.WorkerGroup) {
      if (worker.WorkerGroup.toLowerCase().includes(queryLower)) {
        score += 60;
        match = `Group: ${worker.WorkerGroup}`;
        field = 'WorkerGroup';
      }
    }

    // Search by max load
    if (queryLower.includes('maxload') && worker.MaxLoadPerPhase) {
      const loadMatch = queryLower.match(/maxload\s*(\d+)/i);
      if (loadMatch && loadMatch[1] !== undefined && worker.MaxLoadPerPhase === parseInt(loadMatch[1])) {
        score += 50;
        match = `Max Load: ${worker.MaxLoadPerPhase}`;
        field = 'MaxLoadPerPhase';
      }
    }

    if (score > 0) {
      results.push({
        id: worker.WorkerID,
        entity: 'workers',
        match,
        score,
        field,
        value: worker[field as keyof Worker]
      });
    }
  });

  // Search in tasks
  tasks.forEach(task => {
    let score = 0;
    let match = '';
    let field = '';

    // Search by name
    if (task.TaskName?.toLowerCase().includes(queryLower)) {
      score += 80;
      match = `Name: ${task.TaskName}`;
      field = 'TaskName';
    }

    // Search by duration
    if (queryLower.includes('duration') && task.Duration) {
      const durationMatch = queryLower.match(/duration\s*(\d+)/i);
      if (durationMatch && durationMatch[1] !== undefined && task.Duration === parseInt(durationMatch[1])) {
        score += 70;
        match = `Duration: ${task.Duration}`;
        field = 'Duration';
      }
    }

    // Search by required skills
    if (queryLower.includes('skill') && task.RequiredSkills && task.RequiredSkills.length > 0) {
      const skillMatch = queryLower.match(/skill\s*([a-zA-Z0-9]+)/i);
      if (skillMatch && skillMatch[1] !== undefined && task.RequiredSkills.includes(skillMatch[1])) {
        score += 60;
        match = `Required Skill: ${skillMatch[1]}`;
        field = 'RequiredSkills';
      }
    }

    // Search by preferred phases
    if (queryLower.includes('phase') && task.PreferredPhases && task.PreferredPhases.length > 0) {
      const phaseMatch = queryLower.match(/phase\s*(\d+)/i);
      if (phaseMatch && phaseMatch[1] !== undefined && task.PreferredPhases.includes(parseInt(phaseMatch[1]))) {
        score += 50;
        match = `Preferred Phase: ${phaseMatch[1]}`;
        field = 'PreferredPhases';
      }
    }

    if (score > 0) {
      results.push({
        id: task.TaskID,
        entity: 'tasks',
        match,
        score,
        field,
        value: task[field as keyof Task]
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

// AI-powered search using the backend API
async function aiSearch(
  query: string,
  entityType: 'clients' | 'workers' | 'tasks'
): Promise<SearchResult[]> {
  try {
    const response = await fetch('/api/ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        entityType,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Execute the generated filter code
    const filterFunction = new Function('data', data.filterCode);
    
    // Get the appropriate data based on entity type
    let allData: any[] = [];
    let entityKey: string;
    
    switch (entityType) {
      case 'clients':
        allData = (typeof window !== 'undefined' && window.__DATA__?.clients) ? window.__DATA__.clients : [];
        entityKey = 'ClientID';
        break;
      case 'workers':
        allData = (typeof window !== 'undefined' && window.__DATA__?.workers) ? window.__DATA__.workers : [];
        entityKey = 'WorkerID';
        break;
      case 'tasks':
        allData = (typeof window !== 'undefined' && window.__DATA__?.tasks) ? window.__DATA__.tasks : [];
        entityKey = 'TaskID';
        break;
      default:
        return [];
    }

    const filteredData = filterFunction(allData);
    
    return (filteredData ?? []).filter(Boolean).map((item: any) => {
      const safeItem = item as any;
      return {
        id: safeItem[entityKey as string] ?? '',
        entity: entityType,
        match: `AI matched: ${(safeItem.Name || safeItem[entityKey as string] || '')}`,
        score: 90, // High score for AI matches
        field: 'AI',
        value: safeItem
      };
    });

  } catch (error) {
    console.error('AI search error:', error);
    return [];
  }
}

// Main search function that combines local and AI search
export async function searchWithNaturalLanguage(
  query: string,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): Promise<SearchResult[]> {
  // First, try local search for immediate results
  const localResults = localSearch(query, clients, workers, tasks);
  
  // If we have good local results, return them
  if (localResults.length > 0 && localResults[0] && localResults[0].score > 60) {
    return localResults;
  }

  // Otherwise, try AI search for more complex queries
  try {
    // Determine entity type from query
    let entityType: 'clients' | 'workers' | 'tasks' = 'clients';
    if (query.toLowerCase().includes('worker')) {
      entityType = 'workers';
    } else if (query.toLowerCase().includes('task')) {
      entityType = 'tasks';
    }

    const aiResults = await aiSearch(query, entityType);
    
    // Combine and deduplicate results
    const combined = [...localResults, ...aiResults];
    const unique = combined.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id && r.entity === result.entity)
    );
    
    return unique.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Search error:', error);
    return localResults;
  }
}

// Declare global data for AI search
declare global {
  interface Window {
    __DATA__?: {
      clients: Client[];
      workers: Worker[];
      tasks: Task[];
    };
  }
} 