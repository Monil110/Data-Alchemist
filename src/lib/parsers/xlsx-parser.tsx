// src/lib/parsers/xlsx-parser.ts
import * as XLSX from 'xlsx';
import { Client, Worker, Task, ParsedData } from '@/types';
import { parseCommaSeparated, parsePhaseRange, parseJSON } from '@/lib/utils';

// Reuse header mappings from csv-parser
const CLIENT_HEADER_MAPPING = {
  'client_id': 'ClientID',
  'clientid': 'ClientID',
  'id': 'ClientID',
  'client_name': 'ClientName',
  'clientname': 'ClientName',
  'name': 'ClientName',
  'priority_level': 'PriorityLevel',
  'prioritylevel': 'PriorityLevel',
  'priority': 'PriorityLevel',
  'requested_task_ids': 'RequestedTaskIDs',
  'requestedtaskids': 'RequestedTaskIDs',
  'tasks': 'RequestedTaskIDs',
  'group_tag': 'GroupTag',
  'grouptag': 'GroupTag',
  'group': 'GroupTag',
  'attributes_json': 'AttributesJSON',
  'attributesjson': 'AttributesJSON',
  'attributes': 'AttributesJSON',
  'metadata': 'AttributesJSON'
};

const WORKER_HEADER_MAPPING = {
  'worker_id': 'WorkerID',
  'workerid': 'WorkerID',
  'id': 'WorkerID',
  'worker_name': 'WorkerName',
  'workername': 'WorkerName',
  'name': 'WorkerName',
  'available_slots': 'AvailableSlots',
  'availableslots': 'AvailableSlots',
  'slots': 'AvailableSlots',
  'max_load_per_phase': 'MaxLoadPerPhase',
  'maxloadperphase': 'MaxLoadPerPhase',
  'max_load': 'MaxLoadPerPhase',
  'worker_group': 'WorkerGroup',
  'workergroup': 'WorkerGroup',
  'group': 'WorkerGroup',
  'qualification_level': 'QualificationLevel',
  'qualificationlevel': 'QualificationLevel',
  'qualification': 'QualificationLevel'
};

const TASK_HEADER_MAPPING = {
  'task_id': 'TaskID',
  'taskid': 'TaskID',
  'id': 'TaskID',
  'task_name': 'TaskName',
  'taskname': 'TaskName',
  'name': 'TaskName',
  'required_skills': 'RequiredSkills',
  'requiredskills': 'RequiredSkills',
  'skills': 'RequiredSkills',
  'preferred_phases': 'PreferredPhases',
  'preferredphases': 'PreferredPhases',
  'phases': 'PreferredPhases',
  'max_concurrent': 'MaxConcurrent',
  'maxconcurrent': 'MaxConcurrent',
  'concurrent': 'MaxConcurrent'
};

function normalizeHeaders(headers: string[], mapping: Record<string, string>): string[] {
  return headers.map(header => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    return mapping[normalized] || header;
  });
}

function parseClientRow(row: any): Client | null {
  try {
    return {
      ClientID: row.ClientID?.toString() || '',
      ClientName: row.ClientName?.toString() || '',
      PriorityLevel: parseInt(row.PriorityLevel) || 1,
      RequestedTaskIDs: parseCommaSeparated(row.RequestedTaskIDs),
      GroupTag: row.GroupTag?.toString() || '',
      AttributesJSON: parseJSON(row.AttributesJSON)
    };
  } catch {
    return null;
  }
}

function parseWorkerRow(row: any): Worker | null {
  try {
    return {
      WorkerID: row.WorkerID?.toString() || '',
      WorkerName: row.WorkerName?.toString() || '',
      Skills: parseCommaSeparated(row.Skills),
      AvailableSlots: parsePhaseRange(row.AvailableSlots),
      MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase) || 1,
      WorkerGroup: row.WorkerGroup?.toString() || '',
      QualificationLevel: row.QualificationLevel?.toString() || ''
    };
  } catch {
    return null;
  }
}

function parseTaskRow(row: any): Task | null {
  try {
    return {
      TaskID: row.TaskID?.toString() || '',
      TaskName: row.TaskName?.toString() || '',
      Category: row.Category?.toString() || '',
      Duration: parseInt(row.Duration) || 1,
      RequiredSkills: parseCommaSeparated(row.RequiredSkills),
      PreferredPhases: parsePhaseRange(row.PreferredPhases),
      MaxConcurrent: parseInt(row.MaxConcurrent) || 1
    };
  } catch {
    return null;
  }
}

export function parseXLSX(
  file: File,
  type: 'clients' | 'workers' | 'tasks'
): Promise<ParsedData> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (json.length < 2) {
        resolve({ errors: ['No data found in sheet'] });
        return;
      }
      const headers = normalizeHeaders(json[0] as string[],
        type === 'clients' ? CLIENT_HEADER_MAPPING :
        type === 'workers' ? WORKER_HEADER_MAPPING :
        TASK_HEADER_MAPPING
      );
      const rows = json.slice(1).map(rowArr => {
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = rowArr[idx];
        });
        return rowObj;
      });
      let parsedData: Client[] | Worker[] | Task[] = [];
      if (type === 'clients') {
        parsedData = rows.map(parseClientRow).filter(Boolean) as Client[];
      } else if (type === 'workers') {
        parsedData = rows.map(parseWorkerRow).filter(Boolean) as Worker[];
      } else if (type === 'tasks') {
        parsedData = rows.map(parseTaskRow).filter(Boolean) as Task[];
      }
      resolve({ [type]: parsedData, errors: [] } as ParsedData);
    };
    reader.onerror = () => {
      resolve({ errors: ['Failed to read file'] });
    };
    reader.readAsArrayBuffer(file);
  });
}