'use client';

import { useMemo, useState } from 'react';

type Candidate = {
  id: string;
  name: string;
  domain: string;
  overall: number;
  status: 'submitted' | 'invited';
};

const seed: Candidate[] = [
  { id: '1', name: 'Aarav', domain: 'frontend', overall: 8.8, status: 'submitted' },
  { id: '2', name: 'Meera', domain: 'backend', overall: 8.2, status: 'submitted' },
];

export default function StartupPage() {
  const [domain, setDomain] = useState('all');
  const [rows, setRows] = useState(seed);

  const filtered = useMemo(
    () => rows
      .filter((c) => domain === 'all' || c.domain === domain)
      .sort((a, b) => b.overall - a.overall),
    [domain, rows],
  );

  const invite = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'invited' } : r)));
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Startup Dashboard</h1>
      <select className="mb-4 rounded border px-3 py-2" value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option value="all">All domains</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
      </select>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Overall</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.domain}</td>
                <td className="px-4 py-3">{c.overall}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">
                  <button
                    className="rounded bg-emerald-600 px-3 py-1 text-white disabled:bg-gray-300"
                    disabled={c.status === 'invited'}
                    onClick={() => invite(c.id)}
                  >
                    Invite for Internship
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
