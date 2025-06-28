import { NextRequest, NextResponse } from 'next/server';
import { ValidationError, ValidationErrorType } from '@/types';

export async function POST(req: NextRequest) {
  const { error }: { error: ValidationError } = await req.json();

  // Use OpenAI API (server-side)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const getSuggestionPrompt = (error: ValidationError) => {
    const basePrompt = `You are an expert data validation assistant. Given a validation error, provide a clear, actionable suggestion to fix it. Keep your response concise and practical.

Error Details:
- Type: ${error.type}
- Severity: ${error.severity}
- Entity: ${error.entityType}
- Field: ${error.field || 'N/A'}
- Message: ${error.message}

Provide a specific suggestion to fix this error. Focus on practical steps the user can take.`;

    switch (error.type) {
      case ValidationErrorType.MISSING_REQUIRED:
        return `${basePrompt}\n\nThis is a missing required field error. Suggest what value should be added.`;
      
      case ValidationErrorType.DUPLICATE_ID:
        return `${basePrompt}\n\nThis is a duplicate ID error. Suggest how to make the ID unique.`;
      
      case ValidationErrorType.MALFORMED_LIST:
        return `${basePrompt}\n\nThis is a malformed list error. Suggest the correct format for the list.`;
      
      case ValidationErrorType.OUT_OF_RANGE:
        return `${basePrompt}\n\nThis is an out-of-range error. Suggest a valid value within the acceptable range.`;
      
      case ValidationErrorType.BROKEN_JSON:
        return `${basePrompt}\n\nThis is a broken JSON error. Suggest the correct JSON format.`;
      
      case ValidationErrorType.UNKNOWN_REFERENCE:
        return `${basePrompt}\n\nThis is an unknown reference error. Suggest a valid reference or how to create the missing entity.`;
      
      default:
        return basePrompt;
    }
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful data validation assistant. Provide clear, actionable suggestions to fix validation errors. Keep responses concise and practical.' 
          },
          { 
            role: 'user', 
            content: getSuggestionPrompt(error)
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim();
    
    if (!suggestion) {
      return NextResponse.json({ error: 'No suggestion generated.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });
  } catch (e) {
    console.error('OpenAI API error:', e);
    return NextResponse.json({ error: 'Failed to generate suggestion.' }, { status: 500 });
  }
} 