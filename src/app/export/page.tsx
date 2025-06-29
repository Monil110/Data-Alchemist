"use client";
import React, { useState } from 'react';
import { PrioritizationSettings } from '@/types/rules';
import ExportSystem from '@/components/export/export-system';
import { useDataStore } from '@/store';

export default function ExportPage() {
  const { clients, workers, tasks, businessRules } = useDataStore();
  
  // Mock prioritization settings for now since the store is empty
  const prioritizationSettings: PrioritizationSettings[] = [
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
  ];

  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    date: string;
    type: string;
    records: number;
    format: string;
  }>>([
    {
      id: '1',
      date: '2024-01-15T10:30:00Z',
      type: 'Combined JSON',
      records: 12,
      format: 'JSON',
    },
    {
      id: '2',
      date: '2024-01-14T14:20:00Z',
      type: 'Separate CSV',
      records: 8,
      format: 'CSV',
    },
  ]);

  const handleExport = (exportData: any) => {
    // Real export functionality
    const exportRecord = {
      id: `export_${Date.now()}`,
      date: new Date().toISOString(),
      type: exportData.metadata ? 'Combined JSON' : 'Separate Files',
      records: exportData.metadata?.totalRecords || 0,
      format: exportData.metadata ? 'JSON' : 'Multiple',
    };

    setExportHistory([exportRecord, ...exportHistory]);

    // Simulate file download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert('Export completed successfully!');
  };

  const getDataStats = () => ({
    totalClients: clients.length,
    totalWorkers: workers.length,
    totalTasks: tasks.length,
    totalRules: businessRules.length,
    totalSettings: prioritizationSettings.length,
    lastUpdated: new Date().toISOString(),
  });

  const stats = getDataStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Export</h1>
          <p className="mt-2 text-gray-600">
            Export your data, business rules, and prioritization settings in various formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export System */}
          <div className="lg:col-span-2">
            <ExportSystem
              clients={clients}
              workers={workers}
              tasks={tasks}
              rules={businessRules as any}
              prioritizationSettings={prioritizationSettings}
              onExport={handleExport}
            />
          </div>

          {/* Data Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👥</span>
                    <span className="text-sm font-medium text-gray-700">Clients</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalClients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👷</span>
                    <span className="text-sm font-medium text-gray-700">Workers</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalWorkers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📋</span>
                    <span className="text-sm font-medium text-gray-700">Tasks</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">⚙️</span>
                    <span className="text-sm font-medium text-gray-700">Business Rules</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalRules}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📊</span>
                    <span className="text-sm font-medium text-gray-700">Prioritization Settings</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalSettings}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(stats.lastUpdated).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>

            {/* Export History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>
              <div className="space-y-3">
                {exportHistory.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} - {record.records} records
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {record.format}
                    </span>
                  </div>
                ))}
              </div>
              {exportHistory.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No export history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Templates */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-medium text-gray-900">Data Only</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export only the core data (clients, workers, tasks) without business rules or settings.
              </p>
              <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Use Template
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">⚙️</span>
                </div>
                <h3 className="font-medium text-gray-900">Rules & Settings</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export business rules and prioritization settings for backup or sharing.
              </p>
              <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                Use Template
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">📦</span>
                </div>
                <h3 className="font-medium text-gray-900">Complete Package</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export everything including data, rules, settings, and metadata in a single file.
              </p>
              <button className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Use Template
              </button>
            </div>
          </div>
        </div>

        {/* Export Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Export Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Format Selection</h4>
              <ul className="space-y-1">
                <li>• CSV: Best for spreadsheet applications</li>
                <li>• Excel: Good for complex data with formatting</li>
                <li>• JSON: Ideal for data processing and APIs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Export Types</h4>
              <ul className="space-y-1">
                <li>• Separate files: Easier to work with individual data types</li>
                <li>• Combined package: Better for backup and sharing</li>
                <li>• Include metadata for tracking and version control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
