/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { column, value, message, row, dataset } = body;

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    const fix = await aiClient.fixDataError(column, value, message, row, dataset);
    return NextResponse.json({ fix });
  } catch (error) {
    console.error('AI fix error:', error);
    return NextResponse.json(
      { fix: null, error: 'AI suggestion failed' },
      { status: 500 }
    );
  }
}
