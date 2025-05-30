// app/api/chat/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // preserve the full origin (https://duub.ai)
  const origin = new URL(req.url).origin;

  // forward the incoming JSON body to /api/chat/openai
  const res = await fetch(`${origin}/api/chat/openai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  });

  // stream the response back as text/event-stream
  return new NextResponse(res.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
