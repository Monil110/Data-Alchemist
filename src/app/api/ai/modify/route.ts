import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { command, entity } = await req.json();

  // Use OpenAI API (server-side)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const prompt = `You are an assistant for a scheduling app. Given a user command in plain English, generate a JavaScript function body (as a string) that takes an array of ${entity} rows and mutates them in-place according to the command. Only output the function body, not the function keyword. Command: "${command}"`;

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
          { role: 'system', content: 'You generate JavaScript function bodies for mutating arrays of data.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0,
      }),
    });
    const data = await response.json();
    const code = data.choices?.[0]?.message?.content?.trim();
    if (!code) {
      return NextResponse.json({ error: 'No code generated.' }, { status: 500 });
    }
    return NextResponse.json({ mutateBody: code });
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI request failed.' }, { status: 500 });
  }
} 