// src/types/index.ts

import type { BusinessRule } from './rules';

export interface Client {
    ClientID: string;
    ClientName: string;
    PriorityLevel: number; // 1-5
    RequestedTaskIDs: string[]; // parsed from comma-separated
    GroupTag: string;
    AttributesJSON: Record<string, any>;
  }
  
  export interface Worker {
    WorkerID: string;
    WorkerName: string;
    Skills: string[]; // parsed from comma-separated
    AvailableSlots: number[]; // array of phase numbers
    MaxLoadPerPhase: number;
    WorkerGroup: string;
    QualificationLevel: string;
  }
  
  export interface Task {
    TaskID: string;
    TaskName: string;
    Category: string;
    Duration: number; // number of phases (≥1)
    RequiredSkills: string[]; // parsed from comma-separated
    PreferredPhases: number[]; // parsed from range or list
    MaxConcurrent: number;
  }
  
  export interface ValidationError {
    id: string;
    type: ValidationErrorType;
    severity: 'error' | 'warning';
    message: string;
    entityType: 'client' | 'worker' | 'task';
    entityId: string;
    field?: string;
    row?: number;
    suggestedFix?: string;
  }
  
  export enum ValidationErrorType {
    MISSING_REQUIRED = 'missing_required',
    DUPLICATE_ID = 'duplicate_id',
    MALFORMED_LIST = 'malformed_list',
    OUT_OF_RANGE = 'out_of_range',
    BROKEN_JSON = 'broken_json',
    UNKNOWN_REFERENCE = 'unknown_reference',
    CIRCULAR_DEPENDENCY = 'circular_dependency',
    CONFLICTING_RULES = 'conflicting_rules',
    OVERLOADED_WORKER = 'overloaded_worker',
    PHASE_SATURATION = 'phase_saturation',
    SKILL_COVERAGE = 'skill_coverage',
    MAX_CONCURRENCY = 'max_concurrency'
  }
  
  export interface DataStore {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
    validationErrors: ValidationError[];
    businessRules: BusinessRule[];
    isLoading: boolean;
    lastUpdated: Date | null;
  }
  
  export interface FileUploadStatus {
    fileName: string;
    type: 'clients' | 'workers' | 'tasks';
    status: 'pending' | 'processing' | 'success' | 'error';
    progress: number;
    errors: string[];
  }
  
  export interface ParsedData {
    clients?: Client[];
    workers?: Worker[];
    tasks?: Task[];
    errors: string[];
  }