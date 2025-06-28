"use client";
import React, { useState, useEffect } from 'react';
import { BusinessRule } from '@/types/rules';
import AIStatusIndicator from './ai-status-indicator';

interface AIRecommendationsProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  onApplyRecommendation: (recommendation: BusinessRule) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  clients,
  workers,
  tasks,
  onApplyRecommendation,
}) => {
  const [recommendations, setRecommendations] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, workers, tasks }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        setError('Failed to get AI recommendations');
      }
    } catch (error) {
      setError('Error getting AI recommendations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate recommendations when data changes
    if (clients.length > 0 || workers.length > 0 || tasks.length > 0) {
      getRecommendations();
    }
  }, [clients.length, workers.length, tasks.length]);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'co-run': return '🔗';
      case 'slot-restriction': return '⏰';
      case 'load-limit': return '⚖️';
      case 'phase-window': return '🪟';
      case 'pattern-match': return '🔍';
      case 'precedence-override': return '📊';
      default: return '💡';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'co-run': return 'bg-blue-50 border-blue-200';
      case 'slot-restriction': return 'bg-yellow-50 border-yellow-200';
      case 'load-limit': return 'bg-red-50 border-red-200';
      case 'phase-window': return 'bg-green-50 border-green-200';
      case 'pattern-match': return 'bg-purple-50 border-purple-200';
      case 'precedence-override': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (clients.length === 0 && workers.length === 0 && tasks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <span className="text-gray-400 text-4xl mb-4 block">📊</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload some data to get AI-powered recommendations for business rules and optimizations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        <div className="flex items-center space-x-3">
          <AIStatusIndicator 
            status={loading ? 'loading' : error ? 'error' : 'idle'}
            message={loading ? 'Analyzing data...' : error ? 'Error occurred' : 'Ready'}
          />
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800">Analyzing your data for intelligent recommendations...</p>
          </div>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <span className="text-yellow-600 text-4xl mb-4 block">🤖</span>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">No Recommendations Yet</h3>
            <p className="text-yellow-800">The AI is analyzing your data. Check back soon for personalized recommendations!</p>
          </div>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div 
              key={recommendation.id || index}
              className={`border rounded-lg p-4 ${getRecommendationColor(recommendation.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getRecommendationIcon(recommendation.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{recommendation.name}</h4>
                    <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Type:</span>
                      <span className="text-xs px-2 py-1 bg-white rounded-full border">
                        {recommendation.type}
                      </span>
                      <span className="text-xs text-gray-500">Priority:</span>
                      <span className="text-xs px-2 py-1 bg-white rounded-full border">
                        {recommendation.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onApplyRecommendation(recommendation)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
