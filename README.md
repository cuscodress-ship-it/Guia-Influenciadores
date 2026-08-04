# Guia para Influenciadoras — Plataforma de Conteúdo

Esta é uma plataforma web mobile-first voltada para a distribuição de conteúdo e vídeos no formato vertical 9:16 (reels, TikToks e shorts), auxiliando influenciadoras a crescerem suas redes sociais.

O conteúdo (index, área de membros, vídeos, referências) é aberto, sem exigir cadastro/login. Só o painel `/admin.html` continua protegido por login — a plataforma usa o **Supabase** para essa autenticação de administrador e para armazenar passos, vídeos e referências.

---

## 🚀 Como Visualizar Imediatamente (Modo Demo)

Para que você possa interagir e testar a plataforma imediatamente, ela possui um **Modo de Demonstração (Mock Mode)** automático.
* Se as credenciais do Supabase em `assets/js/supabaseClient.js` estiverem vazias ou contiverem o texto padrão (`COLE_AQUI_...`), **a plataforma funcionará 100% de forma local e fictícia**.
* Nesse modo, dados fictícios de passos e vídeos serão gerados automaticamente no seu navegador.
* Qualquer cadastro ou login realizado será simulado no navegador (salvo no `localStorage`).
* Você também terá acesso ao painel do administrador (`/admin.html`), onde poderá adicionar ou excluir passos e vídeos simulados e ver o resultado imediato na área de membros.

---

## 🛠️ Estrutura do Projeto

* `index.html`: Landing page e apresentação da plataforma (acesso livre).
* `cadastro.html` / `entrar.html`: Cadastro e login — usados só para criar/acessar a conta de administrador.
* `area-de-membros.html`: Dashboard com os passos e fileiras de vídeos (acesso livre).
* `video.html`: Player imersivo em 9:16 para reprodução dos vídeos verticais.
* `admin.html`: Painel para gerenciamento de passos e vídeos (inserção e exclusão).
* `assets/`
  * `css/style.css`: Estilo CSS mobile-first e temas claro/escuro.
  * `js/supabaseClient.js`: Configuração do cliente Supabase.
  * `js/auth.js`: Utilitários de autenticação e proteção de rotas.
* `supabase/`
  * `schema.sql`: Script SQL contendo a estrutura de tabelas, triggers e políticas RLS.

---

## 🔗 Integração com o Supabase (Produção)

Quando decidir conectar a plataforma ao seu banco de dados real do Supabase:

1. **Rode o SQL**: Copie o conteúdo de [supabase/schema.sql](file:///c:/Users/julia/Desktop/manual%20de%20rede%20social/supabase/schema.sql) e execute no SQL Editor do seu painel do Supabase.
   * Se o projeto Supabase já existia antes da remoção do login público, rode também [supabase/migration_remove_login.sql](file:///c:/Users/julia/Desktop/manual%20de%20rede%20social/supabase/migration_remove_login.sql) para liberar a leitura do conteúdo sem exigir login.
2. **Crie o Bucket de Storage**:
   * No painel do Supabase, vai em **Storage** e clique em **Create a new bucket**.
   * Nomeie o bucket como `videos`.
   * Deixe a opção **Public** desmarcada (privado).
3. **Configure as Chaves**:
   * No painel do Supabase, vai em **Project Settings** > **API**.
   * Copie a **Project URL** e a **anon public API key**.
   * Abra o arquivo [assets/js/supabaseClient.js](file:///c:/Users/julia/Desktop/manual%20de%20rede%20social/assets/js/supabaseClient.js).
   * Substitua os placeholders correspondentes pelas suas chaves:
     ```javascript
     export const SUPABASE_URL = "SUA_URL_DO_SUPABASE";
     export const SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_DO_SUPABASE";
     ```
4. **Tornar seu usuário Admin**:
   * Cadastre-se na plataforma pelo formulário do site (`cadastro.html`).
   * No painel SQL do Supabase, execute o comando para dar privilégios de administrador:
     ```sql
     update public.profiles set is_admin = true where email = 'seu-email-cadastrado@exemplo.com';
     ```
5. **Pronto!** O site passará a puxar os dados reais e autenticar de verdade no seu projeto Supabase.
