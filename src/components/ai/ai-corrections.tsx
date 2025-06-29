"use client";
import React, { useState } from 'react';
import { ValidationError } from '@/types/validation';
import AIStatusIndicator from './ai-status-indicator';

interface AICorrectionsProps {
  errors: ValidationError[];
  onApplyCorrection: (errorId: string, correction: any) => void;
  onApplyBatchCorrections: (corrections: Array<{ errorId: string; correction: any }>) => void;
  onDismiss: () => void;
}

export const AICorrections: React.FC<AICorrectionsProps> = ({
  errors,
  onApplyCorrection,
  onApplyBatchCorrections,
  onDismiss,
}) => {
  const [loadingErrors, setLoadingErrors] = useState<Set<string>>(new Set());
  const [corrections, setCorrections] = useState<Record<string, any>>({});
  const [selectedCorrections, setSelectedCorrections] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const getAICorrection = async (error: ValidationError) => {
    setLoadingErrors(prev => new Set(prev).add(error.id));
    
    try {
      const response = await fetch('/api/ai/suggest-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCorrections(prev => ({
          ...prev,
          [error.id]: data.suggestion,
        }));
      } else {
        console.error('Failed to get AI correction');
      }
    } catch (error) {
      console.error('Error getting AI correction:', error);
    } finally {
      setLoadingErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(error.id);
        return newSet;
      });
    }
  };

  const handleApplyCorrection = (error: ValidationError) => {
    const correction = corrections[error.id];
    if (correction) {
      onApplyCorrection(error.id, correction);
      // Remove the correction after applying
      setCorrections(prev => {
        const newCorrections = { ...prev };
        delete newCorrections[error.id];
        return newCorrections;
      });
      // Remove from selected corrections
      setSelectedCorrections(prev => {
        const newSet = new Set(prev);
        newSet.delete(error.id);
        return newSet;
      });
    }
  };

  const handleSelectCorrection = (errorId: string) => {
    setSelectedCorrections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const handleApplyBatchCorrections = async () => {
    if (selectedCorrections.size === 0) return;

    setBatchLoading(true);
    try {
      const batchCorrections = Array.from(selectedCorrections).map(errorId => ({
        errorId,
        correction: corrections[errorId],
      }));

      onApplyBatchCorrections(batchCorrections);

      // Clear applied corrections
      setCorrections(prev => {
        const newCorrections = { ...prev };
        selectedCorrections.forEach(errorId => {
          delete newCorrections[errorId];
        });
        return newCorrections;
      });
      setSelectedCorrections(new Set());
    } catch (error) {
      console.error('Error applying batch corrections:', error);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSelectAllCorrections = () => {
    const availableCorrections = Object.keys(corrections);
    if (selectedCorrections.size === availableCorrections.length) {
      setSelectedCorrections(new Set());
    } else {
      setSelectedCorrections(new Set(availableCorrections));
    }
  };

  if (errors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-green-600 mr-2">✅</span>
          <span className="text-green-800 font-medium">No validation errors found!</span>
        </div>
      </div>
    );
  }

  const errorsWithCorrections = errors.filter(error => corrections[error.id]);
  const hasCorrections = errorsWithCorrections.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Corrections</h3>
        <div className="flex items-center space-x-3">
          <AIStatusIndicator 
            status={loadingErrors.size > 0 ? 'loading' : 'idle'}
            message={loadingErrors.size > 0 ? `Analyzing ${loadingErrors.size} errors...` : 'Ready to help'}
          />
          {hasCorrections && (
            <button
              onClick={handleSelectAllCorrections}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {selectedCorrections.size === Object.keys(corrections).length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedCorrections.size > 0 && (
            <button
              onClick={handleApplyBatchCorrections}
              disabled={batchLoading}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {batchLoading ? 'Applying...' : `Apply ${selectedCorrections.size} Corrections`}
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {errors.map(error => (
          <div key={error.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    error.severity === 'error' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {error.severity}
                  </span>
                  <span className="text-sm text-gray-600">{error.entityType}</span>
                  {corrections[error.id] && (
                    <input
                      type="checkbox"
                      checked={selectedCorrections.has(error.id)}
                      onChange={() => handleSelectCorrection(error.id)}
                      className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-900 mb-2">{error.message}</p>
                {error.field && (
                  <p className="text-xs text-gray-500">Field: {error.field}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {!corrections[error.id] && (
                  <button
                    onClick={() => getAICorrection(error)}
                    disabled={loadingErrors.has(error.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    {loadingErrors.has(error.id) ? 'Analyzing...' : 'Get Fix'}
                  </button>
                )}
                
                {corrections[error.id] && (
                  <button
                    onClick={() => handleApplyCorrection(error)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Apply Fix
                  </button>
                )}
              </div>
            </div>
            
            {corrections[error.id] && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 text-sm">💡</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">AI Suggestion:</p>
                    <p className="text-sm text-blue-800">{corrections[error.id]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasCorrections && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedCorrections.size} of {Object.keys(corrections).length} corrections selected
              </p>
              <p className="text-xs text-blue-700">
                Select corrections to apply them all at once
              </p>
            </div>
            {selectedCorrections.size > 0 && (
              <button
                onClick={handleApplyBatchCorrections}
                disabled={batchLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {batchLoading ? 'Applying...' : `Apply ${selectedCorrections.size} Corrections`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICorrections;
