"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BusinessRule } from '@/types/rules';
import RuleForm from '@/components/rules/rule-form';

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

export default function CreateRulePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleCreateRule = async (rule: BusinessRule) => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      console.log('Creating rule:', rule);
      
      // Navigate back to rules page
      router.push('/rules');
    } catch (err) {
      console.error('Error creating rule:', err);
      alert('Failed to create rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/rules');
  };

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
                <span className="text-gray-600">Create Rule</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Rule</h1>
              <p className="mt-2 text-gray-600">
                Define a new business rule to control task scheduling and resource allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Rule Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Rule Types Available</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">Co-run Rules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Slot Restrictions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-sm">Load Limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-sm">Phase Windows</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Pattern Matching</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span className="text-sm">Precedence Override</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Available Entities</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">{availableTasks.length} Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm">{availableClients.length} Clients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-sm">{availableWorkers.length} Workers</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Validation</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Real-time validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Cross-reference checking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Business logic validation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rule Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure the rule settings and parameters below.
            </p>
          </div>
          <div className="p-6">
            <RuleForm
              onSubmit={handleCreateRule}
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
              href="/rules"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View All Rules
            </Link>
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
                  Creating...
                </>
              ) : (
                'Create Rule'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
