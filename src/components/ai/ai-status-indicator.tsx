"use client";
import React from 'react';

interface AIStatusIndicatorProps {
  status?: 'idle' | 'loading' | 'processing' | 'error' | 'success';
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  status = 'idle',
  message,
  showIcon = true,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: '🤖',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: message || 'AI is thinking...',
        };
      case 'processing':
        return {
          icon: '⚡',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: message || 'AI is processing...',
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: message || 'AI encountered an error',
        };
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: message || 'AI completed successfully',
        };
      default:
        return {
          icon: '🤖',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: message || 'AI ready',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      {showIcon && (
        <span className="text-lg">{config.icon}</span>
      )}
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      {status === 'loading' && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
    </div>
  );
};

export default AIStatusIndicator;
