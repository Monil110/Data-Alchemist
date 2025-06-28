// src/lib/parsers/csv-parser.ts
import * as Papa from 'papaparse';
import { Client, Worker, Task, ParsedData } from '@/types';
import { parseCommaSeparated, parsePhaseRange, parseJSON } from '@/lib/utils';

interface HeaderMapping {
  [key: string]: string;
}

// Smart header mapping for common variations
const CLIENT_HEADER_MAPPING: HeaderMapping = {
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

const WORKER_HEADER_MAPPING: HeaderMapping = {
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

const TASK_HEADER_MAPPING: HeaderMapping = {
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

function normalizeHeaders(headers: string[], mapping: HeaderMapping): string[] {
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
  } catch (error) {
    console.error('Error parsing client row:', error);
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
  } catch (error) {
    console.error('Error parsing worker row:', error);
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
  } catch (error) {
    console.error('Error parsing task row:', error);
    return null;
  }
}

export function parseCSV(
  file: File, 
  type: 'clients' | 'workers' | 'tasks'
): Promise<ParsedData> {
  console.log('Starting CSV parse for:', { fileName: file.name, type });
  
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header: string, index: number) => {
        const mapping = type === 'clients' ? CLIENT_HEADER_MAPPING :
                       type === 'workers' ? WORKER_HEADER_MAPPING :
                       TASK_HEADER_MAPPING;
        
        const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mapped = mapping[normalized] || header;
        console.log('Header mapping:', { original: header, normalized, mapped });
        return mapped;
      },
      complete: (results) => {
        console.log('Papa Parse complete:', { results });
        const errors: string[] = [];
        let parsedData: Client[] | Worker[] | Task[] = [];

        if (results.errors.length > 0) {
          errors.push(...results.errors.map(error => error.message));
        }

        try {
          if (type === 'clients') {
            parsedData = results.data
              .map(parseClientRow)
              .filter(Boolean) as Client[];
          } else if (type === 'workers') {
            parsedData = results.data
              .map(parseWorkerRow)
              .filter(Boolean) as Worker[];
          } else if (type === 'tasks') {
            parsedData = results.data
              .map(parseTaskRow)
              .filter(Boolean) as Task[];
          }
        } catch (error) {
          errors.push(`Failed to parse ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        const finalResult = {
          [type]: parsedData,
          errors
        } as ParsedData;
        
        console.log('Final parse result:', finalResult);
        resolve(finalResult);
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        resolve({
          errors: [error.message]
        });
      }
    });
  });
}