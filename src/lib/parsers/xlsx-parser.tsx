// src/lib/parsers/xlsx-parser.ts
import * as XLSX from 'xlsx';
import { Client, Worker, Task, ParsedData } from '@/types';
import fuzzysort from 'fuzzysort';

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
  'skills': 'Skills',
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
  'category': 'Category',
  'duration': 'Duration',
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

const CLIENT_FIELDS = [
  'ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'
];
const WORKER_FIELDS = [
  'WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'
];
const TASK_FIELDS = [
  'TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'
];

function normalizeHeaders(headers: string[], mapping: HeaderMapping): string[] {
  return headers.map(header => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    return mapping[normalized] || header;
  });
}

function fuzzyMapHeader(header: string, type: 'clients' | 'workers' | 'tasks'): string {
  const fields = type === 'clients' ? CLIENT_FIELDS : type === 'workers' ? WORKER_FIELDS : TASK_FIELDS;
  const result = fuzzysort.go(header, fields);
  if (result.length > 0 && result[0].score > -1000) {
    return result[0].target;
  }
  return header;
}

function parseArrayField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(String);
  
  const str = String(field);
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  return str.trim() ? [str.trim()] : [];
}

function parseNumberArray(field: any): number[] {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(Number).filter(n => !isNaN(n));
  
  const str = String(field);
  
  // Handle JSON array format like "[1,2,3]"
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.filter((n: any) => !isNaN(Number(n))).map(Number) : [];
    } catch {
      // If JSON parsing fails, try comma-separated
      return str.slice(1, -1).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
  }
  
  // Handle comma-separated format like "1,2,3"
  if (str.includes(',')) {
    return str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  }
  
  // Single number
  const num = parseInt(str);
  return isNaN(num) ? [] : [num];
}

function parseJSON(field: any): Record<string, any> {
  if (!field) return {};
  if (typeof field === 'object') return field;
  
  try {
    return JSON.parse(String(field));
  } catch {
    return {};
  }
}

function parseClientRow(row: any, index: number): Client | null {
  try {
    console.log('parseClientRow input:', row);
    
    const client = {
      ClientID: row?.ClientID?.toString() || `C${String(index + 1).padStart(3, '0')}`,
      ClientName: row?.ClientName?.toString() || 'Unknown Client',
      PriorityLevel: parseInt(row?.PriorityLevel) || 1,
      RequestedTaskIDs: parseArrayField(row?.RequestedTaskIDs),
      GroupTag: row?.GroupTag?.toString() || 'Default',
      AttributesJSON: parseJSON(row?.AttributesJSON)
    };
    
    console.log('parseClientRow output:', client);
    
    // Check if client has required fields
    if (!client?.ClientName || client?.ClientName === 'Unknown Client') {
      console.log('Client filtered out - missing required fields:', { 
        ClientID: client?.ClientID ?? 'undefined', 
        ClientName: client?.ClientName ?? 'undefined' 
      });
      return null;
    }
    
    return client;
  } catch (error) {
    console.error('Error parsing client row:', error, 'Row data:', row);
    return null;
  }
}

function parseWorkerRow(row: any, index: number): Worker | null {
  try {
    return {
      WorkerID: row?.WorkerID?.toString() || `W${String(index + 1).padStart(3, '0')}`,
      WorkerName: row?.WorkerName?.toString() || 'Unknown Worker',
      Skills: parseArrayField(row?.Skills),
      AvailableSlots: parseNumberArray(row?.AvailableSlots),
      MaxLoadPerPhase: parseInt(row?.MaxLoadPerPhase) || 1,
      WorkerGroup: row?.WorkerGroup?.toString() || 'Default',
      QualificationLevel: row?.QualificationLevel?.toString() || '1'
    };
  } catch (error) {
    console.error('Error parsing worker row:', error);
    return null;
  }
}

function parseTaskRow(row: any, index: number): Task | null {
  try {
    return {
      TaskID: row?.TaskID?.toString() || `T${String(index + 1).padStart(3, '0')}`,
      TaskName: row?.TaskName?.toString() || 'Unknown Task',
      Category: row?.Category?.toString() || 'General',
      Duration: parseInt(row?.Duration) || 1,
      RequiredSkills: parseArrayField(row?.RequiredSkills),
      PreferredPhases: parseNumberArray(row?.PreferredPhases),
      MaxConcurrent: parseInt(row?.MaxConcurrent) || 1
    };
  } catch (error) {
    console.error('Error parsing task row:', error);
    return null;
  }
}

export async function parseFile(file: File, type: 'clients' | 'workers' | 'tasks'): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Handle CSV files
          const csvData = data as string;
          workbook = XLSX.read(csvData, { type: 'string' });
        } else {
          // Handle Excel files
          workbook = XLSX.read(data, { type: 'array' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        console.log('Parsed data:', jsonData.slice(0, 2)); // Debug log
        resolve(jsonData);
      } catch (error) {
        console.error('Parse error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('File read error:', error);
      reject(error);
    };
    
    // Read file based on type
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export function normalizeData(data: any[], type: string): any[] {
  console.log(`Normalizing ${type} data:`, data.slice(0, 2));
  
  return data.map((row, index) => {
    try {
      switch(type) {
        case 'clients':
          return {
            ClientID: row?.ClientID || `C${String(index + 1).padStart(3, '0')}`,
            ClientName: row?.ClientName || 'Unknown Client',
            PriorityLevel: parseInt(row?.PriorityLevel) || 1,
            RequestedTaskIDs: parseArrayField(row?.RequestedTaskIDs),
            GroupTag: row?.GroupTag || 'Default',
            AttributesJSON: parseJSON(row?.AttributesJSON)
          };
        
        case 'workers':
          return {
            WorkerID: row?.WorkerID || `W${String(index + 1).padStart(3, '0')}`,
            WorkerName: row?.WorkerName || 'Unknown Worker',
            Skills: parseArrayField(row?.Skills),
            AvailableSlots: parseNumberArray(row?.AvailableSlots),
            MaxLoadPerPhase: parseInt(row?.MaxLoadPerPhase) || 1,
            WorkerGroup: row?.WorkerGroup || 'Default',
            QualificationLevel: row?.QualificationLevel || '1'
          };
        
        case 'tasks':
          return {
            TaskID: row?.TaskID || `T${String(index + 1).padStart(3, '0')}`,
            TaskName: row?.TaskName || 'Unknown Task',
            Category: row?.Category || 'General',
            Duration: parseInt(row?.Duration) || 1,
            RequiredSkills: parseArrayField(row?.RequiredSkills),
            PreferredPhases: parseNumberArray(row?.PreferredPhases),
            MaxConcurrent: parseInt(row?.MaxConcurrent) || 1
          };
        
        default:
          return row;
      }
    } catch (error) {
      console.error(`Error normalizing row ${index}:`, error, row);
      return row;
    }
  });
}

export function parseXLSX(
  file: File,
  type: 'clients' | 'workers' | 'tasks'
): Promise<ParsedData> {
  console.log('Starting XLSX parse for:', { fileName: file.name, type });
  
  return new Promise(async (resolve) => {
    try {
      // Use the new parseFile function
      const rawData = await parseFile(file, type);
      console.log('Raw parsed data:', rawData.slice(0, 2));
      
      // Normalize the data using the new normalizeData function
      const normalizedData = normalizeData(rawData, type);
      console.log('Normalized data:', normalizedData.slice(0, 2));
      
      // Apply type-specific parsing and filtering
      let parsedData: Client[] | Worker[] | Task[] = [];
      const errors: string[] = [];

      try {
        if (type === 'clients') {
          console.log('Parsing clients data...');
          const parsedClients = normalizedData
            .map((row, index) => {
              console.log(`Parsing client row ${index}:`, row);
              const parsed = parseClientRow(row, index);
              console.log(`Parsed client ${index}:`, parsed);
              return parsed;
            })
            .filter(Boolean) as Client[];
          console.log('Final parsed clients:', parsedClients);
          parsedData = parsedClients;
        } else if (type === 'workers') {
          parsedData = normalizedData
            .map((row, index) => parseWorkerRow(row, index))
            .filter(Boolean) as Worker[];
        } else if (type === 'tasks') {
          parsedData = normalizedData
            .map((row, index) => parseTaskRow(row, index))
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
    } catch (error) {
      console.error('Parse error:', error);
      resolve({
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  });
}