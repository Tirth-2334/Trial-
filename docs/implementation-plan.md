# SkillBridge AI MVP Implementation Plan (24-hour hackathon)

## 1) Bootstrap and environment (1 hour)
1. Create Next.js App Router project with Tailwind.
2. Install deps: `@supabase/supabase-js`, `recharts`.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `OPENAI_API_KEY`

## 2) Database and seed data (1–2 hours)
1. Run SQL in `supabase/schema.sql`.
2. Insert 1-2 demo tasks per domain.
3. Optionally insert one demo fresher and startup user.

## 3) Fresher flow MVP (4 hours)
1. Build `/fresher` page with:
   - challenge prompt
   - code/github input
   - explanation input
   - submit button + loading state
2. On submit, call `POST /api/evaluate`.
3. Render scores + radar chart + AI feedback.

## 4) AI evaluation API (3 hours)
1. Implement `app/api/evaluate/route.ts`.
2. Validate payload and sanitize text.
3. Call OpenAI chat completion with strict JSON prompt.
4. Parse safely with fallback extraction.
5. Save submission and score fields into Supabase.
6. Return structured JSON to client.

## 5) Startup flow MVP (3 hours)
1. Build `/startup` dashboard:
   - candidates table (sorted by overall score desc)
   - filter by domain
2. Candidate details section:
   - radar chart
   - AI feedback
   - github link
   - invite button updates status to `invited`

## 6) Polish and deploy (2 hours)
1. Add empty/loading/error states.
2. Validate env vars in API route.
3. Deploy to Vercel.
4. Set production env vars.

## Suggested execution order (fastest path)
1. SQL + seed task
2. API route
3. Fresher page + chart
4. Startup dashboard
5. deploy
