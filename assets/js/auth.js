import { supabase, isConfigured } from "./supabaseClient.js";

// Mostra um aviso no topo da página se as chaves do Supabase
// ainda não foram configuradas em supabaseClient.js.
export function warnIfNotConfigured() {
  if (isConfigured) return;
  const bar = document.createElement("div");
  bar.textContent =
    "⚠️ Configure o Supabase em assets/js/supabaseClient.js para o site funcionar (veja o README.md).";
  bar.style.cssText =
    "background:#e64980;color:#fff;font-size:13px;padding:10px 16px;text-align:center;position:sticky;top:0;z-index:999;";
  document.body.prepend(bar);
}

function getMockUser() {
  const raw = localStorage.getItem("mock_session_user");
  return raw ? JSON.parse(raw) : null;
}

// Retorna a sessão atual (ou null) sem redirecionar.
export async function getSession() {
  if (!isConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

// Busca o perfil (nome, is_admin, plan) do usuário logado.
export async function getProfile() {
  if (!isConfigured || !supabase) {
    const mockUser = localStorage.getItem("mock_session_user");
    return mockUser ? JSON.parse(mockUser) : null;
  }
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error) {
    console.error("Erro ao buscar perfil:", error.message);
    return null;
  }
  return data;
}

// Usa no topo de páginas que exigem login (área de membros, vídeo).
// Redireciona para entrar.html se não houver sessão.
export async function requireAuth() {
  if (!isConfigured || !supabase) {
    const mockUser = localStorage.getItem("mock_session_user");
    if (!mockUser) {
      window.location.href = "entrar.html";
      return null;
    }
    return JSON.parse(mockUser);
  }
  const session = await getSession();
  if (!session) {
    window.location.href = "entrar.html";
    return null;
  }
  return session;
}

// Usa no topo de admin.html. Redireciona quem não é admin.
export async function requireAdmin() {
  if (!isConfigured || !supabase) {
    const mockUser = localStorage.getItem("mock_session_user");
    if (!mockUser) {
      window.location.href = "entrar.html";
      return null;
    }
    const profile = JSON.parse(mockUser);
    if (!profile || !profile.is_admin) {
      window.location.href = "area-de-membros.html";
      return null;
    }
    return profile;
  }
  const session = await requireAuth();
  if (!session) return null;
  const profile = await getProfile();
  if (!profile || !profile.is_admin) {
    window.location.href = "area-de-membros.html";
    return null;
  }
  return profile;
}

export async function signOut() {
  if (isConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem("mock_session_user");
  }
  window.location.href = "index.html";
}
