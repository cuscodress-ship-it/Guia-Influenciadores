-- ============================================================
-- MIGRAÇÃO: liberar leitura pública (sem login) do conteúdo.
--
-- O site não pede mais cadastro/login para os visitantes verem o
-- guia. Só o painel /admin.html continua exigindo login.
--
-- Rode este arquivo INTEIRO no SQL Editor do seu projeto Supabase
-- (Painel do Supabase > SQL Editor > New query > colar > Run).
-- Sem isso, a área de membros vai aparecer vazia para os
-- visitantes, porque as políticas antigas só liberavam leitura
-- para quem estivesse logado.
-- ============================================================

-- PASSOS
drop policy if exists "Qualquer logado vê os passos" on public.steps;
drop policy if exists "Qualquer pessoa vê os passos" on public.steps;
create policy "Qualquer pessoa vê os passos"
  on public.steps for select
  to public
  using (true);

-- VÍDEOS (metadados)
drop policy if exists "Qualquer logado vê os metadados dos vídeos" on public.videos;
drop policy if exists "Qualquer pessoa vê os metadados dos vídeos" on public.videos;
create policy "Qualquer pessoa vê os metadados dos vídeos"
  on public.videos for select
  to public
  using (true);

-- REFERÊNCIAS
drop policy if exists "Qualquer logado vê as referências" on public.reference_links;
drop policy if exists "Qualquer pessoa vê as referências" on public.reference_links;
create policy "Qualquer pessoa vê as referências"
  on public.reference_links for select
  to public
  using (true);

-- ARQUIVOS DE VÍDEO NO STORAGE (bucket "videos")
drop policy if exists "Logados podem assistir (baixar) vídeos" on storage.objects;
drop policy if exists "Qualquer pessoa pode assistir (baixar) vídeos" on storage.objects;
create policy "Qualquer pessoa pode assistir (baixar) vídeos"
  on storage.objects for select
  to public
  using (bucket_id = 'videos');

-- As políticas de ADMIN (criar/editar/apagar passos, vídeos e
-- referências) continuam exigindo login de administrador — não
-- mexemos nelas.
