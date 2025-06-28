"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DataStats {
  clients: number;
  workers: number;
  tasks: number;
  validationErrors: number;
  isLoading: boolean;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'validation' | 'edit' | 'ai_search';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

const HomePage = () => {
  const [stats, setStats] = useState<DataStats>({
    clients: 0,
    workers: 0,
    tasks: 0,
    validationErrors: 0,
    isLoading: true
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'upload',
      message: 'Welcome to Data Alchemist! Upload your CSV/XLSX files to get started.',
      timestamp: new Date(),
      status: 'info'
    },
    {
      id: '2',
      type: 'validation',
      message: 'Validation engine ready - 12 validation rules active',
      timestamp: new Date(Date.now() - 60000),
      status: 'success'
    },
    {
      id: '3',
      type: 'ai_search',
      message: 'AI-powered natural language search is available',
      timestamp: new Date(Date.now() - 120000),
      status: 'info'
    }
  ]);

  // Simulate loading stats from your data store
  useEffect(() => {
    const loadStats = async () => {
      // In real implementation, fetch from your data store
      // const data = await fetchDataStats();
      setTimeout(() => {
        setStats({
          clients: 0, // Replace with actual counts
          workers: 0,
          tasks: 0,
          validationErrors: 0,
          isLoading: false
        });
      }, 1000);
    };
    
    loadStats();
  }, []);

  const quickStats = [
    {
      title: 'Clients',
      count: stats.clients,
      href: '/data/clients',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      icon: '👥',
      description: 'Active client records'
    },
    {
      title: 'Workers',
      count: stats.workers,
      href: '/data/workers',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      icon: '👷',
      description: 'Available workers'
    },
    {
      title: 'Tasks',
      count: stats.tasks,
      href: '/data/tasks',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      icon: '📋',
      description: 'Total tasks defined'
    },
    {
      title: 'Validation Issues',
      count: stats.validationErrors,
      href: '/upload',
      color: stats.validationErrors > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500',
      hoverColor: stats.validationErrors > 0 ? 'hover:from-red-600 hover:to-red-700' : 'hover:from-gray-500 hover:to-gray-600',
      icon: stats.validationErrors > 0 ? '⚠️' : '✅',
      description: stats.validationErrors > 0 ? 'Issues found' : 'All data valid'
    }
  ];

  const features = [
    {
      title: 'Smart File Upload',
      description: 'Upload CSV/XLSX files with AI-powered header mapping and instant validation feedback.',
      icon: '📁',
      href: '/upload',
      color: 'blue',
      highlights: ['Drag & Drop', 'AI Header Mapping', 'Real-time Validation']
    },
    {
      title: 'Data Management',
      description: 'View and edit your data with inline editing, advanced search, filtering, and bulk operations.',
      icon: '📊',
      href: '/data',
      color: 'green',
      highlights: ['Inline Editing', 'Advanced Filters', 'Bulk Operations']
    },
    {
      title: 'Validation Engine',
      description: 'Comprehensive validation with 12+ rule types including circular dependency detection.',
      icon: '✅',
      href: '/upload',
      color: 'purple',
      highlights: ['12+ Validation Rules', 'Real-time Feedback', 'Error Suggestions']
    },
    {
      title: 'AI Natural Language Search',
      description: 'Search your data using natural language queries like "tasks with duration > 2 phases".',
      icon: '🤖',
      href: '/data/clients',
      color: 'orange',
      highlights: ['Natural Language', 'Smart Queries', 'Instant Results']
    },
    {
      title: 'Business Rules',
      description: 'Create and manage complex business rules for resource allocation and constraints.',
      icon: '⚙️',
      href: '/rules',
      color: 'indigo',
      highlights: ['Co-run Rules', 'Load Limits', 'Phase Windows']
    },
    {
      title: 'Data Export',
      description: 'Export validated data in multiple formats with custom configurations and packaging.',
      icon: '📤',
      href: '/export',
      color: 'teal',
      highlights: ['Multiple Formats', 'Custom Config', 'Bulk Export']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700',
      teal: 'bg-teal-600 hover:bg-teal-700'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    const iconMap: Record<string, string> = {
      upload: '📁',
      validation: '✅',
      edit: '✏️',
      ai_search: '🤖'
    };
    return iconMap[type] || '📁';
  };

  const getActivityColor = (status: RecentActivity['status']) => {
    const colorMap: Record<string, string> = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    return colorMap[status] || 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-3xl">🧪</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Data Alchemist
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform messy spreadsheets into clean, validated data with AI-powered insights and business rules for optimal resource allocation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="group block transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${stat.color} ${stat.hoverColor} rounded-xl p-6 text-white shadow-lg group-hover:shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold mb-1">
                      {stats.isLoading ? (
                        <span className="animate-pulse">--</span>
                      ) : (
                        stat.count.toLocaleString()
                      )}
                    </p>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs opacity-80 mt-1">{stat.description}</p>
                  </div>
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link
                  href={feature.href}
                  className={`inline-flex items-center px-6 py-3 ${getColorClasses(feature.color)} text-white rounded-lg font-medium transition-all duration-200 group-hover:shadow-lg`}
                >
                  Get Started
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* System Status & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🧠</span>
                  <div>
                    <p className="font-semibold text-gray-900">Validation Engine</p>
                    <p className="text-sm text-gray-600">12 validation rules active</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full font-medium">
                  Online
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  <div>
                    <p className="font-semibold text-gray-900">AI Search Engine</p>
                    <p className="text-sm text-gray-600">Natural language processing ready</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full font-medium">
                  Ready
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  <div>
                    <p className="font-semibold text-gray-900">Business Rules</p>
                    <p className="text-sm text-gray-600">Rule engine initialized</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-200 text-purple-800 text-sm rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-3 h-3 ${getActivityColor(activity.status)} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/upload"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span className="text-xl mr-2">🚀</span>
                Start Your Data Journey
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Data?</h3>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Follow these simple steps to get started with Data Alchemist
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Upload Your Files</h4>
              <p className="text-sm opacity-80">Start by uploading your CSV or XLSX files with client, worker, and task data</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Review & Validate</h4>
              <p className="text-sm opacity-80">Our AI will validate your data and suggest fixes for any issues found</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Manage & Export</h4>
              <p className="text-sm opacity-80">Edit your data, create business rules, and export clean, validated datasets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;