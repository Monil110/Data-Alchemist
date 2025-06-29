"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { BusinessRule, RuleType } from '@/types/rules';
import RuleForm from '@/components/rules/rule-form';

// Mock data - in production, this would come from an API
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
  {
    id: '3',
    name: 'Client Slot Restriction',
    description: 'Enterprise clients can only work with senior workers',
    type: 'slot-restriction',
    enabled: true,
    priority: 3,
    clientGroup: ['client1', 'client2'],
    workerGroup: ['worker1'],
    minCommonSlots: 2,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    name: 'Task Phase Window',
    description: 'Critical tasks can only run in morning and afternoon phases',
    type: 'phase-window',
    enabled: true,
    priority: 4,
    taskId: 'task1',
    allowedPhases: ['morning', 'afternoon'],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    name: 'Pattern Match Rule',
    description: 'Exclude tasks with "test" in the name',
    type: 'pattern-match',
    enabled: true,
    priority: 5,
    regex: '.*test.*',
    ruleTemplate: 'exclude_test_tasks',
    targetField: 'task',
    action: 'exclude',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    name: 'Precedence Override',
    description: 'High priority clients take precedence over others',
    type: 'precedence-override',
    enabled: true,
    priority: 6,
    priorityOrder: ['client1', 'client2', 'client3'],
    criteria: [
      { field: 'priority', weight: 0.7, direction: 'desc' },
      { field: 'value', weight: 0.3, direction: 'desc' }
    ],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  }
];

// Mock data for available entities
const availableTasks = [
  { id: 'task1', name: 'Frontend Development' },
  { id: 'task2', name: 'Backend API Development' },
  { id: 'task3', name: 'Database Design' },
  { id: 'task4', name: 'Testing and QA' },
  { id: 'task5', name: 'Documentation' },
  { id: 'task6', name: 'Deployment' },
];

const availableClients = [
  { id: 'client1', name: 'Acme Corporation' },
  { id: 'client2', name: 'Global Industries' },
  { id: 'client3', name: 'TechStart Inc' },
  { id: 'client4', name: 'Enterprise Solutions' },
  { id: 'client5', name: 'Small Business Co' },
];

const availableWorkers = [
  { id: 'worker1', name: 'John Smith (Senior)' },
  { id: 'worker2', name: 'Jane Doe (Senior)' },
  { id: 'worker3', name: 'Bob Johnson (Mid)' },
  { id: 'worker4', name: 'Alice Brown (Mid)' },
  { id: 'worker5', name: 'Charlie Wilson (Junior)' },
  { id: 'worker6', name: 'Diana Garcia (Junior)' },
];

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params['id'] as string;

  const [rule, setRule] = useState<BusinessRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load rule data
  useEffect(() => {
    const loadRule = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundRule = mockRules.find(r => r.id === ruleId);
        if (!foundRule) {
          setError('Rule not found');
          return;
        }
        
        setRule(foundRule);
      } catch (err) {
        setError('Failed to load rule');
        console.error('Error loading rule:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ruleId) {
      loadRule();
    }
  }, [ruleId]);

  const handleUpdateRule = async (updatedRule: BusinessRule) => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      console.log('Updating rule:', updatedRule);
      
      // Navigate back to rules page
      router.push('/rules');
    } catch (err) {
      console.error('Error updating rule:', err);
      alert('Failed to update rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/rules');
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
      'precedence-override': 'Precedence Override',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rule...</p>
        </div>
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rule Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The rule you are looking for does not exist.'}</p>
          <Link
            href="/rules"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Rules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/rules"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Rules
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Edit Rule</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Rule</h1>
              <p className="mt-2 text-gray-600">
                Modify the configuration and settings for this business rule.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRuleTypeColor(rule.type)}`}>
                {getRuleTypeLabel(rule.type)}
              </span>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                rule.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Rule Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Rule Name</h3>
              <p className="text-lg font-semibold text-gray-900">{rule.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
              <p className="text-lg font-semibold text-gray-900">{rule.priority}/10</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-lg font-semibold text-gray-900">
                {rule.updatedAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-gray-900">{rule.description}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rule Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update the rule settings and parameters below.
            </p>
          </div>
          <div className="p-6">
            <RuleForm
              initialRule={rule}
              onSubmit={handleUpdateRule}
              onCancel={handleCancel}
              availableTasks={availableTasks}
              availableClients={availableClients}
              availableWorkers={availableWorkers}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex space-x-3">
            <Link
              href={`/rules/${ruleId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View Rule Details
            </Link>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this rule?')) {
                  // Handle delete
                  router.push('/rules');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Rule
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Trigger form submission
                const form = document.querySelector('form');
                if (form) {
                  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) {
                    submitButton.click();
                  }
                }
              }}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
