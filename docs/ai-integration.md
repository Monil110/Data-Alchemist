# AI Integration with Google Gemini

This project uses Google's Gemini AI for various intelligent features including data validation, natural language search, and business rule generation.

## Setup

1. **Environment Variables**
   Create a `.env.local` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Installation**
   The required package is already installed:
   ```bash
   npm install @google/generative-ai
   ```

## AI Features

### 1. Data Validation & Error Fixing
- **Endpoint**: `/api/ai/suggest-fix`
- **Component**: `AIErrorFix`
- **Functionality**: Provides AI-powered suggestions to fix data validation errors

### 2. Natural Language Search
- **Endpoint**: `/api/ai/search`
- **Component**: `NaturalLanguageSearch`
- **Functionality**: Converts natural language queries into JavaScript filter functions

### 3. Natural Language Data Modification
- **Endpoint**: `/api/ai/modify`
- **Component**: `NaturalLanguageModifier`
- **Functionality**: Converts natural language commands into JavaScript mutation functions

### 4. Business Rule Recommendations
- **Endpoint**: `/api/ai/recommendations`
- **Component**: `AIRecommendations`
- **Functionality**: Analyzes data and suggests business rules

### 5. Natural Language to Business Rules
- **Endpoint**: `/api/ai/nl-to-rule`
- **Functionality**: Converts natural language descriptions into structured business rules

### 6. Natural Language Filtering
- **Endpoint**: `/api/ai/nl-filter-gemini`
- **Functionality**: Generates JavaScript filter expressions from natural language

### 7. AI-Powered Error Fixing
- **Endpoint**: `/api/ai/ai-fix-error`
- **Functionality**: Suggests corrections for data errors based on context

## Architecture

### AI Client (`src/lib/ai/ai-client.ts`)
Centralized AI client that handles all Gemini API interactions:

```typescript
import { aiClient } from '@/lib/ai/ai-client';

// Generate error fix suggestions
const suggestion = await aiClient.generateErrorFix(error);

// Generate filter code from natural language
const filterCode = await aiClient.generateFilterCode(query, entity);

// Convert natural language to business rules
const rule = await aiClient.convertToRule(prompt);
```

### API Routes
All AI endpoints are located in `src/app/api/ai/` and use the centralized AI client for consistency.

## Usage Examples

### Error Fixing
```typescript
const response = await fetch('/api/ai/suggest-fix', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    error: {
      id: 'error-1',
      type: 'VALIDATION_ERROR',
      severity: 'ERROR',
      entityType: 'CLIENT',
      field: 'ClientName',
      message: 'Client name is required',
      value: null
    }
  })
});
```

### Natural Language Search
```typescript
const response = await fetch('/api/ai/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Find all high priority clients',
    entity: 'clients'
  })
});
```

### Business Rule Generation
```typescript
const response = await fetch('/api/ai/nl-to-rule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Tasks TASK001 and TASK002 must run together'
  })
});
```

## Error Handling

All AI endpoints include proper error handling:
- API key validation
- Rate limiting considerations
- Graceful fallbacks when AI suggestions fail
- Detailed error logging

## Performance Considerations

- AI responses are cached where appropriate
- Batch processing for multiple errors
- Rate limiting to avoid API quota issues
- Fallback to local search when AI is unavailable

## Security

- API keys are stored server-side only
- Input validation on all AI endpoints
- Sanitization of AI responses before use
- No sensitive data sent to AI APIs

## Troubleshooting

### Common Issues

1. **"Gemini API key not set"**
   - Ensure `GEMINI_API_KEY` is set in `.env.local`
   - Restart the development server after adding the key

2. **"AI suggestion failed"**
   - Check API key validity
   - Verify internet connection
   - Check Gemini API quota

3. **Import errors**
   - Ensure `@google/generative-ai` is installed
   - Check TypeScript path mappings in `tsconfig.json`

### Debug Mode
Enable debug logging by setting:
```
DEBUG_AI=true
```

This will log all AI requests and responses to the console. 