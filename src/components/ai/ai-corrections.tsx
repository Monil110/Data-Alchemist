"use client";
import React, { useState } from 'react';
import { ValidationError } from '@/types';
import AIStatusIndicator from './ai-status-indicator';

interface AICorrectionsProps {
  errors: ValidationError[];
  onApplyCorrection: (errorId: string, correction: any) => void;
  onDismiss: (errorId: string) => void;
}

export const AICorrections: React.FC<AICorrectionsProps> = ({
  errors,
  onApplyCorrection,
  onDismiss,
}) => {
  const [loadingErrors, setLoadingErrors] = useState<Set<string>>(new Set());
  const [corrections, setCorrections] = useState<Record<string, any>>({});

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Corrections</h3>
        <AIStatusIndicator 
          status={loadingErrors.size > 0 ? 'loading' : 'idle'}
          message={loadingErrors.size > 0 ? `Analyzing ${loadingErrors.size} errors...` : 'Ready to help'}
        />
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
                </div>
                <p className="text-sm text-gray-900 mb-2">{error.message}</p>
                {error.field && (
                  <p className="text-xs text-gray-500">Field: {error.field}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!corrections[error.id] && !loadingErrors.has(error.id) && (
                  <button
                    onClick={() => getAICorrection(error)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Get AI Fix
                  </button>
                )}
                
                {loadingErrors.has(error.id) && (
                  <AIStatusIndicator status="loading" message="Analyzing..." />
                )}
                
                {corrections[error.id] && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplyCorrection(error)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Apply Fix
                    </button>
                    <button
                      onClick={() => setCorrections(prev => {
                        const newCorrections = { ...prev };
                        delete newCorrections[error.id];
                        return newCorrections;
                      })}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => onDismiss(error.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Ignore
                </button>
              </div>
            </div>
            
            {corrections[error.id] && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900 mb-1">AI Suggestion:</p>
                <p className="text-sm text-blue-800">{corrections[error.id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AICorrections;
