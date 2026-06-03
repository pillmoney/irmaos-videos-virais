import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// MOCK DATABASE BACKEND (LOCAL STORAGE / MEMORY)
// ==========================================

const IS_SERVER = typeof window === 'undefined';

const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (IS_SERVER) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key', key, error);
    return defaultValue;
  }
};

const setLocalStorageItem = (key: string, value: any) => {
  if (IS_SERVER) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key', key, error);
  }
};

// Initial demo data if empty
const DEMO_PROJECTS = [
  {
    id: 'p1',
    nome: 'Reação: Placas Solares no Granizo',
    status: 'aguardando_aprovacao',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'p2',
    nome: 'Review Obra: Fundação Sem Ferragem',
    status: 'publicado',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const DEMO_VIDEOS_FONTE = [
  {
    id: 'v1',
    projeto_id: 'p1',
    url: 'https://www.youtube.com/watch?v=demo1',
    plataforma: 'youtube',
    duracao: 45,
    transcricao_json: { text: "Olha só o tamanho desse granizo caindo em cima das placas solares. Muita gente acha que quebra na hora, mas essas placas são feitas de vidro temperado de alta resistência..." },
    status: 'concluido',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'v2',
    projeto_id: 'p2',
    url: 'https://www.youtube.com/watch?v=demo2',
    plataforma: 'youtube',
    duracao: 30,
    transcricao_json: { text: "Fui ver a obra do vizinho e olha a fundação que ele está fazendo. Sem ferro nenhum, só concreto e pedra. Isso aqui vai dar uma dor de cabeça enorme no futuro..." },
    status: 'concluido',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const DEMO_TRECHOS = [
  {
    id: 't1',
    video_fonte_id: 'v1',
    inicio_ms: 0,
    fim_ms: 15000,
    score_viral: 9.2,
    motivo: 'Forte gancho visual com o granizo atingindo as placas com impacto alto.',
    transcricao: 'Olha só o tamanho desse granizo caindo em cima das placas solares.',
    aprovado: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 't2',
    video_fonte_id: 'v2',
    inicio_ms: 5000,
    fim_ms: 20000,
    score_viral: 8.8,
    motivo: 'Alerta sobre erro grave na estrutura da fundação que engaja construtores e leigos.',
    transcricao: 'Fui ver a obra do vizinho e olha a fundação que ele está fazendo. Sem ferro nenhum.',
    aprovado: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

const DEMO_ROTEIROS = [
  {
    id: 'r1',
    trecho_id: 't1',
    tema: 'Resistência de Placas Solares a Granizo',
    gancho: 'Placa solar quebra com granizo? Olha o desespero desse morador!',
    corpo: 'A verdade é que as placas solares homologadas pelo Inmetro passam por testes rigorosos de impacto, resistindo a pedras de granizo de até 25mm a mais de 80 km/h. Se o produto for de qualidade, aguenta firme!',
    cta: 'Quer saber se a sua casa suporta energia solar? Comente QUERO saber mais e faça seu orçamento com a gente da Irmãos na Obra!',
    falar: 'Placa solar quebra com granizo? Olha o desespero desse morador! A verdade é que as placas solares homologadas pelo Inmetro passam por testes rigorosos de impacto, resistindo a pedras de granizo de até 25 milímetros a mais de 80 quilômetros por hora. Se o produto for de qualidade, aguenta firme! Quer saber se a sua casa suporta energia solar? Comente QUERO e faça seu orçamento com a gente!',
    variacoes_gancho_json: [
      'Será que a chuva de pedra destrói seu investimento em energia solar?',
      'Granizo vs Placa Solar: O teste extremo que você precisa ver!',
      'Você tem medo de instalar energia solar por causa do granizo? Olha isso!'
    ],
    aprovado: false,
    created_at: new Date(Date.now() - 3600000 * 23).toISOString()
  },
  {
    id: 'r2',
    trecho_id: 't2',
    tema: 'Importância da Ferragem na Fundação',
    gancho: 'Obra sem ferragem na fundação: Economia burra ou tragédia anunciada?',
    corpo: 'Fazer fundação sem aço é pedir para ter trincas, rachaduras e até colapso da estrutura em poucos anos. O concreto resiste bem à compressão, mas é o aço que aguenta a tração e a torção.',
    cta: 'Evite prejuízos na sua obra! Siga o perfil da Irmãos na Obra para mais dicas de engenharia civil.',
    falar: 'Obra sem ferragem na fundação: Economia burra ou tragédia anunciada? Fazer fundação sem aço é pedir para ter trincas, rachaduras e até colapso da estrutura em poucos anos. O concreto resiste bem à compressão, mas é o aço que aguenta a tração e a torção. Evite prejuízos na sua obra! Siga o perfil da Irmãos na Obra para mais dicas de engenharia civil.',
    variacoes_gancho_json: [
      'O erro fatal na fundação que 90% das pessoas cometem por economia!',
      'Como economizar na fundação sem colocar a sua casa no chão?',
      'Fundação de concreto puro sem ferro: Por que isso é proibido na norma?'
    ],
    aprovado: true,
    created_at: new Date(Date.now() - 3600000 * 47).toISOString()
  }
];

const DEMO_RENDERS = [
  {
    id: 'rn1',
    roteiro_id: 'r2',
    avatar_id: 'josh_lite_20230505',
    voice_id: 'br_portuguese_male',
    status: 'concluido',
    video_url: 'https://assets.heygen.ai/video/demo.mp4',
    aspect: '9:16',
    created_at: new Date(Date.now() - 3600000 * 46).toISOString()
  }
];

const DEMO_PUBLICACOES = [
  {
    id: 'pub1',
    render_id: 'rn1',
    plataforma: 'instagram',
    instagram_media_id: '1802938192837192',
    status: 'publicado',
    agendado_para: null,
    postado_em: new Date(Date.now() - 3600000 * 45).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 46).toISOString()
  }
];

// Helper database functions that automatically toggle between mock & supabase
export const db = {
  projetos: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('projetos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      return getLocalStorageItem('db_projetos', DEMO_PROJECTS);
    },
    get: async (id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('projetos').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_projetos', DEMO_PROJECTS);
      return list.find((p: any) => p.id === id) || null;
    },
    create: async (nome: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('projetos').insert([{ nome, status: 'pendente' }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_projetos', DEMO_PROJECTS);
      const newProj = { id: 'p_' + Math.random().toString(36).substr(2, 9), nome, status: 'pendente', created_at: new Date().toISOString() };
      setLocalStorageItem('db_projetos', [newProj, ...list]);
      return newProj;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('projetos').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_projetos', DEMO_PROJECTS);
      const updatedList = list.map((p: any) => p.id === id ? { ...p, ...updates } : p);
      setLocalStorageItem('db_projetos', updatedList);
      return updatedList.find((p: any) => p.id === id);
    },
    delete: async (id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('projetos').delete().eq('id', id);
        if (error) throw error;
        return true;
      }
      const list = getLocalStorageItem('db_projetos', DEMO_PROJECTS);
      setLocalStorageItem('db_projetos', list.filter((p: any) => p.id !== id));
      return true;
    }
  },

  videos_fonte: {
    list: async (projeto_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('videos_fonte').select('*').eq('projeto_id', projeto_id);
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_videos_fonte', DEMO_VIDEOS_FONTE);
      return list.filter((v: any) => v.projeto_id === projeto_id);
    },
    create: async (projeto_id: string, url: string, plataforma: string, duracao?: number, transcricao_json?: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('videos_fonte').insert([{
          projeto_id, url, plataforma, duracao, transcricao_json, status: 'concluido'
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_videos_fonte', DEMO_VIDEOS_FONTE);
      const newVideo = {
        id: 'v_' + Math.random().toString(36).substr(2, 9),
        projeto_id,
        url,
        plataforma,
        duracao: duracao || 0,
        transcricao_json: transcricao_json || {},
        status: 'concluido',
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_videos_fonte', [newVideo, ...list]);
      return newVideo;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('videos_fonte').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_videos_fonte', DEMO_VIDEOS_FONTE);
      const updatedList = list.map((v: any) => v.id === id ? { ...v, ...updates } : v);
      setLocalStorageItem('db_videos_fonte', updatedList);
      return updatedList.find((v: any) => v.id === id);
    }
  },

  trechos: {
    list: async (video_fonte_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('trechos').select('*').eq('video_fonte_id', video_fonte_id).order('score_viral', { ascending: false });
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_trechos', DEMO_TRECHOS);
      return list.filter((t: any) => t.video_fonte_id === video_fonte_id).sort((a: any, b: any) => b.score_viral - a.score_viral);
    },
    create: async (video_fonte_id: string, inicio_ms: number, fim_ms: number, score_viral: number, motivo: string, transcricao: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('trechos').insert([{
          video_fonte_id, inicio_ms, fim_ms, score_viral, motivo, transcricao, aprovado: false
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_trechos', DEMO_TRECHOS);
      const newTrecho = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        video_fonte_id,
        inicio_ms,
        fim_ms,
        score_viral,
        motivo,
        transcricao,
        aprovado: false,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_trechos', [newTrecho, ...list]);
      return newTrecho;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('trechos').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_trechos', DEMO_TRECHOS);
      const updatedList = list.map((t: any) => t.id === id ? { ...t, ...updates } : t);
      setLocalStorageItem('db_trechos', updatedList);
      return updatedList.find((t: any) => t.id === id);
    }
  },

  roteiros: {
    list: async (trecho_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('roteiros').select('*').eq('trecho_id', trecho_id);
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_roteiros', DEMO_ROTEIROS);
      return list.filter((r: any) => r.trecho_id === trecho_id);
    },
    create: async (trecho_id: string, tema: string, gancho: string, corpo: string, cta: string, falar: string, variacoes_gancho_json: string[]) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('roteiros').insert([{
          trecho_id, tema, gancho, corpo, cta, falar, variacoes_gancho_json, aprovado: false
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_roteiros', DEMO_ROTEIROS);
      const newRoteiro = {
        id: 'r_' + Math.random().toString(36).substr(2, 9),
        trecho_id,
        tema,
        gancho,
        corpo,
        cta,
        falar,
        variacoes_gancho_json,
        aprovado: false,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_roteiros', [newRoteiro, ...list]);
      return newRoteiro;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('roteiros').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_roteiros', DEMO_ROTEIROS);
      const updatedList = list.map((r: any) => r.id === id ? { ...r, ...updates } : r);
      setLocalStorageItem('db_roteiros', updatedList);
      return updatedList.find((r: any) => r.id === id);
    }
  },

  renders: {
    list: async (roteiro_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('renders').select('*').eq('roteiro_id', roteiro_id);
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_renders', DEMO_RENDERS);
      return list.filter((r: any) => r.roteiro_id === roteiro_id);
    },
    create: async (roteiro_id: string, avatar_id: string, voice_id: string, aspect: string = '9:16') => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('renders').insert([{
          roteiro_id, avatar_id, voice_id, status: 'pendente', aspect
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_renders', DEMO_RENDERS);
      const newRender = {
        id: 'rn_' + Math.random().toString(36).substr(2, 9),
        roteiro_id,
        avatar_id,
        voice_id,
        status: 'pendente',
        video_url: null,
        aspect,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_renders', [newRender, ...list]);
      return newRender;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('renders').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_renders', DEMO_RENDERS);
      const updatedList = list.map((r: any) => r.id === id ? { ...r, ...updates } : r);
      setLocalStorageItem('db_renders', updatedList);
      return updatedList.find((r: any) => r.id === id);
    }
  },

  publicacoes: {
    list: async (render_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('publicacoes').select('*').eq('render_id', render_id);
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_publicacoes', DEMO_PUBLICACOES);
      return list.filter((p: any) => p.render_id === render_id);
    },
    create: async (render_id: string, plataforma: string = 'instagram', agendado_para?: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('publicacoes').insert([{
          render_id, plataforma, status: agendado_para ? 'agendado' : 'pendente', agendado_para
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_publicacoes', DEMO_PUBLICACOES);
      const newPub = {
        id: 'pub_' + Math.random().toString(36).substr(2, 9),
        render_id,
        plataforma,
        instagram_media_id: null,
        status: agendado_para ? 'agendado' : 'pendente',
        agendado_para: agendado_para || null,
        postado_em: null,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_publicacoes', [newPub, ...list]);
      return newPub;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('publicacoes').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_publicacoes', DEMO_PUBLICACOES);
      const updatedList = list.map((p: any) => p.id === id ? { ...p, ...updates } : p);
      setLocalStorageItem('db_publicacoes', updatedList);
      return updatedList.find((p: any) => p.id === id);
    }
  }
};
