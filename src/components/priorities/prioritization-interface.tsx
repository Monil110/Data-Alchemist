"use client";

import React, { useState } from 'react';
import { PrioritizationSettings, PrioritizationCriteria } from '@/types/rules';

interface PrioritizationInterfaceProps {
  initialSettings?: PrioritizationSettings;
  onSave: (settings: PrioritizationSettings) => void;
  onCancel: () => void;
}

const presetProfiles = [
  {
    id: 'fulfillment',
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
  },
  {
    id: 'fairness',
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
  },
  {
    id: 'efficiency',
    name: 'Optimize Efficiency',
    description: 'Focus on maximizing resource utilization',
    weights: {
      fulfillment: 0.4,
      fairness: 0.2,
      efficiency: 0.8,
      cost: 0.1,
      quality: 0.1,
    },
    criteria: [
      { field: 'workerEfficiency', weight: 0.7, direction: 'desc', description: 'Worker efficiency' },
      { field: 'taskDuration', weight: 0.3, direction: 'asc', description: 'Task duration' },
    ],
  },
  {
    id: 'cost',
    name: 'Minimize Cost',
    description: 'Prioritize cost-effective resource allocation',
    weights: {
      fulfillment: 0.3,
      fairness: 0.1,
      efficiency: 0.2,
      cost: 0.8,
      quality: 0.1,
    },
    criteria: [
      { field: 'workerCost', weight: 0.6, direction: 'asc', description: 'Worker cost' },
      { field: 'taskValue', weight: 0.4, direction: 'desc', description: 'Task value' },
    ],
  },
  {
    id: 'quality',
    name: 'Maximize Quality',
    description: 'Prioritize high-quality task completion',
    weights: {
      fulfillment: 0.2,
      fairness: 0.1,
      efficiency: 0.1,
      cost: 0.1,
      quality: 0.8,
    },
    criteria: [
      { field: 'workerQuality', weight: 0.8, direction: 'desc', description: 'Worker quality rating' },
      { field: 'taskComplexity', weight: 0.2, direction: 'desc', description: 'Task complexity' },
    ],
  },
];

const availableCriteria = [
  { field: 'taskPriority', description: 'Task Priority', type: 'number' },
  { field: 'workerEfficiency', description: 'Worker Efficiency', type: 'number' },
  { field: 'workerLoad', description: 'Worker Load Balance', type: 'number' },
  { field: 'taskComplexity', description: 'Task Complexity', type: 'number' },
  { field: 'workerSkill', description: 'Worker Skill Match', type: 'number' },
  { field: 'taskDuration', description: 'Task Duration', type: 'number' },
  { field: 'workerCost', description: 'Worker Cost', type: 'number' },
  { field: 'taskValue', description: 'Task Value', type: 'number' },
  { field: 'workerQuality', description: 'Worker Quality Rating', type: 'number' },
  { field: 'clientPriority', description: 'Client Priority', type: 'number' },
];

export default function PrioritizationInterface({
  initialSettings,
  onSave,
  onCancel
}: PrioritizationInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'sliders' | 'ranking' | 'matrix' | 'presets'>('sliders');
  const [settings, setSettings] = useState<PrioritizationSettings>(
    initialSettings || {
      id: `settings_${Date.now()}`,
      name: 'Custom Prioritization',
      description: 'Custom prioritization settings',
      weights: {
        fulfillment: 0.5,
        fairness: 0.2,
        efficiency: 0.2,
        cost: 0.05,
        quality: 0.05,
      },
      criteria: [
        { field: 'taskPriority', weight: 0.6, direction: 'desc', description: 'Task priority' },
        { field: 'workerEfficiency', weight: 0.4, direction: 'desc', description: 'Worker efficiency' },
      ],
    }
  );

  const [criteriaRanking, setCriteriaRanking] = useState<string[]>(
    settings.criteria.map(c => c.field)
  );

  const handleWeightChange = (key: keyof typeof settings.weights, value: number) => {
    setSettings({
      ...settings,
      weights: {
        ...settings.weights,
        [key]: value,
      },
    });
  };

  const handleCriteriaChange = (index: number, field: keyof PrioritizationCriteria, value: any) => {
    const newCriteria = [...settings.criteria];
    const currentCriteria = newCriteria[index];
    
    if (!currentCriteria) return;
    
    if (field === 'direction') {
      newCriteria[index] = { 
        field: currentCriteria.field,
        weight: currentCriteria.weight,
        direction: value as "desc" | "asc",
        description: currentCriteria.description
      };
    } else if (field === 'field') {
      newCriteria[index] = { 
        field: value,
        weight: currentCriteria.weight,
        direction: currentCriteria.direction,
        description: currentCriteria.description
      };
    } else if (field === 'weight') {
      newCriteria[index] = { 
        field: currentCriteria.field,
        weight: value,
        direction: currentCriteria.direction,
        description: currentCriteria.description
      };
    } else if (field === 'description') {
      newCriteria[index] = { 
        field: currentCriteria.field,
        weight: currentCriteria.weight,
        direction: currentCriteria.direction,
        description: value
      };
    }
    setSettings({ ...settings, criteria: newCriteria });
  };

  const addCriteria = () => {
    const firstCriteria = availableCriteria[0];
    if (!firstCriteria) return;
    
    const newCriteria: PrioritizationCriteria = {
      field: firstCriteria.field,
      weight: 0.5,
      direction: 'desc',
      description: firstCriteria.description,
    };
    setSettings({
      ...settings,
      criteria: [...settings.criteria, newCriteria],
    });
  };

  const removeCriteria = (index: number) => {
    setSettings({
      ...settings,
      criteria: settings.criteria.filter((_, i) => i !== index),
    });
  };

  const applyPreset = (preset: typeof presetProfiles[0]) => {
    setSettings({
      ...settings,
      name: preset.name,
      description: preset.description,
      weights: preset.weights,
      criteria: preset.criteria as PrioritizationCriteria[],
      preset: preset.id,
    });
    setCriteriaRanking(preset.criteria.map(c => c.field));
  };

  const handleRankingChange = (fromIndex: number, toIndex: number) => {
    const newRanking = [...criteriaRanking];
    const [movedItem] = newRanking.splice(fromIndex, 1);
    if (movedItem) {
      newRanking.splice(toIndex, 0, movedItem);
    }
    setCriteriaRanking(newRanking);
    
    // Update criteria weights based on ranking
    const newCriteria: PrioritizationCriteria[] = newRanking.map((field, index) => {
      const existingCriteria = settings.criteria.find(c => c.field === field);
      return {
        field,
        weight: 1 - (index * 0.1), // Higher rank = higher weight
        direction: (existingCriteria?.direction as "desc" | "asc") || "desc",
        description: availableCriteria.find(c => c.field === field)?.description || '',
      };
    });
    setSettings({ ...settings, criteria: newCriteria });
  };

  const renderSlidersTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weight Assignment</h3>
        <div className="space-y-4">
          {Object.entries(settings.weights).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key}
                </label>
                <span className="text-sm text-gray-500">{Math.round(value * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => handleWeightChange(key as keyof typeof settings.weights, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Criteria Configuration</h3>
          <button
            onClick={addCriteria}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Criteria
          </button>
        </div>
        <div className="space-y-4">
          {settings.criteria.map((criterion, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <select
                  value={criterion.field}
                  onChange={(e) => handleCriteriaChange(index, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableCriteria.map(c => (
                    <option key={c.field} value={c.field}>{c.description}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={criterion.weight}
                  onChange={(e) => handleCriteriaChange(index, 'weight', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-24">
                <select
                  value={criterion.direction}
                  onChange={(e) => handleCriteriaChange(index, 'direction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <button
                onClick={() => removeCriteria(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRankingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Drag and Drop Ranking</h3>
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop criteria to reorder them by priority. Higher ranked criteria will have higher weights.
      </p>
      <div className="space-y-2">
        {criteriaRanking.map((field, index) => (
          <div
            key={field}
            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
              handleRankingChange(fromIndex, index);
            }}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-900">
                {availableCriteria.find(c => c.field === field)?.description}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Weight: {Math.round((1 - index * 0.1) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatrixTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pairwise Comparison Matrix</h3>
      <p className="text-sm text-gray-600 mb-4">
        Compare criteria pairs to determine their relative importance.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Criteria</th>
              {availableCriteria.slice(0, 5).map(criterion => (
                <th key={criterion.field} className="px-4 py-2 text-center text-sm font-medium text-gray-900">
                  {criterion.description}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableCriteria.slice(0, 5).map((criterion, index) => (
              <tr key={criterion.field} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {criterion.description}
                </td>
                {availableCriteria.slice(0, 5).map((otherCriterion, otherIndex) => (
                  <td key={otherCriterion.field} className="px-4 py-2 text-center">
                    {index === otherIndex ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <select className="text-sm border border-gray-300 rounded px-2 py-1">
                        <option value="1">1</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="7">7</option>
                        <option value="9">9</option>
                      </select>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPresetsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Preset Profiles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presetProfiles.map(preset => (
          <div
            key={preset.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => applyPreset(preset)}
          >
            <h4 className="font-medium text-gray-900 mb-2">{preset.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
            <div className="space-y-1">
              {Object.entries(preset.weights).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize">{key}:</span>
                  <span>{Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Prioritization Settings</h2>
        <div className="flex space-x-1">
          {(['sliders', 'ranking', 'matrix', 'presets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={settings.name}
          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          placeholder="Prioritization name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <textarea
          value={settings.description}
          onChange={(e) => setSettings({ ...settings, description: e.target.value })}
          placeholder="Description..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        {activeTab === 'sliders' && renderSlidersTab()}
        {activeTab === 'ranking' && renderRankingTab()}
        {activeTab === 'matrix' && renderMatrixTab()}
        {activeTab === 'presets' && renderPresetsTab()}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(settings)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
} 