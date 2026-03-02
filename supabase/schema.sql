-- SkillBridge AI schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('fresher', 'startup')),
  domain text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  task_prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  submission_text text not null,
  github_link text,
  explanation text,
  problem_solving_score int not null check (problem_solving_score between 1 and 10),
  code_quality_score int not null check (code_quality_score between 1 and 10),
  scalability_score int not null check (scalability_score between 1 and 10),
  communication_score int not null check (communication_score between 1 and 10),
  overall_score numeric(4,2) not null,
  ai_feedback text not null,
  status text not null default 'submitted' check (status in ('submitted', 'invited')),
  created_at timestamptz not null default now()
);

create index if not exists idx_users_role_domain on public.users(role, domain);
create index if not exists idx_tasks_domain on public.tasks(domain);
create index if not exists idx_submissions_overall on public.submissions(overall_score desc);
create index if not exists idx_submissions_user on public.submissions(user_id);

-- Optional starter challenge
insert into public.tasks (domain, task_prompt)
values
('frontend', 'Build a responsive todo list with filter and local persistence.'),
('backend', 'Design and implement a rate-limited API endpoint for comments.')
on conflict do nothing;
