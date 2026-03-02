'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

type Props = {
  scores: {
    problemSolving: number;
    codeQuality: number;
    scalability: number;
    communication: number;
  };
};

export default function ScoreRadarChart({ scores }: Props) {
  const data = [
    { metric: 'Problem Solving', score: scores.problemSolving },
    { metric: 'Code Quality', score: scores.codeQuality },
    { metric: 'Scalability', score: scores.scalability },
    { metric: 'Communication', score: scores.communication },
  ];

  return (
    <div className="h-72 w-full rounded-xl border bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <Radar dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
