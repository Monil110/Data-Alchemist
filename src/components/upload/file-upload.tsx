"use client";

import React, { useState } from 'react';
import { DragDropZone } from './drag-drop-zone';
import { parseCSV } from '@/lib/parsers/csv-parser';
import { parseXLSX } from '@/lib/parsers/xlsx-parser';
import { useDataStore } from '@/store';

const detectEntityType = (fileName: string): 'clients' | 'workers' | 'tasks' | null => {
  const lower = fileName.toLowerCase();
  if (lower.includes('client')) return 'clients';
  if (lower.includes('worker')) return 'workers';
  if (lower.includes('task')) return 'tasks';
  return null;
};

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const setClients = useDataStore(s => s.setClients);
  const setWorkers = useDataStore(s => s.setWorkers);
  const setTasks = useDataStore(s => s.setTasks);

  const handleFilesSelected = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
    setErrors([]);

    for (const file of newFiles) {
      const entityType = detectEntityType(file.name);
      if (!entityType) {
        setErrors(prev => [...prev, `Unknown entity type for file: ${file.name}`]);
        continue;
      }
      let result;
      if (file.name.endsWith('.csv')) {
        result = await parseCSV(file, entityType);
      } else if (file.name.endsWith('.xlsx')) {
        result = await parseXLSX(file, entityType);
      } else {
        setErrors(prev => [...prev, `Unsupported file type: ${file.name}`]);
        continue;
      }
      if (result.errors && result.errors.length > 0) {
        setErrors(prev => [...prev, ...result.errors.map(e => `${file.name}: ${e}`)]);
      }
      if (entityType === 'clients' && result.clients) setClients(result.clients);
      if (entityType === 'workers' && result.workers) setWorkers(result.workers);
      if (entityType === 'tasks' && result.tasks) setTasks(result.tasks);
    }
  };

  return (
    <div>
      <DragDropZone onFilesSelected={handleFilesSelected} />
      <div style={{ marginTop: 16 }}>
        <h4>Uploaded Files:</h4>
        <ul>
          {files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
        {errors.length > 0 && (
          <div style={{ color: 'red', marginTop: 8 }}>
            <strong>Errors:</strong>
            <ul>
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};