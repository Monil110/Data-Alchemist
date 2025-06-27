import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { query, entity } = await req.json();

  // Use OpenAI API (server-side)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const prompt = `You are an assistant for a scheduling app. Given a user query in plain English, generate a JavaScript filter function (as a string) that takes a row object for a ${entity} and returns true if it matches. Only output the function body, not the function keyword. Query: "${query}"`;

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
          { role: 'system', content: 'You generate JavaScript filter function bodies for data filtering.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    });
    const data = await response.json();
    const code = data.choices?.[0]?.message?.content?.trim();
    if (!code) {
      return NextResponse.json({ error: 'No code generated.' }, { status: 500 });
    }
    return NextResponse.json({ filterBody: code });
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI request failed.' }, { status: 500 });
  }
}
