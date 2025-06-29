import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/types';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const { error }: { error: ValidationError } = await req.json();

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    const suggestion = await aiClient.generateErrorFix(error);
    
    if (!suggestion) {
      return NextResponse.json({ error: 'No suggestion generated.' }, { status: 500 });
    }

    return NextResponse.json({ suggestion });
  } catch (e) {
    console.error('AI suggestion error:', e);
    return NextResponse.json({ error: 'Failed to generate suggestion.' }, { status: 500 });
  }
} 