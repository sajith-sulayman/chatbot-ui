import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export default async function handler(req, res) {
  const userQuestion = req.body.question;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,
                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // ① find top 8 relevant chunks
  const { data } = await supabase.rpc('match_documents', {
      query_text: userQuestion, match_count: 8
  });

  // ② send chunks as context
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await openai.responses.stream({
    model: 'gpt-4o',
    input: userQuestion,
    retrieval_context: data.map(d => d.content).join('\n')
  });

  // ③ stream back to UI
  stream.pipe(res);
}
