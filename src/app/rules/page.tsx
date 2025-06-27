"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function RulesPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const rules: any[] = [];

  const filteredRules = rules.filter(rule => {
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const ruleTypes = [
    { value: 'all', label: 'All Rules', count: rules.length },
    { value: 'co-run', label: 'Co-run Rules', count: rules.filter(r => r.type === 'co-run').length },
    { value: 'load-limit', label: 'Load Limits', count: rules.filter(r => r.type === 'load-limit').length },
    { value: 'pattern-match', label: 'Pattern Match', count: rules.filter(r => r.type === 'pattern-match').length },
    { value: 'phase-window', label: 'Phase Window', count: rules.filter(r => r.type === 'phase-window').length },
    { value: 'precedence', label: 'Precedence', count: rules.filter(r => r.type === 'precedence').length },
    { value: 'slot-restriction', label: 'Slot Restriction', count: rules.filter(r => r.type === 'slot-restriction').length }
  ];

  const getRuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'co-run': 'bg-blue-100 text-blue-800',
      'load-limit': 'bg-green-100 text-green-800',
      'pattern-match': 'bg-purple-100 text-purple-800',
      'phase-window': 'bg-orange-100 text-orange-800',
      'precedence': 'bg-red-100 text-red-800',
      'slot-restriction': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRuleTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'co-run': '🔄',
      'load-limit': '⚖️',
      'pattern-match': '🔍',
      'phase-window': '⏰',
      'precedence': '📋',
      'slot-restriction': '🚫'
    };
    return icons[type] || '⚙️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Business Rules Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create and manage validation rules for data quality and business logic enforcement
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
                <p className="text-sm text-gray-600">Total Rules</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Active Rules</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {rules.filter(r => !r.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Inactive Rules</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏸️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">7</p>
                <p className="text-sm text-gray-600">Rule Types</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ruleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Create Rule Button */}
            <Link
              href="/rules/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Rule
            </Link>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xl">{getRuleTypeIcon(rule.type)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRuleTypeColor(rule.type)}`}>
                        {rule.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        rule.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {rule.isActive ? '✓' : '○'}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {rule.description}
                </p>

                {/* Priority */}
                <div className="flex items-center mb-4">
                  <span className="text-sm text-gray-500 mr-2">Priority:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= rule.priority ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/rules/${rule.id}`}
                    className="flex-1 text-center bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/rules/${rule.id}/edit`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚙️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rules found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first business rule.'
              }
            </p>
            <Link
              href="/rules/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Rule
            </Link>
          </div>
        )}

        {/* Rule Types Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Rule Types Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ruleTypes.slice(1).map((type) => (
              <div key={type.value} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">{getRuleTypeIcon(type.value)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                  <p className="text-sm text-gray-600">{type.count} rules</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
