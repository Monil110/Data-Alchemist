import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const { command, entity } = await req.json();

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    const code = await aiClient.generateMutationCode(command, entity);
    
    if (!code) {
      return NextResponse.json({ error: 'No code generated.' }, { status: 500 });
    }
    return NextResponse.json({ mutateBody: code });
  } catch (e) {
    console.error('AI modify error:', e);
    return NextResponse.json({ error: 'Gemini request failed.' }, { status: 500 });
  }
} 