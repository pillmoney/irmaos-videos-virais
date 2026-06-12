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
    const parsed = item ? JSON.parse(item) : defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed;
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
    modulo_codigo: 'A',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'p2',
    nome: 'Review Obra: Fundação Sem Ferragem',
    status: 'publicado',
    modulo_codigo: 'B',
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
    create: async (nome: string, modulo_codigo: string = 'A') => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('projetos').insert([{ nome, status: 'pendente', modulo_codigo }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_projetos', DEMO_PROJECTS);
      const newProj = { id: 'p_' + Math.random().toString(36).substr(2, 9), nome, status: 'pendente', modulo_codigo, created_at: new Date().toISOString() };
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
  },
  viral_scores: {
    create: async (roteiro_id: string, scoreData: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('viral_scores').insert([{
          roteiro_id,
          score_total: scoreData.score_total,
          hook: scoreData.hook,
          estrutura: scoreData.estrutura,
          retencao: scoreData.retencao,
          quebra_padrao: scoreData.quebra_padrao,
          similaridade: scoreData.similaridade,
          cta: scoreData.cta,
          aderencia: scoreData.aderencia,
          motivo: scoreData.motivo
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_viral_scores', []);
      const newScore = { id: 'vs_' + Math.random().toString(36).substr(2, 9), roteiro_id, ...scoreData, created_at: new Date().toISOString() };
      setLocalStorageItem('db_viral_scores', [newScore, ...list]);
      return newScore;
    },
    getForRoteiro: async (roteiro_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('viral_scores').select('*').eq('roteiro_id', roteiro_id).maybeSingle();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_viral_scores', []);
      return list.find((vs: any) => vs.roteiro_id === roteiro_id) || null;
    }
  },
  ferramentas_saldo: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('ferramentas_saldo').select('*');
        if (error) throw error;
        return data;
      }
      const defaultSaldos = [
        { ferramenta: 'HeyGen', saldo: 48.5, burn_rate_dia: 1.2, data_esgotamento: new Date(Date.now() + 3600000 * 24 * 40).toISOString(), atualizado_em: new Date().toISOString() },
        { ferramenta: 'Claude (Anthropic)', saldo: 120.0, burn_rate_dia: 3.5, data_esgotamento: new Date(Date.now() + 3600000 * 24 * 34).toISOString(), atualizado_em: new Date().toISOString() },
        { ferramenta: 'Z-API (WhatsApp)', saldo: 15.0, burn_rate_dia: 0.5, data_esgotamento: new Date(Date.now() + 3600000 * 24 * 30).toISOString(), atualizado_em: new Date().toISOString() }
      ];
      return getLocalStorageItem('db_ferramentas_saldo', defaultSaldos);
    },
    update: async (ferramenta: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('ferramentas_saldo').update(updates).eq('ferramenta', ferramenta).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.ferramentas_saldo.list();
      const updatedList = list.map((f: any) => f.ferramenta === ferramenta ? { ...f, ...updates, atualizado_em: new Date().toISOString() } : f);
      setLocalStorageItem('db_ferramentas_saldo', updatedList);
      return updatedList.find((f: any) => f.ferramenta === ferramenta);
    }
  },
  orcamentos: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('orcamentos').select('*');
        if (error) throw error;
        return data;
      }
      const defaultOrcamentos = [
        { modulo_id: 'A', cap_mensal: 500.0, gasto_mes: 120.0, threshold_alerta: 30.0 },
        { modulo_id: 'B', cap_mensal: 800.0, gasto_mes: 310.0, threshold_alerta: 30.0 },
        { modulo_id: 'C', cap_mensal: 400.0, gasto_mes: 80.0, threshold_alerta: 30.0 }
      ];
      return getLocalStorageItem('db_orcamentos', defaultOrcamentos);
    },
    update: async (modulo_id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('orcamentos').update(updates).eq('modulo_id', modulo_id).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.orcamentos.list();
      const updatedList = list.map((o: any) => o.modulo_id === modulo_id ? { ...o, ...updates } : o);
      setLocalStorageItem('db_orcamentos', updatedList);
      return updatedList.find((o: any) => o.modulo_id === modulo_id);
    }
  },
  ideias: {
    list: async (lote_id?: string) => {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('ideias').select('*');
        if (lote_id) query = query.eq('lote_id', lote_id);
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_ideias', [
        { id: 'id1', lote_id: 'lote_obra', angulo: 'Erros na fundação da casa que o pedreiro escondeu', gancho: 'O pedreiro tentou esconder isso aqui, mas a física não perdoa!', pre_score: 88, status: 'avancou', created_at: new Date().toISOString() },
        { id: 'id2', lote_id: 'lote_obra', angulo: 'Economia burra usando cimento vencido', gancho: 'Você usaria cimento vencido para economizar 20 reais?', pre_score: 65, status: 'cortada', created_at: new Date().toISOString() },
        { id: 'id3', lote_id: 'lote_obra', angulo: 'Reação a telhado sem inclinação correta', gancho: 'Esse telhado vai chover mais dentro do que fora no primeiro temporal!', pre_score: 92, status: 'avancou', created_at: new Date().toISOString() }
      ]);
      if (lote_id) {
        return list.filter((i: any) => i.lote_id === lote_id);
      }
      return list;
    },
    create: async (lote_id: string, angulo: string, gancho: string, pre_score: number, status: string = 'avancou') => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('ideias').insert([{ lote_id, angulo, gancho, pre_score, status }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.ideias.list();
      const newIdea = {
        id: 'id_' + Math.random().toString(36).substr(2, 9),
        lote_id,
        angulo,
        gancho,
        pre_score,
        status,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_ideias', [newIdea, ...list]);
      return newIdea;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('ideias').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.ideias.list();
      const updatedList = list.map((i: any) => i.id === id ? { ...i, ...updates } : i);
      setLocalStorageItem('db_ideias', updatedList);
      return updatedList.find((i: any) => i.id === id);
    }
  },
  autocritica: {
    list: async (geracao_id: string) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('autocritica').select('*').eq('geracao_id', geracao_id).order('iteracao', { ascending: true });
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_autocritica', [
        { id: 'ac1', geracao_id: 'r1', iteracao: 1, score_antes: 72, score_depois: 84, mudancas: 'Melhorado gancho para incluir quebra de padrão forte e CTA claro.', aprovado_pela_ia: true, created_at: new Date().toISOString() }
      ]);
      return list.filter((a: any) => a.geracao_id === geracao_id);
    },
    create: async (geracao_id: string, iteracao: number, score_antes: number, score_depois: number, mudancas: string, aprovado_pela_ia: boolean) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('autocritica').insert([{ geracao_id, iteracao, score_antes, score_depois, mudancas, aprovado_pela_ia }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_autocritica', []);
      const newCritique = {
        id: 'ac_' + Math.random().toString(36).substr(2, 9),
        geracao_id,
        iteracao,
        score_antes,
        score_depois,
        mudancas,
        aprovado_pela_ia,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_autocritica', [newCritique, ...list]);
      return newCritique;
    }
  },
  funil_eventos: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('funil_eventos').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        return data;
      }
      return getLocalStorageItem('db_funil_eventos', [
        { id: 'fe1', item_id: 'p1', etapa: 1, decisor: 'ia', resultado: 'avancou', custo_creditos: 0.0, timestamp: new Date().toISOString() },
        { id: 'fe2', item_id: 'p1', etapa: 2, decisor: 'ia', resultado: 'avancou', custo_creditos: 0.1, timestamp: new Date().toISOString() },
        { id: 'fe3', item_id: 'p1', etapa: 3, decisor: 'ia', resultado: 'avancou', custo_creditos: 0.0, timestamp: new Date().toISOString() },
        { id: 'fe4', item_id: 'p1', etapa: 4, decisor: 'humano', resultado: 'avancou', custo_creditos: 1.0, timestamp: new Date().toISOString() }
      ]);
    },
    create: async (item_id: string, etapa: number, decisor: string, resultado: string, custo_creditos: number = 0.0) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('funil_eventos').insert([{ item_id, etapa, decisor, resultado, custo_creditos }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.funil_eventos.list();
      const newEvent = {
        id: 'fe_' + Math.random().toString(36).substr(2, 9),
        item_id,
        etapa,
        decisor,
        resultado,
        custo_creditos,
        timestamp: new Date().toISOString()
      };
      setLocalStorageItem('db_funil_eventos', [newEvent, ...list]);
      return newEvent;
    }
  },
  funil_metrics: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('funil_metrics').select('*').order('data', { ascending: true });
        if (error) throw error;
        return data;
      }
      const defaultMetrics = [
        { data: new Date().toISOString().split('T')[0], etapa: 1, entradas: 120, saidas: 30, taxa_conversao: 25.0, custo_etapa: 0.02, custo_por_vencedor: 0.0 },
        { data: new Date().toISOString().split('T')[0], etapa: 2, entradas: 30, saidas: 15, taxa_conversao: 50.0, custo_etapa: 0.15, custo_por_vencedor: 0.05 },
        { data: new Date().toISOString().split('T')[0], etapa: 3, entradas: 15, saidas: 12, taxa_conversao: 80.0, custo_etapa: 0.0, custo_por_vencedor: 0.01 },
        { data: new Date().toISOString().split('T')[0], etapa: 4, entradas: 12, saidas: 10, taxa_conversao: 83.3, custo_etapa: 10.0, custo_por_vencedor: 1.0 },
        { data: new Date().toISOString().split('T')[0], etapa: 5, entradas: 10, saidas: 2, taxa_conversao: 20.0, custo_etapa: 5.0, custo_por_vencedor: 7.5 }
      ];
      return getLocalStorageItem('db_funil_metrics', defaultMetrics);
    },
    create: async (etapa: number, entradas: number, saidas: number, taxa_conversao: number, custo_etapa: number, custo_por_vencedor: number) => {
      const data_str = new Date().toISOString().split('T')[0];
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('funil_metrics').insert([{ data: data_str, etapa, entradas, saidas, taxa_conversao, custo_etapa, custo_por_vencedor }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.funil_metrics.list();
      const newMetric = {
        id: 'fm_' + Math.random().toString(36).substr(2, 9),
        data: data_str,
        etapa,
        entradas,
        saidas,
        taxa_conversao,
        custo_etapa,
        custo_por_vencedor
      };
      setLocalStorageItem('db_funil_metrics', [...list, newMetric]);
      return newMetric;
    }
  },
  brand_kit: {
    get: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('brand_kit').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (data) return data;
      }
      const defaultKit = {
        id: 'bk_default',
        cores_json: {
          primary: '#FDFBF7', // cream
          secondary: '#0A192F', // navy
          accent: '#B87333' // copper
        },
        fontes: 'Montserrat',
        logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200',
        selo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        cta_card_json: {
          title: 'Quer economizar até 95% na conta de luz?',
          button_text: 'Clique no link da Bio!',
          background: '#0A192F',
          text_color: '#FDFBF7'
        },
        legenda_estilo_json: {
          font_size: '32',
          font_color: '#FFFFFF',
          highlight_color: '#B87333',
          outline_color: '#000000'
        }
      };
      return getLocalStorageItem('db_brand_kit', defaultKit);
    },
    update: async (updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data: current } = await supabase.from('brand_kit').select('id').limit(1).maybeSingle();
        let res;
        if (current) {
          res = await supabase.from('brand_kit').update(updates).eq('id', current.id).select().single();
        } else {
          res = await supabase.from('brand_kit').insert([updates]).select().single();
        }
        if (res.error) throw res.error;
        return res.data;
      }
      const current = await db.brand_kit.get();
      const updated = { ...current, ...updates };
      setLocalStorageItem('db_brand_kit', updated);
      return updated;
    }
  },
  templates_montagem: {
    list: async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('templates_montagem').select('*');
        if (error) throw error;
        return data;
      }
      const defaultTemplates = [
        { id: 't_m1', modulo_id: 'A', tipo: 'lower_third', config_json: { position: 'bottom', duration: 4.0 } },
        { id: 't_m2', modulo_id: 'B', tipo: 'intro', config_json: { duration: 2.0, effect: 'fade' } },
        { id: 't_m3', modulo_id: 'C', tipo: 'cta', config_json: { duration: 3.0, style: 'overlay' } }
      ];
      return getLocalStorageItem('db_templates_montagem', defaultTemplates);
    },
    create: async (modulo_id: string, tipo: string, config_json: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('templates_montagem').insert([{ modulo_id, tipo, config_json }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.templates_montagem.list();
      const newTemplate = {
        id: 'tm_' + Math.random().toString(36).substr(2, 9),
        modulo_id,
        tipo,
        config_json,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_templates_montagem', [...list, newTemplate]);
      return newTemplate;
    }
  },
  montagens: {
    list: async (geracao_id?: string) => {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('montagens').select('*');
        if (geracao_id) {
          query = query.eq('geracao_id', geracao_id);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_montagens', []);
      if (geracao_id) {
        return list.filter((m: any) => m.geracao_id === geracao_id);
      }
      return list;
    },
    create: async (geracao_id: string, caminho: 'heygen' | 'remotion', brand_kit_id: string = 'bk_default') => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('montagens').insert([{
          geracao_id, caminho, brand_kit_id, status: 'pendente', aprovado: false, retoque_humano: false
        }]).select().single();
        if (error) throw error;
        return data;
      }
      const list = await db.montagens.list();
      const newMontagem = {
        id: 'mt_' + Math.random().toString(36).substr(2, 9),
        geracao_id,
        caminho,
        brand_kit_id,
        status: 'pendente',
        aprovado: false,
        retoque_humano: false,
        video_final_url: null,
        created_at: new Date().toISOString()
      };
      setLocalStorageItem('db_montagens', [newMontagem, ...list]);
      return newMontagem;
    },
    update: async (id: string, updates: any) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('montagens').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const list = getLocalStorageItem('db_montagens', []);
      const updatedList = list.map((m: any) => m.id === id ? { ...m, ...updates } : m);
      setLocalStorageItem('db_montagens', updatedList);
      return updatedList.find((m: any) => m.id === id);
    }
  }
};
