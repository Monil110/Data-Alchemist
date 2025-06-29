"use client";
import React, { useState } from 'react';
import AIStatusIndicator from './ai-status-indicator';

interface NaturalLanguageModifierProps {
  entityType: 'clients' | 'workers' | 'tasks';
  data: any[];
  onApplyModification: (modifiedData: any[]) => void;
}

export const NaturalLanguageModifier: React.FC<NaturalLanguageModifierProps> = ({
  entityType,
  data,
  onApplyModification,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [modificationCode, setModificationCode] = useState<string>('');
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateModification = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setModificationCode('');
    setPreview([]);

    try {
      const response = await fetch('/api/ai/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          entityType,
          data: data.slice(0, 10), // Send sample for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate modification');
      }

      const result = await response.json();
      setModificationCode(result.modificationCode);
      setPreview(result.preview || []);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyModification = () => {
    if (!modificationCode) return;

    try {
      // Execute the modification code
      const safeEval = new Function('data', modificationCode);
      const modifiedData = safeEval(data);
      
      if (!Array.isArray(modifiedData)) {
        throw new Error('Modification must return an array');
      }

      onApplyModification(modifiedData);
      
      // Reset state
      setQuery('');
      setModificationCode('');
      setPreview([]);
      setShowPreview(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply modification');
    }
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'clients': return '👥';
      case 'workers': return '👷';
      case 'tasks': return '📋';
      default: return '📊';
    }
  };

  const getEntityName = () => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{getEntityIcon()}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Natural Language Data Modifier
          </h3>
          <p className="text-sm text-gray-600">
            Modify {getEntityName()} data using plain English
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the modification you want to make:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`e.g., "Change all priority 1 ${entityType} to priority 2"`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleGenerateModification}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <AIStatusIndicator 
            status={loading ? 'loading' : error ? 'error' : modificationCode ? 'success' : 'idle'}
            message={
              loading ? 'Analyzing your request...' :
              error ? 'Error occurred' :
              modificationCode ? 'Modification ready' :
              'Ready to help'
            }
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {showPreview && modificationCode && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Generated Modification Code:</h4>
              <pre className="text-xs text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
                {modificationCode}
              </pre>
            </div>

            {/* Preview Results */}
            {preview.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Preview (First 2 records):</h4>
                <div className="space-y-2">
                  {preview.map((item, index) => (
                    <div key={index} className="text-xs text-green-800 bg-green-100 p-2 rounded">
                      <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleApplyModification}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Apply to All {getEntityName()} ({data.length} records)
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setModificationCode('');
                  setPreview([]);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Example Queries:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• &quot;Change all priority 1 clients to priority 2&quot;</p>
            <p>• &quot;Set MaxLoadPerPhase to 3 for all workers&quot;</p>
            <p>• &quot;Increase duration by 1 for all tasks&quot;</p>
            <p>• &quot;Add skill &apos;JavaScript&apos; to all workers&quot;</p>
            <p>• &quot;Set PreferredPhases to [1,2,3] for tasks with duration &gt; 2&quot;</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Try queries like &quot;make all priority 5 clients high priority&quot; or &quot;change all workers in group A to group B&quot;
          </p>
          <p className="text-sm text-gray-600 mb-4">
            You can also use natural language to modify data: &quot;set all tasks with duration &gt; 3 to duration 2&quot;
          </p>
        </div>
      </div>
    </div>
  );
}; 