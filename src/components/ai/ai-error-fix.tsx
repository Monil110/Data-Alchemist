'use client';

import React, { useState } from 'react';

interface ValidationError {
  id: string;
  column: string;
  value: any;
  message: string;
  row: any;
  dataset: any[];
  type?: string;
  severity?: string;
  entityType?: string;
  field?: string;
}

interface AIErrorFixProps {
  error: ValidationError;
  onApplyFix: (errorId: string, fix: string) => void;
  onDismiss: () => void;
}

export function AIErrorFix({ error, onApplyFix, onDismiss }: AIErrorFixProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFix = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuggestion(null);

    try {
      // Format the error object to match ValidationError interface
      const validationError = {
        id: error.id,
        type: error.type || 'VALIDATION_ERROR',
        severity: error.severity || 'ERROR',
        entityType: error.entityType || 'DATA',
        field: error.field || error.column,
        message: error.message,
        value: error.value,
        row: error.row,
        dataset: error.dataset
      };

      const response = await fetch('/api/ai/suggest-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: validationError
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI suggestion');
      }

      if (data.suggestion) {
        setSuggestion(data.suggestion);
      } else {
        setErrorMessage('No suggestion available');
      }
    } catch (err) {
      console.error('AI fix error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to get AI suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFix = () => {
    if (suggestion) {
      onApplyFix(error.id, suggestion);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Error in {error.column}
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Value: <span className="font-mono bg-red-50 px-1 rounded">{error.value}</span>
          </p>
          <p className="text-xs text-red-600 mb-3">
            {error.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {!suggestion && !errorMessage && (
          <button
            onClick={getFix}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Getting AI Fix...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                Get AI Fix
              </>
            )}
          </button>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
            <button
              onClick={getFix}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {suggestion && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm font-medium text-green-800 mb-1">
                AI Suggestion:
              </p>
              <p className="text-sm text-green-700 font-mono bg-white px-2 py-1 rounded border">
                {suggestion}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={applyFix}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Apply Fix
              </button>
              <button
                onClick={getFix}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Get Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Batch error fix component
interface BatchErrorFixProps {
  errors: ValidationError[];
  onApplyBatchFix: (fixes: Array<{ errorId: string; fix: string }>) => void;
  onDismiss: () => void;
}

export function BatchErrorFix({ errors, onApplyBatchFix, onDismiss }: BatchErrorFixProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const getBatchFixes = async () => {
    setIsLoading(true);
    setErrorMessages({});
    setSuggestions({});

    const newSuggestions: Record<string, string> = {};
    const newErrorMessages: Record<string, string> = {};

    // Process errors in parallel with rate limiting
    const processError = async (error: ValidationError) => {
      try {
        // Format the error object to match ValidationError interface
        const validationError = {
          id: error.id,
          type: error.type || 'VALIDATION_ERROR',
          severity: error.severity || 'ERROR',
          entityType: error.entityType || 'DATA',
          field: error.field || error.column,
          message: error.message,
          value: error.value,
          row: error.row,
          dataset: error.dataset
        };

        const response = await fetch('/api/ai/suggest-fix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: validationError
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get AI suggestion');
        }

        if (data.suggestion) {
          newSuggestions[error.id] = data.suggestion;
        } else {
          newErrorMessages[error.id] = 'No suggestion available';
        }
      } catch (err) {
        console.error(`AI fix error for ${error.id}:`, err);
        newErrorMessages[error.id] = err instanceof Error ? err.message : 'Failed to get AI suggestion';
      }
    };

    // Process errors with a small delay between each to avoid rate limiting
    for (let i = 0; i < errors.length; i++) {
      await processError(errors[i]);
      if (i < errors.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setSuggestions(newSuggestions);
    setErrorMessages(newErrorMessages);
    setIsLoading(false);
  };

  const applyBatchFix = () => {
    const fixes = Object.entries(suggestions).map(([errorId, fix]) => ({
      errorId,
      fix
    }));
    onApplyBatchFix(fixes);
  };

  const getSuccessCount = () => Object.keys(suggestions).length;
  const getErrorCount = () => Object.keys(errorMessages).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Batch Error Fix ({errors.length} errors)
          </h4>
          <p className="text-xs text-gray-600">
            Get AI suggestions for all validation errors at once
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {Object.keys(suggestions).length === 0 && Object.keys(errorMessages).length === 0 && (
          <button
            onClick={getBatchFixes}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Getting AI Fixes...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                Get AI Fixes for All
              </>
            )}
          </button>
        )}

        {(getSuccessCount() > 0 || getErrorCount() > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">✓ {getSuccessCount()} suggestions</span>
              {getErrorCount() > 0 && (
                <span className="text-red-600">✗ {getErrorCount()} failed</span>
              )}
            </div>

            {getSuccessCount() > 0 && (
              <div className="space-y-2">
                {Object.entries(suggestions).map(([errorId, suggestion]) => (
                  <div key={errorId} className="bg-green-50 border border-green-200 rounded-md p-2">
                    <p className="text-xs text-green-800 font-medium mb-1">
                      Error {errorId}:
                    </p>
                    <p className="text-xs text-green-700 font-mono bg-white px-2 py-1 rounded border">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {getErrorCount() > 0 && (
              <div className="space-y-2">
                {Object.entries(errorMessages).map(([errorId, message]) => (
                  <div key={errorId} className="bg-red-50 border border-red-200 rounded-md p-2">
                    <p className="text-xs text-red-800">
                      Error {errorId}: {message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {getSuccessCount() > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={applyBatchFix}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Apply All Fixes
                </button>
                <button
                  onClick={getBatchFixes}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Retry Failed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 