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

const initialState: DataStore = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  businessRules: [],
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