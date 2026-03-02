import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

type EvaluatePayload = {
  userId: string;
  taskId: string;
  submissionText: string;
  explanation?: string;
  githubLink?: string;
  domain?: string;
};

type ScoreResult = {
  problemSolving: number;
  codeQuality: number;
  scalability: number;
  communication: number;
  overall: number;
  feedback: string;
};

const SYSTEM_PROMPT = `You are an expert technical evaluator for internship candidates.
Return ONLY valid minified JSON with this exact schema:
{
  "problemSolving": 1-10 number,
  "codeQuality": 1-10 number,
  "scalability": 1-10 number,
  "communication": 1-10 number,
  "overall": 1-10 number,
  "feedback": "short actionable feedback"
}
No markdown. No extra keys. No prose outside JSON.`;

const clampScore = (value: unknown) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 1;
  return Math.min(10, Math.max(1, Number(n.toFixed(2))));
};

const safeJsonParse = (raw: string): ScoreResult | null => {
  try {
    const parsed = JSON.parse(raw);
    return {
      problemSolving: clampScore(parsed.problemSolving),
      codeQuality: clampScore(parsed.codeQuality),
      scalability: clampScore(parsed.scalability),
      communication: clampScore(parsed.communication),
      overall: clampScore(parsed.overall),
      feedback: String(parsed.feedback ?? 'Solid effort. Improve architecture clarity and test coverage.'),
    };
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      return {
        problemSolving: clampScore(parsed.problemSolving),
        codeQuality: clampScore(parsed.codeQuality),
        scalability: clampScore(parsed.scalability),
        communication: clampScore(parsed.communication),
        overall: clampScore(parsed.overall),
        feedback: String(parsed.feedback ?? 'Solid effort. Improve architecture clarity and test coverage.'),
      };
    } catch {
      return null;
    }
  }
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = (await req.json()) as EvaluatePayload;
    if (!body?.userId || !body?.taskId || !body?.submissionText) {
      return NextResponse.json({ error: 'userId, taskId, and submissionText are required' }, { status: 400 });
    }

    const userPrompt = `Domain: ${body.domain ?? 'general'}\nSubmission:\n${body.submissionText}\n\nExplanation:\n${body.explanation ?? ''}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json({ error: 'OpenAI API error', details: errText }, { status: 502 });
    }

    const completion = await aiResponse.json();
    const rawContent = completion?.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 502 });
    }

    const parsed = safeJsonParse(rawContent);
    if (!parsed) {
      return NextResponse.json({ error: 'Could not parse AI JSON response' }, { status: 502 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id: body.userId,
        task_id: body.taskId,
        submission_text: body.submissionText,
        explanation: body.explanation ?? null,
        github_link: body.githubLink ?? null,
        problem_solving_score: parsed.problemSolving,
        code_quality_score: parsed.codeQuality,
        scalability_score: parsed.scalability,
        communication_score: parsed.communication,
        overall_score: parsed.overall,
        ai_feedback: parsed.feedback,
        status: 'submitted',
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save submission', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissionId: data.id, scores: parsed });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
