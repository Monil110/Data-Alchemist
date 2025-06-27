import React, { useState } from 'react';

interface NaturalLanguageSearchProps {
  onFilter: (filterFn: (row: any) => boolean) => void;
  entity: 'clients' | 'workers' | 'tasks';
}

export const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({ onFilter, entity }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, entity }),
      });
      const data = await res.json();
      if (!res.ok || !data.filterBody) {
        setError(data.error || 'AI could not process your query.');
        return;
      }
      // eslint-disable-next-line no-new-func
      const filterFn = new Function('row', `return (${data.filterBody});`);
      onFilter(filterFn as (row: any) => boolean);
    } catch (e: any) {
      setError('AI could not process your query.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Ask in plain English (e.g. Tasks with Duration > 1)"
        style={{ width: 320, padding: 6, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
      />
      <button onClick={handleSearch} disabled={loading || !query} style={{ padding: '6px 12px' }}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};
