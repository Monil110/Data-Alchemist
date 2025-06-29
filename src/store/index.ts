// src/store/index.ts
import { create } from 'zustand';
import { Client, Worker, Task, ValidationError, DataStore } from '@/types';
import { BusinessRule } from '@/types/rules';

interface DataStoreActions {
  setClients: (clients: Client[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setTasks: (tasks: Task[]) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  addBusinessRule: (rule: BusinessRule) => void;
  updateBusinessRule: (id: string, updates: Partial<Omit<BusinessRule, 'type' | 'id'>>) => void;
  deleteBusinessRule: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Sample business rules for demonstration
const sampleBusinessRules: BusinessRule[] = [
  {
    id: 'rule-001',
    type: 'co-run',
    name: 'High Priority Task Coordination',
    description: 'Ensure high priority tasks run together',
    enabled: true,
    priority: 1,
    taskIds: ['T001', 'T002'],
    mustRunTogether: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'rule-002',
    type: 'load-limit',
    name: 'Worker Load Protection',
    description: 'Limit worker load to prevent overloading',
    enabled: true,
    priority: 2,
    workerGroup: ['frontend'],
    maxSlotsPerPhase: 3,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'rule-003',
    type: 'slot-restriction',
    name: 'Enterprise Client Restrictions',
    description: 'Enterprise clients can only work with senior workers',
    enabled: true,
    priority: 3,
    clientGroup: ['enterprise'],
    workerGroup: ['senior'],
    minCommonSlots: 2,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  }
];

const initialState: DataStore = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  businessRules: sampleBusinessRules,
  isLoading: false,
  lastUpdated: null,
};

export const useDataStore = create<DataStore & DataStoreActions>((set) => ({
  ...initialState,

  setClients: (clients) => {
    console.log('Store: Setting clients:', clients);
    set({ clients, lastUpdated: new Date() });
  },

  setWorkers: (workers) => {
    console.log('Store: Setting workers:', workers);
    set({ workers, lastUpdated: new Date() });
  },

  setTasks: (tasks) => {
    console.log('Store: Setting tasks:', tasks);
    set({ tasks, lastUpdated: new Date() });
  },

  setValidationErrors: (validationErrors) => 
    set({ validationErrors }),

  addBusinessRule: (rule) => 
    set((state) => ({ 
      businessRules: [...state.businessRules, rule] 
    })),

  updateBusinessRule: (id, updates) => 
    set((state) => ({
      businessRules: state.businessRules.map(rule => 
        rule.id === id ? { ...rule, ...updates, updatedAt: new Date() } : rule
      )
    })),

  deleteBusinessRule: (id) => 
    set((state) => ({
      businessRules: state.businessRules.filter(rule => rule.id !== id)
    })),

  setLoading: (isLoading) => 
    set({ isLoading }),

  reset: () => 
    set(initialState),
}));