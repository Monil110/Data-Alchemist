export interface ValidationError {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedEntity: string;
  entityId: string;
  field?: string;
}
