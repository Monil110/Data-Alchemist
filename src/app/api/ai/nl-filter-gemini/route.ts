import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const { prompt, entity } = await req.json();

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    const filterCode = await aiClient.generateNLFilter(prompt, entity);
    return NextResponse.json({ filterCode });
  } catch (error: any) {
    console.error('[AI NL filter error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
