"use client";
import Link from 'next/link';
import { Upload, Database, Settings, Target, Download, Bot } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Data Alchemist</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/upload" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </Link>
            <Link href="/data" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Database className="w-4 h-4" />
              Data
            </Link>
            <Link href="/rules" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Settings className="w-4 h-4" />
              Rules
            </Link>
            <Link href="/priorities" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Target className="w-4 h-4" />
              Priorities
            </Link>
            <Link href="/export" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-ai-50 text-ai-700 rounded-full text-sm">
              <Bot className="w-4 h-4" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
