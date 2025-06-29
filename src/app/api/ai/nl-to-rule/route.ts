import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    const rule = await aiClient.convertToRule(prompt);
    return NextResponse.json({ rule });
  } catch (err) {
    console.error('AI rule conversion failed:', err);
    return NextResponse.json(
      { error: 'Could not parse rule' },
      { status: 400 }
    );
  }
}
