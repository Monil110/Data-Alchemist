"use client";
import React, { useState } from 'react';
import { useValidationStore } from '@/store/validation-slice';
import { useDataStore } from '@/store';

export const ValidationPanel: React.FC = () => {
  const errors = useValidationStore(s => s.errors);
  const clients = useDataStore(s => s.clients);
  const workers = useDataStore(s => s.workers);
  const tasks = useDataStore(s => s.tasks);

  // State for AI suggestions per error index
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, string>>({});
  const [errorMsgs, setErrorMsgs] = useState<Record<number, string>>({});

  if (!errors.length) {
    return (
      <div style={{ padding: 12, background: '#e6ffed', color: '#22543d', borderRadius: 6, marginBottom: 16 }}>
        ✅ No validation errors found.
      </div>
    );
  }

  // Helper to get the row data for an error
  function getRow(err: any) {
    if (err.affectedEntity === 'Client') return clients.find(c => c.ClientID === err.entityId);
    if (err.affectedEntity === 'Worker') return workers.find(w => w.WorkerID === err.entityId);
    if (err.affectedEntity === 'Task') return tasks.find(t => t.TaskID === err.entityId);
    return null;
  }

  const handleSuggestFix = async (err: any, idx: number) => {
    setLoadingIdx(idx);
    setErrorMsgs(msgs => ({ ...msgs, [idx]: '' }));
    setSuggestions(sugs => ({ ...sugs, [idx]: '' }));
    try {
      const row = getRow(err);
      const res = await fetch('/api/ai/suggest-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: err, entity: err.affectedEntity, row }),
      });
      const data = await res.json();
      if (!res.ok || !data.suggestion) {
        setErrorMsgs(msgs => ({ ...msgs, [idx]: data.error || 'No suggestion available.' }));
        return;
      }
      setSuggestions(sugs => ({ ...sugs, [idx]: data.suggestion }));
    } catch (e) {
      setErrorMsgs(msgs => ({ ...msgs, [idx]: 'Failed to get suggestion.' }));
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div style={{ padding: 12, background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 6, marginBottom: 16 }}>
      <strong>Validation Issues ({errors.length}):</strong>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {errors.map((err, idx) => (
          <li key={idx} style={{
            margin: '8px 0',
            color: err.severity === 'error' ? '#c53030' : '#b7791f',
            fontWeight: err.severity === 'error' ? 600 : 400,
          }}>
            <span style={{ marginRight: 8 }}>
              {err.severity === 'error' ? '❌' : '⚠️'}
            </span>
            <span>{err.message}</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#718096' }}>
              [{err.affectedEntity} {err.id}]
            </span>
            <button
              style={{ marginLeft: 16, padding: '2px 8px', borderRadius: 4, border: 'none', background: '#3182ce', color: 'white', fontSize: 12, cursor: 'pointer' }}
              disabled={loadingIdx === idx}
              onClick={() => handleSuggestFix(err, idx)}
            >
              {loadingIdx === idx ? 'Suggesting...' : 'Suggest Fix'}
            </button>
            {suggestions[idx] && (
              <div style={{ marginTop: 6, color: '#22543d', background: '#e6ffed', borderRadius: 4, padding: 8, fontSize: 13 }}>
                💡 <strong>AI Suggestion:</strong> {suggestions[idx]}
              </div>
            )}
            {errorMsgs[idx] && (
              <div style={{ marginTop: 6, color: '#c53030', fontSize: 13 }}>{errorMsgs[idx]}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
