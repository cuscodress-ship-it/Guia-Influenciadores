-- ============================================================
-- Tabela de links de referência (vídeos externos de exemplo
-- pra ajudar as influenciadoras a se inspirarem).
-- Rode isso no SQL Editor do Supabase.
-- ============================================================

create table if not exists public.reference_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.reference_links enable row level security;

create policy "Qualquer pessoa vê as referências"
  on public.reference_links for select
  to public
  using (true);

create policy "Só admin gerencia referências"
  on public.reference_links for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
