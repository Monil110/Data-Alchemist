"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Filter } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { searchWithNaturalLanguage, SearchResult } from '@/utils/nlpSearch';

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function NaturalLanguageSearch({ onSearch, placeholder }: NaturalLanguageSearchProps) {
  const { state } = useData();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const results = await searchWithNaturalLanguage(
      query,
      state.clients,
      state.workers,
      state.tasks
    );
    
    setSearchResults(results);
    setIsSearching(false);

    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      return newHistory;
    });
  };

  const getEntityData = (result: SearchResult) => {
    switch (result.entity) {
      case 'clients':
        return state.clients.find(c => c.ClientID === result.id);
      case 'workers':
        return state.workers.find(w => w.WorkerID === result.id);
      case 'tasks':
        return state.tasks.find(t => t.TaskID === result.id);
      default:
        return null;
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
  };

  const exampleQueries = [
    "All tasks having a Duration of more than 1 phase and having phase 2 in their Preferred Phases list",
    "Workers with programming skills in San Francisco",
    "High priority tasks requiring JavaScript skills",
    "Clients requesting web development tasks",
    "Tasks with duration less than 3 hours"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Natural Language Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={placeholder || "Search using natural language..."}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="flex-1"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            className="px-6"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {searchHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyQuery, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => handleHistoryClick(historyQuery)}
                >
                  {historyQuery}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>Examples:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>&quot;Show clients with priority 5&quot;</li>
            <li>&quot;Workers with skill &apos;JavaScript&apos;&quot;</li>
            <li>&quot;Tasks longer than 3 hours&quot;</li>
            <li>&quot;High priority tasks for client C1&quot;</li>
          </ul>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Search Results</h3>
              <Badge variant="secondary">{searchResults.length} found</Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => {
                const data = getEntityData(result);
                if (!data) return null;

                return (
                  <div key={`${result.entity}-${result.id}-${index}`} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={result.entity === 'tasks' ? 'default' : result.entity === 'workers' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {result.entity.slice(0, -1)}
                          </Badge>
                          <span className="font-medium text-sm">
                            {(data as any).ClientName || (data as any).WorkerName || (data as any).TaskName || result.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          ID: {result.id}
                        </p>
                        <p className="text-sm">{result.match}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Match Score
                        </div>
                        <div className="text-sm font-medium">
                          {Math.round(result.score)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searchResults.length === 0 && query && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No results found for "{query}"</p>
            <p className="text-xs mt-1">Try a different search term or check the examples above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
