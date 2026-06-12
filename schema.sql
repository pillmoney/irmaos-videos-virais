-- 1. Projetos
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aguardando_aprovacao, concluido, falhou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vídeos Fonte
CREATE TABLE IF NOT EXISTS videos_fonte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    plataforma TEXT NOT NULL, -- youtube, tiktok, instagram, etc.
    duracao REAL,
    transcricao_json JSONB,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, processando, concluido, erro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Trechos Virais (Cortes)
CREATE TABLE IF NOT EXISTS trechos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_fonte_id UUID REFERENCES videos_fonte(id) ON DELETE CASCADE NOT NULL,
    inicio_ms INTEGER NOT NULL,
    fim_ms INTEGER NOT NULL,
    score_viral REAL NOT NULL DEFAULT 0.0,
    motivo TEXT,
    transcricao TEXT,
    aprovado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Roteiros de React/Review
CREATE TABLE IF NOT EXISTS roteiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trecho_id UUID REFERENCES trechos(id) ON DELETE CASCADE NOT NULL,
    tema TEXT,
    gancho TEXT,
    corpo TEXT,
    cta TEXT,
    falar TEXT NOT NULL, -- texto completo contínuo que o avatar vai ler
    variacoes_gancho_json JSONB, -- array de variações de gancho para teste A/B
    aprovado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Renders (Integração HeyGen/Remotion)
CREATE TABLE IF NOT EXISTS renders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roteiro_id UUID REFERENCES roteiros(id) ON DELETE CASCADE NOT NULL,
    avatar_id TEXT NOT NULL,
    voice_id TEXT,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, renderizando, concluido, falhou
    video_url TEXT,
    aspect TEXT DEFAULT '9:16',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Publicações (Instagram Graph API)
CREATE TABLE IF NOT EXISTS publicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    render_id UUID REFERENCES renders(id) ON DELETE CASCADE NOT NULL,
    plataforma TEXT DEFAULT 'instagram',
    instagram_media_id TEXT,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, agendado, publicado, falhou
    agendado_para TIMESTAMP WITH TIME ZONE,
    postado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- MÓDULO: Modelando Formatos Virais
-- =============================================

-- 7. Fontes de Modelagem (input do operador)
CREATE TABLE IF NOT EXISTS modeling_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    screenshot_url TEXT,
    brief_text TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, analyzing, blueprint, rendering, scoring, done, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Análise do Vídeo Original
CREATE TABLE IF NOT EXISTS modeling_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES modeling_sources(id) ON DELETE CASCADE NOT NULL,
    transcript TEXT,
    hook_json JSONB,         -- { text, duration_ms, visual_description }
    body_json JSONB,         -- { segments: [{ text, action, duration_ms }] }
    cta_json JSONB,          -- { text, visual_description }
    framing_type TEXT,       -- arm_only, talking_head, product_demo, lifestyle
    scenario_json JSONB,     -- { description, lighting, background }
    product_json JSONB,      -- { name, type, variants: [], character_anchor }
    virality_hypothesis TEXT,
    performance_signals_json JSONB,
    matched_format_id UUID REFERENCES format_library(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Blueprints (plano de 5 variações gerado pelo Claude)
CREATE TABLE IF NOT EXISTS modeling_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES modeling_sources(id) ON DELETE CASCADE NOT NULL,
    variations_json JSONB NOT NULL, -- array de 5 objetos { hook, body_segments, cta, avatar, scenario }
    variant_count INTEGER NOT NULL DEFAULT 5,
    avatar_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Variações Individuais
CREATE TABLE IF NOT EXISTS modeling_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID REFERENCES modeling_blueprints(id) ON DELETE CASCADE NOT NULL,
    idx INTEGER NOT NULL CHECK (idx >= 0 AND idx <= 4),
    script TEXT,
    storyboard_json JSONB,
    caption TEXT,
    hashtags TEXT,
    render_urls_json JSONB,  -- { video_url, thumbnail_url }
    score_total REAL,
    score_axes_json JSONB,   -- { hook_strength, retention, cta_clarity, originality, audio_visual_sync, trend_adherence, caption_readability }
    project_id UUID REFERENCES projetos(id), -- FK para o pipeline existente
    status TEXT NOT NULL DEFAULT 'pending', -- pending, rendering, scoring, approved, revision, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Fila de Jobs (processamento assíncrono)
CREATE TABLE IF NOT EXISTS modeling_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,       -- analyze, blueprint, render, score, create_project
    payload_json JSONB,
    status TEXT NOT NULL DEFAULT 'queued', -- queued, running, done, error
    attempts INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Biblioteca de Formatos Virais (RAG auto-aprendiz)
CREATE TABLE IF NOT EXISTS format_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    framing_type TEXT,
    shot_sequence_json JSONB, -- array descrevendo a sequência de shots
    hook_archetype TEXT,      -- ex: "curiosidade", "choque", "antes/depois"
    cta_type TEXT,            -- ex: "link_bio", "arraste", "compre_agora"
    viral_factors_json JSONB,
    performance_benchmark_json JSONB,
    win_rate REAL DEFAULT 0.0,
    sample_size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Prompts Exportados para IAs Externas
CREATE TABLE IF NOT EXISTS external_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variation_id UUID REFERENCES modeling_variations(id) ON DELETE CASCADE NOT NULL,
    target_model TEXT NOT NULL, -- veo3, seedance, kling
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de performance para o módulo de modelagem
CREATE INDEX IF NOT EXISTS idx_modeling_analysis_source ON modeling_analysis(source_id);
CREATE INDEX IF NOT EXISTS idx_modeling_blueprints_source ON modeling_blueprints(source_id);
CREATE INDEX IF NOT EXISTS idx_modeling_variations_blueprint ON modeling_variations(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_modeling_variations_project ON modeling_variations(project_id);
CREATE INDEX IF NOT EXISTS idx_modeling_jobs_status ON modeling_jobs(status);
CREATE INDEX IF NOT EXISTS idx_external_prompts_variation ON external_prompts(variation_id);
