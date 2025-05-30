// app/api/chat/openai/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/* ── 0. clients ─────────────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

/* ── 1. POST /api/chat/openai ───────────────────────────────── */
export async function POST(req: Request) {
  const { question } = await req.json();          // { question: "..." }

  /* 2. top-K retrieval from Supabase */
  const { data: chunks, error } = await supabase.rpc('match_documents', {
    query_text: question,
    match_count: 8
  });
  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  /* 3. fuse chunks into one context string */
  const context = chunks.map((c: any) => c.content).join('\n---\n');

  /* 4. call GPT-4o and stream back */
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
You are Duub, a friendly inside guide to Dubai.
Use or quote the background below when helpful.
If unsure, ask follow-up questions.
Background:\n${context}`
      },
      { role: 'user', content: question }
    ]
  });

  return new NextResponse(stream as any, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
