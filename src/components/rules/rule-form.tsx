"use client";

import React, { useState, useEffect } from 'react';
import { BusinessRule, RuleType, RuleValidationResult } from '@/types/rules';

interface RuleFormProps {
  initialRule?: Partial<BusinessRule>;
  onSubmit: (rule: BusinessRule) => void;
  onCancel: () => void;
  availableTasks?: Array<{ id: string; name: string }>;
  availableClients?: Array<{ id: string; name: string }>;
  availableWorkers?: Array<{ id: string; name: string }>;
}

// Extended form data type to handle all rule properties
interface RuleFormData {
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  // Co-run rule properties
  taskIds?: string[];
  mustRunTogether?: boolean;
  // Slot restriction rule properties
  clientGroup?: string[];
  workerGroup?: string[];
  minCommonSlots?: number;
  // Load limit rule properties
  maxSlotsPerPhase?: number;
  phaseType?: 'morning' | 'afternoon' | 'evening' | 'all';
  // Phase window rule properties
  taskId?: string;
  allowedPhases?: string[];
  phaseRange?: { start: number; end: number };
  // Pattern match rule properties
  regex?: string;
  ruleTemplate?: string;
  targetField?: 'client' | 'worker' | 'task';
  action?: 'include' | 'exclude' | 'prioritize';
  // Precedence override rule properties
  priorityOrder?: string[];
  criteria?: Array<{ field: string; weight: number; direction: 'asc' | 'desc' }>;
}

export default function RuleForm({
  initialRule,
  onSubmit,
  onCancel,
  availableTasks = [],
  availableClients = [],
  availableWorkers = []
}: RuleFormProps) {
  const [ruleType, setRuleType] = useState<RuleType>('co-run');
  const [formData, setFormData] = useState<RuleFormData>({
    name: initialRule?.name || '',
    description: initialRule?.description || '',
    enabled: initialRule?.enabled ?? true,
    priority: initialRule?.priority || 1,
  });
  const [validation, setValidation] = useState<RuleValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const ruleTypes: { value: RuleType; label: string; description: string }[] = [
    { value: 'co-run', label: 'Co-run Rules', description: 'Tasks that must run together' },
    { value: 'slot-restriction', label: 'Slot Restrictions', description: 'Client/Worker group slot limitations' },
    { value: 'load-limit', label: 'Load Limits', description: 'Maximum slots per phase for worker groups' },
    { value: 'phase-window', label: 'Phase Windows', description: 'Allowed phases for specific tasks' },
    { value: 'pattern-match', label: 'Pattern Matching', description: 'Regex-based filtering rules' },
    { value: 'precedence-override', label: 'Precedence Override', description: 'Priority ordering rules' }
  ];

  const validateForm = (): RuleValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!formData.name?.trim()) {
      errors.push('Rule name is required');
    }

    if (!formData.description?.trim()) {
      errors.push('Rule description is required');
    }

    // Type-specific validation
    switch (ruleType) {
      case 'co-run':
        if (!formData.taskIds || formData.taskIds.length < 2) {
          errors.push('At least 2 tasks must be selected for co-run rules');
        }
        break;
      case 'slot-restriction':
        if (!formData.clientGroup || formData.clientGroup.length === 0) {
          errors.push('At least one client group must be selected');
        }
        if (!formData.workerGroup || formData.workerGroup.length === 0) {
          errors.push('At least one worker group must be selected');
        }
        if (!formData.minCommonSlots || formData.minCommonSlots < 1) {
          errors.push('Minimum common slots must be at least 1');
        }
        break;
      case 'load-limit':
        if (!formData.workerGroup || formData.workerGroup.length === 0) {
          errors.push('At least one worker group must be selected');
        }
        if (!formData.maxSlotsPerPhase || formData.maxSlotsPerPhase < 1) {
          errors.push('Maximum slots per phase must be at least 1');
        }
        break;
      case 'phase-window':
        if (!formData.taskId) {
          errors.push('Task must be selected');
        }
        if (!formData.allowedPhases || formData.allowedPhases.length === 0) {
          errors.push('At least one phase must be allowed');
        }
        break;
      case 'pattern-match':
        if (!formData.regex?.trim()) {
          errors.push('Regex pattern is required');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  useEffect(() => {
    setValidation(validateForm());
  }, [formData, ruleType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validateForm();
    
    if (validationResult.isValid) {
      const rule: BusinessRule = {
        id: initialRule?.id || `rule_${Date.now()}`,
        type: ruleType,
        createdAt: initialRule?.createdAt || new Date(),
        updatedAt: new Date(),
        ...formData
      } as BusinessRule;
      
      onSubmit(rule);
    }
  };

  const renderRuleTypeForm = () => {
    switch (ruleType) {
      case 'co-run':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tasks
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {availableTasks.map(task => (
                  <label key={task.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.taskIds?.includes(task.id) || false}
                      onChange={(e) => {
                        const currentIds = formData.taskIds || [];
                        const newIds = e.target.checked
                          ? [...currentIds, task.id]
                          : currentIds.filter(id => id !== task.id);
                        setFormData({ ...formData, taskIds: newIds });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{task.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.mustRunTogether || false}
                  onChange={(e) => setFormData({ ...formData, mustRunTogether: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Must run together (cannot be separated)
                </span>
              </label>
            </div>
          </div>
        );
      case 'slot-restriction':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Groups
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableClients.map(client => (
                  <label key={client.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.clientGroup?.includes(client.id) || false}
                      onChange={(e) => {
                        const currentIds = formData.clientGroup || [];
                        const newIds = e.target.checked
                          ? [...currentIds, client.id]
                          : currentIds.filter(id => id !== client.id);
                        setFormData({ ...formData, clientGroup: newIds });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{client.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker Groups
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableWorkers.map(worker => (
                  <label key={worker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.workerGroup?.includes(worker.id) || false}
                      onChange={(e) => {
                        const currentIds = formData.workerGroup || [];
                        const newIds = e.target.checked
                          ? [...currentIds, worker.id]
                          : currentIds.filter(id => id !== worker.id);
                        setFormData({ ...formData, workerGroup: newIds });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{worker.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Common Slots
              </label>
              <input
                type="number"
                min="1"
                value={formData.minCommonSlots || ''}
                onChange={(e) => setFormData({ ...formData, minCommonSlots: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      case 'load-limit':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker Groups
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableWorkers.map(worker => (
                  <label key={worker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.workerGroup?.includes(worker.id) || false}
                      onChange={(e) => {
                        const currentIds = formData.workerGroup || [];
                        const newIds = e.target.checked
                          ? [...currentIds, worker.id]
                          : currentIds.filter(id => id !== worker.id);
                        setFormData({ ...formData, workerGroup: newIds });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{worker.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Slots Per Phase
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxSlotsPerPhase || ''}
                onChange={(e) => setFormData({ ...formData, maxSlotsPerPhase: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase Type
              </label>
              <select
                value={formData.phaseType || 'all'}
                onChange={(e) => setFormData({ ...formData, phaseType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Phases</option>
                <option value="morning">Morning Only</option>
                <option value="afternoon">Afternoon Only</option>
                <option value="evening">Evening Only</option>
              </select>
            </div>
          </div>
        );
      case 'phase-window':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task
              </label>
              <select
                value={formData.taskId || ''}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a task...</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>{task.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Phases
              </label>
              <div className="space-y-2">
                {['morning', 'afternoon', 'evening', 'night'].map(phase => (
                  <label key={phase} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allowedPhases?.includes(phase) || false}
                      onChange={(e) => {
                        const currentPhases = formData.allowedPhases || [];
                        const newPhases = e.target.checked
                          ? [...currentPhases, phase]
                          : currentPhases.filter(p => p !== phase);
                        setFormData({ ...formData, allowedPhases: newPhases });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{phase}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 'pattern-match':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regex Pattern
              </label>
              <input
                type="text"
                value={formData.regex || ''}
                onChange={(e) => setFormData({ ...formData, regex: e.target.value })}
                placeholder="Enter regex pattern..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Field
              </label>
              <select
                value={formData.targetField || 'client'}
                onChange={(e) => setFormData({ ...formData, targetField: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="client">Client</option>
                <option value="worker">Worker</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={formData.action || 'include'}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
                <option value="prioritize">Prioritize</option>
              </select>
            </div>
          </div>
        );
      default:
        return <div>Select a rule type to configure</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Type
        </label>
        <select
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value as RuleType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ruleTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter rule name..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what this rule does..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.priority || 1}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.enabled || false}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Enable this rule</span>
        </label>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Configuration</h3>
        {renderRuleTypeForm()}
      </div>

      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!validation.isValid}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialRule ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
} 