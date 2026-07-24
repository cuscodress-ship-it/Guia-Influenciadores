// ============================================================
// Configuração do Supabase.
// Troque os dois valores abaixo pelos do SEU projeto:
// Painel do Supabase > Project Settings > API
//   - "Project URL"           -> SUPABASE_URL
//   - "anon public" API key   -> SUPABASE_ANON_KEY
// Essas duas informações são seguras para ficar no site (público),
// pois todo o controle de acesso real acontece nas políticas RLS
// definidas em supabase/schema.sql.
// ============================================================

export const SUPABASE_URL = "https://tatdliycwplyrkiusiyg.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_06u0YkFSuI0Vqwq-ThgLsA_qGiEKyX4";

export const isConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

