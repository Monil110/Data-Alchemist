"use client";
import React, { useState } from 'react';
import { BusinessRule, RuleType, RuleTemplate, PrioritizationSettings } from '@/types/rules';
import RuleForm from '@/components/rules/rule-form';

// Mock data for demonstration
const mockRules: BusinessRule[] = [
  {
    id: '1',
    name: 'Morning Task Co-run',
    description: 'Tasks A and B must run together in morning slots',
    type: 'co-run',
    enabled: true,
    priority: 1,
    taskIds: ['task1', 'task2'],
    mustRunTogether: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Senior Worker Load Limit',
    description: 'Senior workers can only handle 3 slots per phase',
    type: 'load-limit',
    enabled: true,
    priority: 2,
    workerGroup: ['worker1', 'worker2'],
    maxSlotsPerPhase: 3,
    phaseType: 'all',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const mockTemplates: RuleTemplate[] = [
  {
    id: 'template1',
    name: 'Basic Co-run Rule',
    description: 'Template for tasks that must run together',
    type: 'co-run',
    category: 'Scheduling',
    template: {
      type: 'co-run',
      mustRunTogether: true,
    },
  },
  {
    id: 'template2',
    name: 'Worker Load Limit',
    description: 'Template for limiting worker capacity',
    type: 'load-limit',
    category: 'Capacity',
    template: {
      type: 'load-limit',
      maxSlotsPerPhase: 5,
      phaseType: 'all',
    },
  },
];

const mockPrioritizationSettings: PrioritizationSettings[] = [
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
];

export default function RulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>(mockRules);
  const [templates] = useState<RuleTemplate[]>(mockTemplates);
  const [prioritizationSettings] = useState<PrioritizationSettings[]>(mockPrioritizationSettings);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [filterType, setFilterType] = useState<RuleType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRules = rules.filter(rule => {
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreateRule = (rule: BusinessRule) => {
    setRules([...rules, rule]);
    setShowCreateForm(false);
  };

  const handleUpdateRule = (rule: BusinessRule) => {
    setRules(rules.map(r => r.id === rule.id ? rule : r));
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleNaturalLanguageSubmit = async () => {
    // Mock AI processing
    const mockRule: BusinessRule = {
      id: `rule_${Date.now()}`,
      name: 'AI Generated Rule',
      description: naturalLanguageInput,
      type: 'co-run',
      enabled: true,
      priority: 1,
      taskIds: ['task1', 'task2'],
      mustRunTogether: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setRules([...rules, mockRule]);
    setNaturalLanguageInput('');
    setShowNaturalLanguage(false);
  };

  const getRuleTypeColor = (type: RuleType) => {
    const colors = {
      'co-run': 'bg-blue-100 text-blue-800',
      'slot-restriction': 'bg-green-100 text-green-800',
      'load-limit': 'bg-yellow-100 text-yellow-800',
      'phase-window': 'bg-purple-100 text-purple-800',
      'pattern-match': 'bg-red-100 text-red-800',
      'precedence-override': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRuleTypeLabel = (type: RuleType) => {
    const labels = {
      'co-run': 'Co-run',
      'slot-restriction': 'Slot Restriction',
      'load-limit': 'Load Limit',
      'phase-window': 'Phase Window',
      'pattern-match': 'Pattern Match',
      'precedence-override': 'Precedence',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Rules Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage business rules to control task scheduling and resource allocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Rule
          </button>
          <button
            onClick={() => setShowNaturalLanguage(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            AI Rule Creation
          </button>
          <button
            onClick={() => {/* Export functionality */}}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Export Rules
          </button>
          <button
            onClick={() => {/* Import functionality */}}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Import Rules
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as RuleType | 'all')}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="co-run">Co-run</option>
              <option value="slot-restriction">Slot Restriction</option>
              <option value="load-limit">Load Limit</option>
              <option value="phase-window">Phase Window</option>
              <option value="pattern-match">Pattern Match</option>
              <option value="precedence-override">Precedence Override</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rules..."
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredRules.map(rule => (
            <div key={rule.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{rule.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRuleTypeColor(rule.type)}`}>
                    {getRuleTypeLabel(rule.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      rule.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{rule.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Priority: {rule.priority}</span>
                <span>Updated: {rule.updatedAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingRule(rule)}
                  className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="flex-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rule Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rule Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRuleTypeColor(template.type)}`}>
                  {getRuleTypeLabel(template.type)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prioritization Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prioritization Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prioritizationSettings.map(setting => (
              <div key={setting.id} className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="font-medium text-gray-900 mb-2">{setting.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fulfillment:</span>
                    <span>{Math.round(setting.weights.fulfillment * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fairness:</span>
                    <span>{Math.round(setting.weights.fairness * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Efficiency:</span>
                    <span>{Math.round(setting.weights.efficiency * 100)}%</span>
                  </div>
                </div>
                
                <button className="mt-4 w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Use This Setting
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Rule Modal */}
        {(showCreateForm || editingRule) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h2>
                <RuleForm
                  {...(editingRule && { initialRule: editingRule as Partial<BusinessRule> })}
                  onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setEditingRule(null);
                  }}
                  availableTasks={[
                    { id: 'task1', name: 'Task A' },
                    { id: 'task2', name: 'Task B' },
                    { id: 'task3', name: 'Task C' },
                  ]}
                  availableClients={[
                    { id: 'client1', name: 'Client A' },
                    { id: 'client2', name: 'Client B' },
                  ]}
                  availableWorkers={[
                    { id: 'worker1', name: 'Worker A' },
                    { id: 'worker2', name: 'Worker B' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Natural Language Rule Creation Modal */}
        {showNaturalLanguage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  AI Rule Creation
                </h2>
                <p className="text-gray-600 mb-4">
                  Describe your rule in plain English and let AI convert it to a structured rule.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Description
                  </label>
                  <textarea
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tasks A and B must run together in the morning slots..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowNaturalLanguage(false);
                      setNaturalLanguageInput('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNaturalLanguageSubmit}
                    disabled={!naturalLanguageInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Create Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
