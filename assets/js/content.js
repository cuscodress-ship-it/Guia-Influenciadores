import { supabase, isConfigured } from "./supabaseClient.js";

// ============================================================
// Camada de dados do guia (passos + vídeos).
// Quando o Supabase está configurado, tudo vem do banco real.
// Quando não está, usamos dados de exemplo salvos no localStorage
// (modo demonstração), só para você testar o site antes de configurar.
// ============================================================

const SEED_STEPS = [
  { id: "s1", title: "Comece aqui", description: "O básico antes de gravar qualquer coisa.", order_index: 1 },
  { id: "s2", title: "Como gravar", description: "Luz, enquadramento e áudio usando só o celular.", order_index: 2 },
  { id: "s3", title: "Roteiro e edição", description: "Como prender a atenção nos primeiros segundos.", order_index: 3 },
];

const SEED_VIDEOS = [
  { id: "v1", step_id: "s1", title: "Bem-vinda ao guia", description: "Como usar essa área de membros.", storage_path: "assets/video/intro.mp4", order_index: 1, is_free: true },
  { id: "v2", step_id: "s2", title: "Iluminação básica", description: "Aproveitando luz natural em casa.", storage_path: "assets/video/intro.mp4", order_index: 1, is_free: true },
  { id: "v3", step_id: "s2", title: "Enquadramento", description: "Regras simples de composição vertical.", storage_path: "assets/video/intro.mp4", order_index: 2, is_free: true },
  { id: "v4", step_id: "s3", title: "Gancho nos 3s iniciais", description: "Conteúdo avançado.", storage_path: "assets/video/intro.mp4", order_index: 1, is_free: false },
];

function seedIfEmpty() {
  if (!localStorage.getItem("mock_steps")) {
    localStorage.setItem("mock_steps", JSON.stringify(SEED_STEPS));
  }
  if (!localStorage.getItem("mock_videos")) {
    localStorage.setItem("mock_videos", JSON.stringify(SEED_VIDEOS));
  }
}

function readMock(key) {
  seedIfEmpty();
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function writeMock(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function listSteps() {
  if (!isConfigured) {
    return readMock("mock_steps").sort((a, b) => a.order_index - b.order_index);
  }
  const { data, error } = await supabase.from("steps").select("*").order("order_index");
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function listVideosByStep(stepId) {
  if (!isConfigured) {
    return readMock("mock_videos")
      .filter((v) => v.step_id === stepId)
      .sort((a, b) => a.order_index - b.order_index);
  }
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("step_id", stepId)
    .order("order_index");
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getVideo(id) {
  if (!isConfigured) {
    return readMock("mock_videos").find((v) => v.id === id) || null;
  }
  const { data, error } = await supabase.from("videos").select("*").eq("id", id).single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

// Gera a URL para tocar o vídeo. No Supabase real, o bucket é
// privado, então geramos uma URL assinada e temporária.
export async function getVideoUrl(storagePath) {
  if (!isConfigured) return storagePath;
  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) {
    console.error(error);
    return null;
  }
  return data.signedUrl;
}

// ---------- Funções usadas só pelo painel admin ----------

export async function addStep({ title, description, order_index }) {
  if (!isConfigured) {
    const steps = readMock("mock_steps");
    const step = { id: "s_" + Date.now(), title, description, order_index };
    steps.push(step);
    writeMock("mock_steps", steps);
    return step;
  }
  const { data, error } = await supabase
    .from("steps")
    .insert({ title, description, order_index })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addVideo({ step_id, title, description, storage_path, order_index, is_free }) {
  if (!isConfigured) {
    const videos = readMock("mock_videos");
    const video = { id: "v_" + Date.now(), step_id, title, description, storage_path, order_index, is_free };
    videos.push(video);
    writeMock("mock_videos", videos);
    return video;
  }
  const { data, error } = await supabase
    .from("videos")
    .insert({ step_id, title, description, storage_path, order_index, is_free })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Envia o arquivo de vídeo para o Storage e devolve o "storage_path"
// que deve ser salvo em videos.storage_path.
// No modo demonstração não há upload real: apenas simulamos o caminho
// (o arquivo não fica salvo — configure o Supabase para uploads de verdade).
export async function uploadVideoFile(file) {
  const path = `${Date.now()}-${file.name}`.replace(/\s+/g, "-");
  if (!isConfigured) {
    return path;
  }
  const { error } = await supabase.storage.from("videos").upload(path, file);
  if (error) throw error;
  return path;
}
