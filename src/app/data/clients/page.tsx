"use client";
import React, { useState } from 'react';
import { useDataStore } from '@/store';
import { useValidationStore } from '@/store/validation-slice';
import { NaturalLanguageSearch } from '@/components/ai/natural-language-search';
import { NaturalLanguageModifier } from '@/components/ai/natural-language-modifier';
import { AICorrections } from '@/components/ai/ai-corrections';
import { AIRecommendations } from '@/components/ai/ai-recommendations';
import { Client } from '@/types';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [nlFilter, setNlFilter] = useState<string>("");
  const [showAIFeatures, setShowAIFeatures] = useState(false);

  const clients = useDataStore(s => s.clients);
  const setClients = useDataStore(s => s.setClients);
  const runValidation = useValidationStore(s => s.runValidation);
  const validationErrorsList = useValidationStore(s => s.errors);

  // Debug logging
  console.log('ClientsPage: Current clients data:', clients);
  console.log('ClientsPage: Number of clients:', clients.length);

  // Advanced parser for natural language queries
  function filterClientsByQuery(clients: Client[], query: string): Client[] {
    if (!query.trim()) return clients;
    let filtered = clients;
    
    // Numeric comparison: "priority > 3" or "PriorityLevel >= 2"
    const numComp = query.match(/priority(level)?\s*(=|>|<|>=|<=|is|:)?\s*(\d+)/i);
    if (numComp) {
      const op = numComp[2] || '=';
      const levelStr = numComp[3];
      if (levelStr) {
        const level = parseInt(levelStr, 10);
        filtered = filtered.filter(c => {
          if (op === '>' || op === 'gt') return c.PriorityLevel > level;
          if (op === '<' || op === 'lt') return c.PriorityLevel < level;
          if (op === '>=' || op === 'ge') return c.PriorityLevel >= level;
          if (op === '<=' || op === 'le') return c.PriorityLevel <= level;
          return c.PriorityLevel === level;
        });
      }
    }
    
    // Array inclusion: "with task T1" or "task T1"
    const taskMatch = query.match(/task\s*(id)?\s*(=|is|:)?\s*([\w-]+)/i);
    if (taskMatch) {
      const taskId = taskMatch[3];
      if (taskId) {
        filtered = filtered.filter(c => c.RequestedTaskIDs && c.RequestedTaskIDs.includes(taskId));
      }
    }
    
    // Logical AND: "priority > 3 and with task T1"
    if (/ and /i.test(query)) {
      const parts = query.split(/ and /i);
      return parts.reduce((acc, part) => filterClientsByQuery(acc, part), clients);
    }
    
    // Logical OR: "priority 5 or priority 4"
    if (/ or /i.test(query)) {
      const parts = query.split(/ or /i);
      const sets: Client[][] = parts.map(part => filterClientsByQuery(clients, part));
      // Union of all sets
      const union = sets.flat().filter((v, i, arr) => arr.findIndex(x => x.ClientID === v.ClientID) === i);
      return union;
    }
    
    return filtered;
  }

  const filteredClients = filterClientsByQuery(clients, nlFilter).filter(client => {
    const matchesSearch = client.ClientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.ClientID?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || client.PriorityLevel?.toString() === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Client];
    let bValue: any = b[sortBy as keyof Client];
    
    if (sortBy === 'name') {
      aValue = a.ClientName || '';
      bValue = b.ClientName || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-800';
    if (priority >= 3) return 'bg-orange-100 text-orange-800';
    if (priority >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'Critical';
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    const updated = [...clients];
    const client = { ...updated[rowIndex] };
    (client as any)[columnId] = value;
    updated[rowIndex] = client as Client;
    setClients(updated);
    runValidation();
  };

  // Map validation errors to cell keys
  const validationErrors: Record<string, string> = {};
  validationErrorsList.forEach(err => {
    const rowIndex = clients.findIndex(c => c.ClientID === err.entityId);
    if (rowIndex !== -1 && err.field) {
      validationErrors[`${rowIndex}-${err.field}`] = err.message;
    }
  });

  const handleApplyCorrection = (errorId: string, correction: any) => {
    // Apply AI correction logic here
    console.log('Applying correction:', errorId, correction);
    runValidation();
  };

  const handleApplyBatchCorrections = (corrections: Array<{ errorId: string; correction: any }>) => {
    // Apply batch corrections logic here
    console.log('Applying batch corrections:', corrections);
    runValidation();
  };

  const handleApplyModification = (modifiedData: any[]) => {
    setClients(modifiedData);
    runValidation();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
          <p className="mt-2 text-gray-600">
            Manage client information, priorities, and task requests.
          </p>
        </div>

        {/* AI Features Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAIFeatures(!showAIFeatures)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAIFeatures ? 'Hide AI Features' : 'Show AI Features'}
          </button>
        </div>

        {/* AI Features Section */}
        {showAIFeatures && (
          <div className="mb-8 space-y-6">
            {/* Natural Language Modifier */}
            <NaturalLanguageModifier
              entityType="clients"
              data={clients}
              onApplyModification={handleApplyModification}
            />

            {/* AI Corrections */}
            <AICorrections
              errors={validationErrorsList.filter(e => e.affectedEntity === 'client')}
              onApplyCorrection={handleApplyCorrection}
              onApplyBatchCorrections={handleApplyBatchCorrections}
              onDismiss={() => {}}
            />

            {/* AI Recommendations */}
            <AIRecommendations
              clients={clients}
              workers={[]}
              tasks={[]}
              onApplyRecommendation={(recommendation) => {
                console.log('Applying recommendation:', recommendation);
              }}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="1">Low (1)</option>
                <option value="2">Medium (2)</option>
                <option value="3">High (3)</option>
                <option value="4">Critical (4)</option>
                <option value="5">Emergency (5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="ClientID">ID</option>
                <option value="PriorityLevel">Priority</option>
                <option value="GroupTag">Group</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Natural Language Search */}
        <div className="mb-6">
          <NaturalLanguageSearch onSearch={setNlFilter} placeholder="e.g. Priority 5, with task T1" />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedClients.map((client, index) => (
                  <tr key={client.ClientID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.ClientID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.ClientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(client.PriorityLevel)}`}>
                        {getPriorityLabel(client.PriorityLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Array.isArray(client.RequestedTaskIDs) ? client.RequestedTaskIDs.join(', ') : client.RequestedTaskIDs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.GroupTag}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterPriority !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload data files to start managing clients.'
                }
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Client
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 