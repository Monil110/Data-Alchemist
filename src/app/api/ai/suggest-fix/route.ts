import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { error, entity, row } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const prompt = `You are an expert data cleaning assistant. Given the following validation error for a ${entity} row, suggest a concrete fix in plain English.\n\nError: ${error.type} - ${error.message}\nRow: ${JSON.stringify(row)}\n\nRespond with a clear, actionable suggestion for the user to resolve this error.`;

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
          { role: 'system', content: 'You are an expert data cleaning assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    });
    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim();
    if (!suggestion) {
      return NextResponse.json({ error: 'No suggestion generated.' }, { status: 500 });
    }
    return NextResponse.json({ suggestion });
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI request failed.' }, { status: 500 });
  }
} 