"use client";
import React, { useState } from 'react';
import { PrioritizationSettings } from '@/types/rules';
import PrioritizationInterface from '@/components/priorities/prioritization-interface';
import { useDataStore } from '@/store';

export default function PrioritiesPage() {
  // Default prioritization settings - in a real app, these would come from a store
  const [settings, setSettings] = useState<PrioritizationSettings[]>([
    {
      id: '1',
      name: 'Maximize Fulfillment',
      description: 'Prioritize completing as many tasks as possible',
      weights: {
        fulfillment: 0.8,
        fairness: 0.1,
        efficiency: 0.05,
        cost: 0.03,
        quality: 0.02,
      },
      criteria: [
        { field: 'taskPriority', weight: 0.6, direction: 'desc', description: 'Task priority' },
        { field: 'workerEfficiency', weight: 0.4, direction: 'desc', description: 'Worker efficiency' },
      ],
      preset: 'fulfillment',
    },
    {
      id: '2',
      name: 'Fair Distribution',
      description: 'Ensure fair workload distribution among workers',
      weights: {
        fulfillment: 0.3,
        fairness: 0.7,
        efficiency: 0.1,
        cost: 0.05,
        quality: 0.05,
      },
      criteria: [
        { field: 'workerLoad', weight: 0.5, direction: 'asc', description: 'Worker load balance' },
        { field: 'taskComplexity', weight: 0.3, direction: 'desc', description: 'Task complexity' },
        { field: 'workerSkill', weight: 0.2, direction: 'desc', description: 'Worker skill match' },
      ],
      preset: 'fairness',
    },
    {
      id: '3',
      name: 'Cost Optimization',
      description: 'Minimize operational costs while maintaining quality',
      weights: {
        fulfillment: 0.4,
        fairness: 0.1,
        efficiency: 0.2,
        cost: 0.8,
        quality: 0.1,
      },
      criteria: [
        { field: 'workerCost', weight: 0.7, direction: 'asc', description: 'Worker cost' },
        { field: 'taskValue', weight: 0.3, direction: 'desc', description: 'Task value' },
      ],
      preset: 'cost',
    },
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSettings, setEditingSettings] = useState<PrioritizationSettings | null>(null);
  const [activeSettings, setActiveSettings] = useState<string>('1');

  const handleCreateSettings = (newSettings: PrioritizationSettings) => {
    setSettings([...settings, newSettings]);
    setShowCreateForm(false);
  };

  const handleUpdateSettings = (updatedSettings: PrioritizationSettings) => {
    setSettings(settings.map(s => s.id === updatedSettings.id ? updatedSettings : s));
    setEditingSettings(null);
  };

  const handleDeleteSettings = (settingsId: string) => {
    if (confirm('Are you sure you want to delete this prioritization setting?')) {
      setSettings(settings.filter(s => s.id !== settingsId));
      if (activeSettings === settingsId) {
        setActiveSettings(settings[0]?.id || '');
      }
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 0.6) return 'text-green-600';
    if (weight >= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWeightBarColor = (weight: number) => {
    if (weight >= 0.6) return 'bg-green-500';
    if (weight >= 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prioritization Management</h1>
          <p className="mt-2 text-gray-600">
            Configure and manage prioritization strategies for task scheduling and resource allocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Strategy
          </button>
          <button
            onClick={() => {/* Export functionality */}}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Export Settings
          </button>
          <button
            onClick={() => {/* Import functionality */}}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Import Settings
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prioritization Strategies</h2>
              <div className="space-y-3">
                {settings.map(setting => (
                  <div
                    key={setting.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activeSettings === setting.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveSettings(setting.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{setting.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Active:</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeSettings === setting.id
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {activeSettings === setting.id ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSettings(setting);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSettings(setting.id);
                          }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Settings Details */}
          <div className="lg:col-span-2">
            {activeSettings && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {(() => {
                  const activeSetting = settings.find(s => s.id === activeSettings);
                  if (!activeSetting) return null;

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{activeSetting.name}</h2>
                          <p className="text-gray-600">{activeSetting.description}</p>
                        </div>
                        <button
                          onClick={() => setEditingSettings(activeSetting)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Edit Strategy
                        </button>
                      </div>

                      {/* Weight Distribution */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Weight Distribution</h3>
                        <div className="space-y-3">
                          {Object.entries(activeSetting.weights).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 capitalize">{key}</span>
                                <span className={`font-medium ${getWeightColor(value)}`}>
                                  {Math.round(value * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getWeightBarColor(value)}`}
                                  style={{ width: `${value * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Criteria */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Criteria Configuration</h3>
                        <div className="space-y-3">
                          {activeSetting.criteria.map((criterion, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900">{criterion.description}</span>
                                <span className="ml-2 text-sm text-gray-500">
                                  ({criterion.direction === 'desc' ? 'Descending' : 'Ascending'})
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                Weight: {Math.round(criterion.weight * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategy Summary */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Strategy Summary</h4>
                        <p className="text-sm text-blue-800">
                          This strategy prioritizes {Object.entries(activeSetting.weights)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 2)
                            .map(([key]) => key)
                            .join(' and ')} 
                          while considering {activeSetting.criteria.length} criteria for optimal resource allocation.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingSettings) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <PrioritizationInterface
                  {...(editingSettings && { initialSettings: editingSettings })}
                  onSave={editingSettings ? handleUpdateSettings : handleCreateSettings}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setEditingSettings(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
