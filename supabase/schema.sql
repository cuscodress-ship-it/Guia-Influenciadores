-- ============================================================
-- Schema da plataforma "Guia para Influenciadoras"
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Painel do Supabase > SQL Editor > New query > colar > Run)
-- ============================================================

-- 1) PERFIS -----------------------------------------------------
-- Cada pessoa que se cadastra ganha uma linha aqui automaticamente
-- (veja o trigger no final do arquivo). "is_admin" é o que te dá
-- acesso ao painel /admin.html. "plan" é a base para, no futuro,
-- você liberar conteúdo pago (plan = 'pro').
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  is_admin boolean not null default false,
  plan text not null default 'free', -- 'free' ou 'pro'
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- 2) PASSOS DO GUIA ----------------------------------------------
-- Cada "step" é uma seção do guia, ex: "1. Comece aqui",
-- "2. Como gravar seus vídeos", "3. Referências de conteúdo".
create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.steps enable row level security;

create policy "Qualquer pessoa vê os passos"
  on public.steps for select
  to public
  using (true);

create policy "Só admin gerencia passos"
  on public.steps for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 3) VÍDEOS --------------------------------------------------------
-- "storage_path" é o caminho do arquivo dentro do bucket "videos".
-- "is_free" controla o que é gratuito agora e o que pode virar
-- conteúdo pago (plan = 'pro') no futuro, sem mudar nada no código.
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  step_id uuid references public.steps (id) on delete cascade,
  title text not null,
  description text,
  storage_path text not null,
  order_index integer not null default 0,
  is_free boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Qualquer pessoa vê os metadados dos vídeos"
  on public.videos for select
  to public
  using (true);

create policy "Só admin gerencia vídeos"
  on public.videos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 4) Cria o perfil automaticamente quando alguém se cadastra -------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5) STORAGE (armazenamento dos arquivos de vídeo) -----------------
-- Depois de rodar este script, vá em Storage > Create bucket:
--   nome: videos
--   Public: NÃO (deixe privado)
-- Depois volte aqui e rode a parte abaixo para liberar o acesso
-- correto (logados assistem, só admin envia/apaga).
-- ============================================================

create policy "Qualquer pessoa pode assistir (baixar) vídeos"
  on storage.objects for select
  to public
  using (bucket_id = 'videos');

create policy "Só admin envia vídeos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'videos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "Só admin apaga vídeos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'videos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 6) Depois de rodar tudo isso, transforme SEU usuário em admin.
-- Cadastre-se primeiro pelo site (cadastro.html) e então rode,
-- trocando pelo seu e-mail:
--
-- update public.profiles set is_admin = true where email = 'seu-email@exemplo.com';
-- ============================================================
