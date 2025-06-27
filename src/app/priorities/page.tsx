"use client";
import React, { useState } from 'react';

export default function PrioritiesPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'tasks' | 'workers'>('clients');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const clients: any[] = [];
  const tasks: any[] = [];
  const workers: any[] = [];

  const tabs = [
    { id: 'clients', label: 'Clients', count: clients.length, icon: '👥' },
    { id: 'tasks', label: 'Tasks', count: tasks.length, icon: '📋' },
    { id: 'workers', label: 'Workers', count: workers.length, icon: '👷' }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'clients': return clients;
      case 'tasks': return tasks;
      case 'workers': return workers;
      default: return [];
    }
  };

  const handleSelectAll = () => {
    const currentData = getCurrentData();
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item.id));
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on ${selectedItems.length} items`);
    // Implement bulk actions here
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Priorities Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Set and manage priorities for clients, tasks, and workers with AI-powered recommendations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{clients.length + tasks.length + workers.length}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {clients.filter(c => c.priority === 'high').length + 
                   tasks.filter(t => t.priority === 'high').length + 
                   workers.filter(w => w.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {clients.filter(c => c.priority === 'medium').length + 
                   tasks.filter(t => t.priority === 'medium').length + 
                   workers.filter(w => w.priority === 'medium').length}
                </p>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🟡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {clients.filter(c => c.priority === 'low').length + 
                   tasks.filter(t => t.priority === 'low').length + 
                   workers.filter(w => w.priority === 'low').length}
                </p>
                <p className="text-sm text-gray-600">Low Priority</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'clients' | 'tasks' | 'workers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Bulk Actions */}
            {currentData.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === currentData.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Select All ({selectedItems.length}/{currentData.length})
                      </span>
                    </label>
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('high')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Set High Priority
                      </button>
                      <button
                        onClick={() => handleBulkAction('medium')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                      >
                        Set Medium Priority
                      </button>
                      <button
                        onClick={() => handleBulkAction('low')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Set Low Priority
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-gray-600 mb-6">
                Upload data files to start managing priorities.
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Data
              </button>
            </div>
          </div>
        </div>

        {/* Priority Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Weight Sliders</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Adjust importance weights for different criteria using interactive sliders.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Configure Weights
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Pairwise Comparison</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Compare items in pairs to determine relative importance and priorities.
            </p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Start Comparison
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Recommendations</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get AI-powered priority suggestions based on historical data and patterns.
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Get Recommendations
            </button>
          </div>
        </div>

        {/* Priority Presets */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Priority Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left">
              <h4 className="font-medium text-red-900">Urgent Tasks</h4>
              <p className="text-sm text-red-700">High priority for time-sensitive items</p>
            </button>
            
            <button className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left">
              <h4 className="font-medium text-yellow-900">Balanced</h4>
              <p className="text-sm text-yellow-700">Equal weight distribution</p>
            </button>
            
            <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
              <h4 className="font-medium text-green-900">Quality Focus</h4>
              <p className="text-sm text-green-700">Prioritize quality over speed</p>
            </button>
            
            <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <h4 className="font-medium text-blue-900">Custom</h4>
              <p className="text-sm text-blue-700">Create your own priority profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
