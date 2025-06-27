"use client";
import React, { useState } from 'react';

export default function ExportPage() {
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['clients', 'workers', 'tasks']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
  const [includeErrors, setIncludeErrors] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const entityOptions = [
    { value: 'clients', label: 'Clients', count: 0, icon: '👥' },
    { value: 'workers', label: 'Workers', count: 0, icon: '👷' },
    { value: 'tasks', label: 'Tasks', count: 0, icon: '📋' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values', icon: '📄' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format', icon: '📊' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation', icon: '🔧' }
  ];

  const handleEntityToggle = (entity: string) => {
    setSelectedEntities(prev => 
      prev.includes(entity) 
        ? prev.filter(e => e !== entity)
        : [...prev, entity]
    );
  };

  const handleExport = async () => {
    if (selectedEntities.length === 0) return;

    setExportStatus('exporting');

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExportStatus('success');

      // Simulate download
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,';
        a.download = `export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
    }
  };

  const getTotalRecords = () => {
    return 0; // No data available yet
  };

  const getValidationStatus = () => {
    return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Export
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Export your validated data in various formats with custom configurations
          </p>
        </div>

        {/* Export Status */}
        {exportStatus !== 'idle' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {exportStatus === 'exporting' && 'Exporting Data...'}
                  {exportStatus === 'success' && 'Export Successful!'}
                  {exportStatus === 'error' && 'Export Failed'}
                </h3>
                <div className="flex items-center space-x-2">
                  {exportStatus === 'exporting' && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  )}
                  {exportStatus === 'success' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {exportStatus === 'error' && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {exportStatus === 'success' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Export completed successfully! Your file has been downloaded.
                  </p>
                </div>
              )}

              {exportStatus === 'error' && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-800">
                    ❌ Export failed. Please try again or check your data.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Data to Export</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entityOptions.map((entity) => (
                  <label
                    key={entity.value}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedEntities.includes(entity.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity.value)}
                      onChange={() => handleEntityToggle(entity.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">{entity.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entity.label}</p>
                        <p className="text-sm text-gray-600">{entity.count} records</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formatOptions.map((format) => (
                  <label
                    key={format.value}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx' | 'json')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">{format.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{format.label}</p>
                        <p className="text-sm text-gray-600">{format.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Options</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeErrors}
                    onChange={(e) => setIncludeErrors(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    Include validation errors in export
                  </span>
                </label>
                <p className="text-sm text-gray-600">
                  When enabled, validation errors will be included as a separate sheet or section in the export.
                </p>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Records:</span>
                  <span className="font-semibold">{getTotalRecords()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-semibold capitalize">{exportFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Include Errors:</span>
                  <span className="font-semibold">{includeErrors ? 'Yes' : 'No'}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Size:</span>
                  <span className="font-semibold">~{Math.round(getTotalRecords() * 0.5)}KB</span>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validation Errors:</span>
                  <span className="font-semibold text-red-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality Score:</span>
                  <span className={`font-semibold ${validationStatus.color}`}>
                    {validationStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <button
                onClick={handleExport}
                disabled={selectedEntities.length === 0 || exportStatus === 'exporting'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {exportStatus === 'exporting' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </>
                )}
              </button>
              {selectedEntities.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Please select at least one data type to export
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Export History */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Exports</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Welcome to Digitalize Project</p>
                <p className="text-sm text-gray-600">Upload data to start exporting</p>
              </div>
              <span className="text-sm text-gray-500">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
