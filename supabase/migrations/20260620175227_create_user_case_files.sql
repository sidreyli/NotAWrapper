create table public.user_case_files (
  user_id text primary key,
  schema_version smallint not null default 1
    constraint user_case_files_schema_version_positive check (schema_version > 0),
  payload jsonb not null default '{}'::jsonb
    constraint user_case_files_payload_object check (jsonb_typeof(payload) = 'object')
    constraint user_case_files_payload_size check (octet_length(payload::text) <= 1048576),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_case_files is
  'Opt-in structured Aid Compass case files. Raw uploaded documents are never stored.';

alter table public.user_case_files enable row level security;

revoke all on table public.user_case_files from anon;
grant select, insert, update, delete on table public.user_case_files to authenticated;

create policy "Users can read their own case file"
on public.user_case_files
for select
to authenticated
using ((select auth.jwt()->>'sub') = user_id);

create policy "Users can create their own case file"
on public.user_case_files
for insert
to authenticated
with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users can update their own case file"
on public.user_case_files
for update
to authenticated
using ((select auth.jwt()->>'sub') = user_id)
with check ((select auth.jwt()->>'sub') = user_id);

create policy "Users can delete their own case file"
on public.user_case_files
for delete
to authenticated
using ((select auth.jwt()->>'sub') = user_id);
