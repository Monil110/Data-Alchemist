"use client";

import React, { useState, useEffect } from 'react';
import { BusinessRule, PrioritizationSettings } from '@/types/rules';

interface ExportSystemProps {
  clients: any[];
  workers: any[];
  tasks: any[];
  rules: BusinessRule[];
  prioritizationSettings: PrioritizationSettings[];
  onExport: (exportData: ExportData) => void;
}

interface ExportData {
  clients: any[];
  workers: any[];
  tasks: any[];
  rules: BusinessRule[];
  prioritizationSettings: PrioritizationSettings[];
  metadata: {
    exportDate: string;
    version: string;
    totalRecords: number;
  };
}

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
}

const exportFormats: ExportFormat[] = [
  { id: 'csv', name: 'CSV', extension: '.csv', description: 'Comma-separated values' },
  { id: 'xlsx', name: 'Excel', extension: '.xlsx', description: 'Microsoft Excel format' },
  { id: 'json', name: 'JSON', extension: '.json', description: 'JavaScript Object Notation' },
];

export default function ExportSystem({
  clients,
  workers,
  tasks,
  rules,
  prioritizationSettings,
  onExport
}: ExportSystemProps) {
  const [selectedData, setSelectedData] = useState({
    clients: true,
    workers: true,
    tasks: true,
    rules: true,
    prioritizationSettings: true,
  });
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [exportType, setExportType] = useState<'separate' | 'combined'>('separate');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Clear validation errors when selections change
  useEffect(() => {
    setValidationErrors([]);
  }, [selectedData, selectedFormat, exportType]);

  const dataTypes = [
    { key: 'clients', label: 'Clients', count: clients.length, icon: '👥' },
    { key: 'workers', label: 'Workers', count: workers.length, icon: '👷' },
    { key: 'tasks', label: 'Tasks', count: tasks.length, icon: '📋' },
    { key: 'rules', label: 'Business Rules', count: rules.length, icon: '⚙️' },
    { key: 'prioritizationSettings', label: 'Prioritization Settings', count: prioritizationSettings.length, icon: '📊' },
  ];

  const validateExport = (): string[] => {
    const errors: string[] = [];

    // Check if any data is selected
    const hasSelectedData = Object.values(selectedData).some(Boolean);
    if (!hasSelectedData) {
      errors.push('Please select at least one data type to export');
    }

    // Check if data exists for selected types (only if they are selected)
    if (selectedData.clients && clients.length === 0) {
      errors.push('No client data available for export');
    }
    if (selectedData.workers && workers.length === 0) {
      errors.push('No worker data available for export');
    }
    if (selectedData.tasks && tasks.length === 0) {
      errors.push('No task data available for export');
    }
    if (selectedData.rules && rules.length === 0) {
      errors.push('No business rules available for export');
    }
    if (selectedData.prioritizationSettings && prioritizationSettings.length === 0) {
      errors.push('No prioritization settings available for export');
    }

    // Check format compatibility
    if (exportType === 'combined' && selectedFormat !== 'json') {
      errors.push('Combined export is only available in JSON format');
    }

    return errors;
  };

  const handleExport = () => {
    const errors = validateExport();
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    const exportData: ExportData = {
      clients: selectedData.clients ? clients : [],
      workers: selectedData.workers ? workers : [],
      tasks: selectedData.tasks ? tasks : [],
      rules: selectedData.rules ? rules : [],
      prioritizationSettings: selectedData.prioritizationSettings ? prioritizationSettings : [],
      metadata: includeMetadata ? {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalRecords: Object.values(selectedData).filter(Boolean).length,
      } : undefined as any,
    };

    onExport(exportData);
  };

  const getTotalRecords = () => {
    return dataTypes.reduce((total, type) => {
      return total + (selectedData[type.key as keyof typeof selectedData] ? type.count : 0);
    }, 0);
  };

  const getFileSize = () => {
    // Mock file size calculation
    const baseSize = getTotalRecords() * 100; // 100 bytes per record
    const formatMultiplier = selectedFormat === 'xlsx' ? 1.5 : selectedFormat === 'json' ? 1.2 : 1;
    return Math.round(baseSize * formatMultiplier);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Data</h2>
        <p className="text-gray-600">
          Select data types, format, and export options to download your data.
        </p>
      </div>

      {/* Data Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Data Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataTypes.map(type => (
            <label
              key={type.key}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedData[type.key as keyof typeof selectedData]
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedData[type.key as keyof typeof selectedData]}
                onChange={(e) => setSelectedData({
                  ...selectedData,
                  [type.key]: e.target.checked
                })}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{type.icon}</span>
                  <span className="font-medium text-gray-900">{type.label}</span>
                </div>
                <p className="text-sm text-gray-600">{type.count} records</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              {exportFormats.map(format => (
                <label
                  key={format.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{format.name}</div>
                    <div className="text-sm text-gray-600">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                <input
                  type="radio"
                  name="exportType"
                  value="separate"
                  checked={exportType === 'separate'}
                  onChange={(e) => setExportType(e.target.value as 'separate' | 'combined')}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <div className="font-medium text-gray-900">Separate Files</div>
                  <div className="text-sm text-gray-600">Export each data type as a separate file</div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                <input
                  type="radio"
                  name="exportType"
                  value="combined"
                  checked={exportType === 'combined'}
                  onChange={(e) => setExportType(e.target.value as 'separate' | 'combined')}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <div className="font-medium text-gray-900">Combined Package</div>
                  <div className="text-sm text-gray-600">Export all data in a single JSON file</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Include metadata (export date, version, record counts)
            </span>
          </label>
        </div>
      </div>

      {/* Export Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Export Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Records:</span>
            <span className="ml-2 font-medium text-gray-900">{getTotalRecords()}</span>
          </div>
          <div>
            <span className="text-gray-600">Format:</span>
            <span className="ml-2 font-medium text-gray-900">
              {exportFormats.find(f => f.id === selectedFormat)?.name}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Estimated Size:</span>
            <span className="ml-2 font-medium text-gray-900">{getFileSize()} bytes</span>
          </div>
        </div>
        {exportType === 'separate' && (
          <div className="mt-3 text-sm text-gray-600">
            Files to be exported:
            <ul className="mt-1 space-y-1">
              {Object.entries(selectedData).map(([key, selected]) => {
                if (!selected) return null;
                const type = dataTypes.find(t => t.key === key);
                const format = exportFormats.find(f => f.id === selectedFormat);
                return (
                  <li key={key} className="ml-4">
                    • {type?.label.toLowerCase()}{format?.extension}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Export Validation Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleExport}
          disabled={validationErrors.length > 0 || getTotalRecords() === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Data
        </button>
      </div>
    </div>
  );
} 