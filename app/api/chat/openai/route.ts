// app/api/chat/openai/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Instantiate Supabase with the SERVICE_ROLE key (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Instantiate OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

/**
 * POST /api/chat/openai
 * RAG-enabled streaming chat endpoint for Duub.ai
 */
export async function POST(req: Request) {
  // 1. Parse incoming user question
  const { question } = await req.json();

  // 2. Top-K retrieval from Supabase Vector store
  const { data: chunks, error } = await supabase.rpc('match_documents', {
    query_text: question,
    match_count: 8
  });
  if (error) {
    console.error('Supabase RAG error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  // 3. Fuse retrieved chunks into a single context block
  const context = (chunks || []).map((c: any) => c.content).join('\n---\n');

  // 4. Call OpenAI Chat with streaming response
  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `
You are Duub, a friendly inside guide to Dubai.
Use or quote the background below when helpful.
Always be warm and concise, use bullet lists where appropriate,
and cite sources from the background if you reference them.
If unsure, ask follow-up questions.
Background:
${context}`
      },
      { role: 'user', content: question }
    ]
  });

  // 5. Return the SSE stream
  return new NextResponse(stream as any, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
