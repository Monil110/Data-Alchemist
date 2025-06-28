"use client";
import React, { useState } from 'react';

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({ onSearch, placeholder }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder || "Ask a question or filter in plain English..."}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
};
