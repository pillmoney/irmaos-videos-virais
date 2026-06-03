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
