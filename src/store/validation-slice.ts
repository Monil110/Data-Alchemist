import { ValidationError } from '@/types/validation';
import { create } from 'zustand';
import { validateAll } from '@/lib/validators/validation-engine';
import { useDataStore } from './index';

interface ValidationState {
  errors: ValidationError[];
  runValidation: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  errors: [],
  runValidation: () => {
    const { clients, workers, tasks, businessRules } = useDataStore.getState();
    const errors = validateAll(clients, workers, tasks, businessRules);
    set({ errors });
  },
}));
