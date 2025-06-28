"use client";
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Data Alchemist</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              AI-powered data management platform for resource allocation, validation, and business rule configuration.
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://github.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link href="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">File Upload</Link></li>
              <li><Link href="/data" className="text-gray-600 hover:text-blue-600 transition-colors">Data Validation</Link></li>
              <li><Link href="/rules" className="text-gray-600 hover:text-blue-600 transition-colors">Business Rules</Link></li>
              <li><Link href="/export" className="text-gray-600 hover:text-blue-600 transition-colors">Data Export</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="text-gray-600 hover:text-blue-600 transition-colors">API Reference</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 Data Alchemist. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
