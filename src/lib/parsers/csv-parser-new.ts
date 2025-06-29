import * as XLSX from 'xlsx';
import { Client, Worker, Task, ParsedData } from '@/types';

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
      ClientID: row.ClientID?.toString() || `C${String(index + 1).padStart(3, '0')}`,
      ClientName: row.ClientName?.toString() || 'Unknown Client',
      PriorityLevel: parseInt(row.PriorityLevel) || 1,
      RequestedTaskIDs: parseArrayField(row.RequestedTaskIDs),
      GroupTag: row.GroupTag?.toString() || 'Default',
      AttributesJSON: parseJSON(row.AttributesJSON)
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
      WorkerID: row.WorkerID?.toString() || `W${String(index + 1).padStart(3, '0')}`,
      WorkerName: row.WorkerName?.toString() || 'Unknown Worker',
      Skills: parseArrayField(row.Skills),
      AvailableSlots: parseNumberArray(row.AvailableSlots),
      MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase) || 1,
      WorkerGroup: row.WorkerGroup?.toString() || 'Default',
      QualificationLevel: row.QualificationLevel?.toString() || '1'
    };
  } catch (error) {
    console.error('Error parsing worker row:', error);
    return null;
  }
}

function parseTaskRow(row: any, index: number): Task | null {
  try {
    return {
      TaskID: row.TaskID?.toString() || `T${String(index + 1).padStart(3, '0')}`,
      TaskName: row.TaskName?.toString() || 'Unknown Task',
      Category: row.Category?.toString() || 'General',
      Duration: parseInt(row.Duration) || 1,
      RequiredSkills: parseArrayField(row.RequiredSkills),
      PreferredPhases: parseNumberArray(row.PreferredPhases),
      MaxConcurrent: parseInt(row.MaxConcurrent) || 1
    };
  } catch (error) {
    console.error('Error parsing task row:', error);
    return null;
  }
}

export async function parseFile(file: File): Promise<any[]> {
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
        if (!sheetName) throw new Error('No sheet found in workbook');
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) throw new Error('No worksheet found for the first sheet');
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

export function parseCSV(
  file: File, 
  type: 'clients' | 'workers' | 'tasks'
): Promise<ParsedData> {
  console.log('Starting CSV parse for:', { fileName: file.name, type });
  
  return new Promise(async (resolve) => {
    try {
      // Use the new parseFile function
      const rawData = await parseFile(file);
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

      let finalResult: ParsedData;
      if (type === 'clients') {
        finalResult = { clients: parsedData as Client[], errors };
      } else if (type === 'workers') {
        finalResult = { workers: parsedData as Worker[], errors };
      } else {
        finalResult = { tasks: parsedData as Task[], errors };
      }
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