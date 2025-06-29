export interface ValidationError {
  id: string;
  entityType: string;
  severity: 'error' | 'warning';
  message: string;
  field?: string;
  value?: any;
  affectedEntity: string;
  ruleId?: string;
  suggestions?: string[];
}
