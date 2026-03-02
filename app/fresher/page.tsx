'use client';

import { useState } from 'react';
import ScoreRadarChart from '@/components/ScoreRadarChart';

export default function FresherPage() {
  const [submissionText, setSubmissionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000001',
          taskId: '00000000-0000-0000-0000-000000000010',
          domain: 'frontend',
          submissionText,
          explanation,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Evaluation failed');
      setResult(json.scores);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">SkillBridge AI — Fresher</h1>
      <div className="rounded-xl border bg-white p-4">
        <p className="mb-2 text-sm text-gray-600">Challenge: Build a responsive todo list with local storage support.</p>
        <textarea
          className="min-h-40 w-full rounded border p-3"
          placeholder="Paste code or GitHub summary"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
        />
        <textarea
          className="mt-3 min-h-24 w-full rounded border p-3"
          placeholder="Short explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading} className="mt-3 rounded bg-indigo-600 px-4 py-2 text-white">
          {loading ? 'Evaluating with AI...' : 'Submit'}
        </button>
      </div>

      {result && (
        <section className="space-y-3">
          <ScoreRadarChart scores={result} />
          <div className="rounded-xl border bg-white p-4">
            <p className="font-medium">Overall: {result.overall}/10</p>
            <p className="mt-2 text-sm text-gray-700">{result.feedback}</p>
          </div>
        </section>
      )}
    </main>
  );
}
