"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { BusinessRule, RuleType, RuleValidationResult } from '@/types/rules';

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

// Mock entity data for display
const entityData = {
  tasks: {
    task1: 'Frontend Development',
    task2: 'Backend API Development',
    task3: 'Database Design',
    task4: 'Testing and QA',
    task5: 'Documentation',
    task6: 'Deployment',
  },
  clients: {
    client1: 'Acme Corporation',
    client2: 'Global Industries',
    client3: 'TechStart Inc',
    client4: 'Enterprise Solutions',
    client5: 'Small Business Co',
  },
  workers: {
    worker1: 'John Smith (Senior)',
    worker2: 'Jane Doe (Senior)',
    worker3: 'Bob Johnson (Mid)',
    worker4: 'Alice Brown (Mid)',
    worker5: 'Charlie Wilson (Junior)',
    worker6: 'Diana Garcia (Junior)',
  }
};

export default function RuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params['id'] as string;

  const [rule, setRule] = useState<BusinessRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<RuleValidationResult | null>(null);

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
        
        // Simulate validation
        const mockValidation: RuleValidationResult = {
          isValid: true,
          errors: [],
          warnings: ['Consider reviewing the rule priority level']
        };
        setValidation(mockValidation);
        
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

  const getRuleTypeDescription = (type: RuleType) => {
    const descriptions = {
      'co-run': 'Tasks that must run together in the same time slot',
      'slot-restriction': 'Restrictions on which clients and workers can work together',
      'load-limit': 'Maximum number of slots a worker group can handle per phase',
      'phase-window': 'Allowed time phases for specific tasks',
      'pattern-match': 'Regex-based filtering rules for entities',
      'precedence-override': 'Priority ordering rules for scheduling decisions',
    };
    return descriptions[type] || 'Business rule for task scheduling and resource allocation';
  };

  const renderRuleSpecificDetails = (rule: BusinessRule) => {
    switch (rule.type) {
      case 'co-run':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Affected Tasks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(rule as any).taskIds?.map((taskId: string) => (
                  <div key={taskId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-medium">{entityData.tasks[taskId as keyof typeof entityData.tasks] || taskId}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Co-run Settings</h4>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${(rule as any).mustRunTogether ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="text-sm">
                  {(rule as any).mustRunTogether ? 'Must run together' : 'Can be separated'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'slot-restriction':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Client Groups</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(rule as any).clientGroup?.map((clientId: string) => (
                  <div key={clientId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium">{entityData.clients[clientId as keyof typeof entityData.clients] || clientId}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Worker Groups</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(rule as any).workerGroup?.map((workerId: string) => (
                  <div key={workerId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-medium">{entityData.workers[workerId as keyof typeof entityData.workers] || workerId}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Minimum Common Slots</h4>
              <span className="text-lg font-semibold text-gray-900">{(rule as any).minCommonSlots || 0}</span>
            </div>
          </div>
        );

      case 'load-limit':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Worker Groups</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(rule as any).workerGroup?.map((workerId: string) => (
                  <div key={workerId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-medium">{entityData.workers[workerId as keyof typeof entityData.workers] || workerId}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Load Limit</h4>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-900">{(rule as any).maxSlotsPerPhase || 0} slots per phase</span>
                <span className="text-sm text-gray-500">({(rule as any).phaseType || 'all'} phases)</span>
              </div>
            </div>
          </div>
        );

      case 'phase-window':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Affected Task</h4>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-sm font-medium">
                  {entityData.tasks[(rule as any).taskId as keyof typeof entityData.tasks] || (rule as any).taskId}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Allowed Phases</h4>
              <div className="flex flex-wrap gap-2">
                {(rule as any).allowedPhases?.map((phase: string) => (
                  <span key={phase} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {phase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pattern-match':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Regex Pattern</h4>
              <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                {(rule as any).regex || 'No pattern specified'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Target Field</h4>
                <span className="text-sm font-medium capitalize">{(rule as any).targetField || 'N/A'}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Action</h4>
                <span className="text-sm font-medium capitalize">{(rule as any).action || 'N/A'}</span>
              </div>
            </div>
          </div>
        );

      case 'precedence-override':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Priority Order</h4>
              <div className="space-y-2">
                {(rule as any).priorityOrder?.map((item: string, index: number) => (
                  <div key={item} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Criteria</h4>
              <div className="space-y-2">
                {(rule as any).criteria?.map((criterion: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium">{criterion.field}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{criterion.weight * 100}%</span>
                      <span className="text-xs text-gray-400 capitalize">({criterion.direction})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">No specific details available for this rule type.</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rule details...</p>
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
                <span className="text-gray-600">Rule Details</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{rule.name}</h1>
              <p className="mt-2 text-gray-600">{rule.description}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rule Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rule Type</h3>
                  <p className="text-lg font-semibold text-gray-900">{getRuleTypeLabel(rule.type)}</p>
                  <p className="text-sm text-gray-600 mt-1">{getRuleTypeDescription(rule.type)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">{rule.priority}/10</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(rule.priority / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-sm text-gray-900">
                    {rule.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <p className="text-sm text-gray-900">
                    {rule.updatedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Rule Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Configuration</h2>
              {renderRuleSpecificDetails(rule)}
            </div>

            {/* Validation Status */}
            {validation && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium">
                      {validation.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  
                  {validation.errors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-2">Errors</h4>
                      <ul className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h4>
                      <ul className="space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/rules/${ruleId}/edit`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Rule
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to toggle this rule?')) {
                      // Handle toggle
                      console.log('Toggle rule:', ruleId);
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {rule.enabled ? 'Disable' : 'Enable'} Rule
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
                      // Handle delete
                      router.push('/rules');
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Rule
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Rule ID</h4>
                  <p className="text-sm font-mono text-gray-900">{rule.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium">{rule.enabled ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Age</h4>
                  <p className="text-sm text-gray-900">
                    {Math.floor((Date.now() - rule.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
