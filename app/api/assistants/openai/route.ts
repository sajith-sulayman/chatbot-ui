// app/api/chat.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ─── 0. tiny helpers ─────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ─── 1. entrypoint ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { question } = await req.json();        // expects {question:"…"}

  /* 2. ask Supabase for the 8 most similar chunks */
  const { data: chunks, error } = await supabase.rpc('match_documents', {
    query_text: question,
    match_count: 8
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  /* 3. stitch those chunks into a “context” string  */
  const context = chunks.map((c: any) => c.content).join('\n---\n');

  /* 4. ask GPT-4o, streaming back to the client  */
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,                     // ≤-- important for Chatbot-UI console
    messages: [
      {
        role: 'system',
        content: `
You are Duub, an insider guide to Dubai.
Answer in an upbeat, concise style. Cite concrete places or laws when useful.
If the user asks something outside your knowledge, say you’re unsure.
Here is background you can use:\n${context}`
      },
      { role: 'user', content: question }
    ]
  });

  return new NextResponse(stream as any, {
    headers: { 'Content-Type': 'text/event-stream' }      // enables SSE
  });
}
