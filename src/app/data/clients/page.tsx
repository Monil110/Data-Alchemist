"use client";
import React, { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { useDataStore } from '@/store';
import NaturalLanguageSearch from '@/components/ai/natural-language-search';
import { ValidationPanel } from '@/components/validation/validation-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClientsPage() {
  const { clients, setClients, validationErrors } = useDataStore();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Client>('ClientID');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [nlFilter, setNlFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter clients based on search term, filters, and natural language query
  useEffect(() => {
    let filtered = [...clients];

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(client =>
        client.ClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ClientID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.GroupTag && client.GroupTag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(client => client.PriorityLevel === parseInt(priorityFilter));
    }

    // Apply group filter
    if (groupFilter !== 'all') {
      filtered = filtered.filter(client => client.GroupTag === groupFilter);
    }

    // Apply natural language filter
    if (nlFilter.trim()) {
      filtered = filterClientsByQuery(filtered, nlFilter);
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchTerm, priorityFilter, groupFilter, nlFilter]);

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

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClients = [...filteredClients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Export
          </Button>
          <Button onClick={() => {}}>
            Add Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clients Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="1">Priority 1</SelectItem>
                      <SelectItem value="2">Priority 2</SelectItem>
                      <SelectItem value="3">Priority 3</SelectItem>
                      <SelectItem value="4">Priority 4</SelectItem>
                      <SelectItem value="5">Priority 5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {Array.from(new Set(clients.map(c => c.GroupTag).filter(Boolean))).map(group => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <NaturalLanguageSearch onSearch={setNlFilter} placeholder="e.g. Priority 5, with task T1" />

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th 
                          className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('ClientID')}
                        >
                          Client ID
                          {sortField === 'ClientID' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('ClientName')}
                        >
                          Name
                          {sortField === 'ClientName' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('PriorityLevel')}
                        >
                          Priority
                          {sortField === 'PriorityLevel' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('GroupTag')}
                        >
                          Group
                          {sortField === 'GroupTag' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClients.map((client) => (
                        <tr key={client.ClientID} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{client.ClientID}</td>
                          <td className="border border-gray-300 px-4 py-2">{client.ClientName}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge variant={client.PriorityLevel >= 4 ? 'destructive' : 'default'}>
                              {client.PriorityLevel}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{client.GroupTag || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedClients.length)} of {sortedClients.length} clients
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ValidationPanel />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Clients:</span>
                  <span className="font-semibold">{clients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Priority:</span>
                  <span className="font-semibold text-red-600">
                    {clients.filter(c => c.PriorityLevel >= 4).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Groups:</span>
                  <span className="font-semibold">
                    {Array.from(new Set(clients.map(c => c.GroupTag).filter(Boolean))).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 