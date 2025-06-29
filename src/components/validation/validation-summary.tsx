import React from 'react';
import { useValidationStore } from '@/store/validation-slice';

export const ValidationStatusDashboard: React.FC = () => {
  const errors = useValidationStore(s => s.errors);

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  const byEntity: Record<string, { errors: number; warnings: number }> = {};
  errors.forEach(e => {
    if (!byEntity[e.affectedEntity]) byEntity[e.affectedEntity] = { errors: 0, warnings: 0 };
    const entity = byEntity[e.affectedEntity];
    if (entity) {
      if (e.severity === 'error') entity.errors++;
      if (e.severity === 'warning') entity.warnings++;
    }
  });

  let health: 'healthy' | 'warning' | 'error' = 'healthy';
  if (errorCount > 0) health = 'error';
  else if (warningCount > 0) health = 'warning';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: 12,
      background: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      marginBottom: 20,
    }}>
      <div style={{ fontWeight: 600, fontSize: 18 }}>
        {health === 'healthy' && <span style={{ color: '#38a169' }}>🟢 Healthy</span>}
        {health === 'warning' && <span style={{ color: '#b7791f' }}>🟡 Has Warnings</span>}
        {health === 'error' && <span style={{ color: '#c53030' }}>🔴 Has Errors</span>}
      </div>
      <div>
        <strong>Errors:</strong> {errorCount} &nbsp; <strong>Warnings:</strong> {warningCount}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {Object.entries(byEntity).map(([entity, counts]) => (
          <div key={entity} style={{ fontSize: 14 }}>
            <strong>{entity}:</strong> {counts.errors} errors, {counts.warnings} warnings
          </div>
        ))}
      </div>
    </div>
  );
};
