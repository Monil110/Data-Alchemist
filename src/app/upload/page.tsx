"use client";
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSV } from '@/lib/parsers/csv-parser';
import { useDataStore } from '@/store';
import { useValidationStore } from '@/store/validation-slice';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  data?: any;
  errors?: string[];
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  // Data store actions
  const setClients = useDataStore(s => s.setClients);
  const setWorkers = useDataStore(s => s.setWorkers);
  const setTasks = useDataStore(s => s.setTasks);
  const runValidation = useValidationStore(s => s.runValidation);

  const detectFileType = (fileName: string): 'clients' | 'workers' | 'tasks' | null => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('client')) return 'clients';
    if (lowerName.includes('worker')) return 'workers';
    if (lowerName.includes('task')) return 'tasks';
    return null;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadStatus('uploading');

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue; // Skip if file is undefined
      
      try {
        // Detect file type
        const fileType = detectFileType(file.name);
        if (!fileType) {
          throw new Error('Could not determine file type. Please rename file to include "client", "worker", or "task".');
        }

        // Parse CSV file
        const result = await parseCSV(file, fileType);
        console.log('CSV Parse Result:', { fileType, result });
        
        // Update file status
        setUploadedFiles(prev => 
          prev.map((f, _) => {
            if (f.name === file.name) {
              return { 
                ...f, 
                progress: 100, 
                status: 'success' as const,
                data: result[fileType],
                errors: result.errors
              };
            }
            return f;
          })
        );

        // Store data in Zustand store
        if (fileType === 'clients' && result.clients) {
          console.log('Setting clients data:', result.clients);
          setClients(result.clients);
          runValidation();
        } else if (fileType === 'workers' && result.workers) {
          console.log('Setting workers data:', result.workers);
          setWorkers(result.workers);
          runValidation();
        } else if (fileType === 'tasks' && result.tasks) {
          console.log('Setting tasks data:', result.tasks);
          setTasks(result.tasks);
          runValidation();
        }

      } catch (error) {
        console.error('Error processing file:', file.name, error);
        setUploadedFiles(prev => 
          prev.map((f, _) => {
            if (f.name === file.name) {
              return { 
                ...f, 
                progress: 100, 
                status: 'error' as const,
                errors: [error instanceof Error ? error.message : 'Unknown error']
              };
            }
            return f;
          })
        );
      }
    }

    // Check if all files are processed
    setTimeout(() => {
      const allProcessed = newFiles.every(file => 
        uploadedFiles.some(f => f.name === file.name && f.status !== 'uploading')
      );
      if (allProcessed) {
        setUploadStatus('success');
      }
    }, 1000);
  }, [setClients, setWorkers, setTasks, runValidation, uploadedFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return '📊';
      case 'xlsx':
      case 'xls':
        return '📈';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            File Upload & Validation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your CSV/XLSX files with AI-powered header mapping and real-time validation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Upload Files</h2>
                <p className="text-gray-600">Drag and drop or click to upload</p>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-4">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
              </h3>
              <p className="text-gray-600 mb-4">
                Supports CSV, XLSX, and XLS files up to 10MB each
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Choose Files
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* File Requirements */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Supported File Types:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  CSV files (.csv) - Comma-separated values
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Excel files (.xlsx, .xls) - Microsoft Excel format
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Maximum file size: 10MB per file
                </li>
              </ul>
            </div>

            {/* AI Features */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">🤖 AI-Powered Features:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Smart header mapping - Auto-detect column names
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Intelligent data type detection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Automatic validation rule suggestions
                </li>
              </ul>
            </div>
          </div>

          {/* File List & Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Upload Status</h2>
                <p className="text-gray-600">Real-time file processing</p>
              </div>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No files uploaded</h3>
                <p className="text-gray-600">Upload files to see their status here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(file.name)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={getStatusColor(file.status)}>
                          {file.status === 'uploading' && 'Uploading...'}
                          {file.status === 'success' && 'Uploaded successfully'}
                          {file.status === 'error' && 'Upload failed'}
                        </span>
                        <span className="text-gray-500">{file.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            file.status === 'success' ? 'bg-green-500' :
                            file.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Show parsing results */}
                    {file.status === 'success' && file.data && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-800">
                          <strong>✓ Parsed successfully:</strong> {file.data.length} records
                        </div>
                        {file.errors && file.errors.length > 0 && (
                          <div className="mt-2 text-sm text-orange-700">
                            <strong>⚠ Warnings:</strong> {file.errors.length} issues found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show errors */}
                    {file.status === 'error' && file.errors && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-800">
                          <strong>✗ Error:</strong> {file.errors[0]}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Summary */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Upload Summary:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Files:</span>
                    <span className="ml-2 font-medium">{uploadedFiles.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {uploadedFiles.filter(f => f.status === 'success').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploading:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {uploadedFiles.filter(f => f.status === 'uploading').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {uploadedFiles.filter(f => f.status === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {uploadStatus === 'success' && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push('/data')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  View Data
                </button>
                <button
                  onClick={() => router.push('/rules')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Manage Rules
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/data')}
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Data
          </button>
          
          <button
            onClick={() => router.push('/rules')}
            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Rules
          </button>
          
          <button
            onClick={() => router.push('/export')}
            className="flex items-center justify-center p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
} 