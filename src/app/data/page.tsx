"use client";
import React from 'react';
import Link from 'next/link';

export default function DataOverviewPage() {
  const dataEntities = [
    {
      title: 'Clients',
      count: 0,
      href: '/data/clients',
      color: 'bg-blue-500',
      icon: '👥',
      description: 'Manage client information and priorities',
      errorCount: 0
    },
    {
      title: 'Workers',
      count: 0,
      href: '/data/workers',
      color: 'bg-green-500',
      icon: '👷',
      description: 'Manage worker skills and availability',
      errorCount: 0
    },
    {
      title: 'Tasks',
      count: 0,
      href: '/data/tasks',
      color: 'bg-purple-500',
      icon: '📋',
      description: 'Manage task definitions and requirements',
      errorCount: 0
    }
  ];

  const totalRecords = 0;
  const totalErrors = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Management Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            View and manage all your data entities with real-time validation and AI-powered insights
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{totalErrors}</p>
                <p className="text-sm text-gray-600">Validation Errors</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {totalRecords > 0 ? Math.round(((totalRecords - totalErrors) / totalRecords) * 100) : 100}%
                </p>
                <p className="text-sm text-gray-600">Data Quality</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-sm text-gray-600">Data Types</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🗂️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Entities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {dataEntities.map((entity, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${entity.color} rounded-lg flex items-center justify-center mr-4`}>
                      <span className="text-2xl text-white">{entity.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{entity.title}</h3>
                      <p className="text-sm text-gray-600">{entity.count} records</p>
                    </div>
                  </div>
                  {entity.errorCount > 0 && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {entity.errorCount} errors
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-6">{entity.description}</p>
                
                <div className="space-y-3">
                  <Link
                    href={entity.href}
                    className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Manage {entity.title}
                  </Link>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Export
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Validate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/upload"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload New Data</p>
                <p className="text-sm text-gray-600">Import CSV/XLSX files</p>
              </div>
            </Link>

            <Link
              href="/export"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download validated data</p>
              </div>
            </Link>

            <Link
              href="/rules"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Business Rules</p>
                <p className="text-sm text-gray-600">Manage validation rules</p>
              </div>
            </Link>

            <Link
              href="/priorities"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Priorities</p>
                <p className="text-sm text-gray-600">Set data priorities</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Welcome to Digitalize Project</p>
                <p className="text-sm text-gray-600">Start by uploading your data files</p>
              </div>
              <span className="text-sm text-gray-500">Just now</span>
            </div>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">AI search index ready</p>
                <p className="text-sm text-blue-700">Natural language search available</p>
              </div>
              <span className="text-sm text-blue-500">2 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
