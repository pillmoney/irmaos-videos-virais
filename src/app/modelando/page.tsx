'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getApiUrl, safeFetch } from '@/lib/utils';
import {
  Target,
  Plus,
  Play,
  Upload,
  Link2,
  FileText,
  Sparkles,
  Copy,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Clipboard,
  ArrowRight,
  Zap,
  Eye,
  Shield,
  Music,
  Type,
  TrendingUp,
  Crosshair,
  ArrowLeft,
  X,
  Check,
  Film,
  Layers,
  BarChart3,
  Hash,
  Wand2
} from 'lucide-react';

// =============================================
// Types
// =============================================

interface ScoreAxis {
  label: string;
  key: string;
  weight: number;
  value: number;
  icon: React.ReactNode;
}

interface Variation {
  id: string;
  index: number;
  totalScore: number;
  scores: ScoreAxis[];
  caption: string;
  hashtags: string;
  projectId: string | null;
  projectStatus: string | null;
  prompts: {
    veo3: string;
    seedance: string;
    kling: string;
  };
}

interface ModelingJob {
  id: string;
  sourceUrl: string;
  currentStep: number;
  status: 'processing' | 'completed' | 'failed';
  variations: Variation[];
  createdAt: string;
}

type PipelineStep = {
  label: string;
  icon: React.ReactNode;
};

// =============================================
// Constants
// =============================================

const PIPELINE_STEPS: PipelineStep[] = [
  { label: 'Ingestão', icon: <Link2 className="h-3.5 w-3.5" /> },
  { label: 'Análise', icon: <Eye className="h-3.5 w-3.5" /> },
  { label: 'Blueprint', icon: <FileText className="h-3.5 w-3.5" /> },
  { label: 'Render', icon: <Film className="h-3.5 w-3.5" /> },
  { label: 'Score', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { label: 'Pronto', icon: <CheckCircle className="h-3.5 w-3.5" /> },
];

// =============================================
// Prompt Generator
// =============================================

function generateVeo3Prompt(variation: Variation): string {
  return `[GLOBAL]
aspect_ratio: 9:16
duration: ~32s (4 cenas × ~8s)
style: cinematic UGC, câmera-de-mão natural, luz dourada
fps: 24
color_grade: warm amber highlights, lifted shadows
audio: narração off masculina grave, BPM 100 lo-fi beat

[PERSONAGEM-ANCORA]
Homem brasileiro, ~30 anos, pele morena, barba curta aparada, 
camisa polo azul marinho com logo "Irmãos na Obra" bordado peito esquerdo,
capacete branco de engenheiro, óculos de proteção transparente no pescoço.
Expressão: confiante, levemente sério.
-- Repetir esta descrição IDENTICAMENTE em cada cena. --

[NEGATIVE_GLOBAL]
Sem texto renderizado na tela, sem watermark, sem deformações de mãos,
sem cortes de jump-cut dentro da mesma cena, sem mudança de roupa do personagem.

────────────────────────────────

CENA 1 — GANCHO (0s → 8s)
  Camera: CLOSE-UP frontal, lente 35mm, leve shake de mão
  Ação: Personagem-âncora olha para câmera e levanta uma placa solar trincada 
         com as duas mãos. Expressão de espanto controlado.
  Cenário: Telhado residencial com telhas coloniais, céu azul ao fundo.
  Áudio: "Você sabia que 80% das instalações solares no Brasil cometem esse erro?"
  Negative: sem zoom digital, sem transição de wipe

CENA 2 — CORPO (8s → 16s)
  Camera: MEDIUM SHOT lateral, dolly suave para a direita, lente 50mm
  Ação: Personagem-âncora aponta com o dedo indicador para um painel solar 
         instalado com angulação incorreta em um telhado de teste.
  Cenário: Área de demonstração de energia solar, painéis em diferentes ângulos.
  Áudio: "A inclinação errada pode reduzir até 35% da eficiência do seu sistema."
  Negative: sem close extremo, sem mudança de iluminação abrupta

CENA 3 — CORPO/PROVA (16s → 24s)
  Camera: OVER-THE-SHOULDER, lente 85mm rasa (f/2.0), foco no multímetro
  Ação: Personagem-âncora segura um multímetro digital mostrando leitura de 
         tensão. A outra mão aponta para o display com expressão de confirmação.
  Cenário: Mesmo telhado de teste, painéis solares ao fundo desfocados.
  Áudio: "Olha a diferença: com o ângulo certo, a tensão subiu 40%."
  Negative: sem texto sobreposto, sem gráfico gerado por IA na cena

CENA 4 — CTA (24s → 32s)
  Camera: MEDIUM CLOSE-UP frontal, lente 35mm, leve push-in de 5%
  Ação: Personagem-âncora cruza os braços sorrindo e faz sinal de "joinha" 
         com a mão direita. Olha direto para a câmera.
  Cenário: Telhado com painéis solares corretamente instalados ao fundo,
           luz golden hour suave.
  Áudio: "Comenta QUERO que eu mando o checklist gratuito de instalação!"
  Negative: sem fade-out, sem texto na tela, sem logo renderizado`;
}

function generateSeedancePrompt(variation: Variation): string {
  return `# Seedance 1.0 – Modelagem Viral Solar
# Formato: 9:16 vertical | 4 segmentos de ~8s

[CONFIG]
resolution: 1080x1920
segments: 4
style: realistic_ugc
motion_intensity: medium
character_consistency: strict

[CHARACTER_LOCK]
id: "anchor_irmaos"
desc: Homem brasileiro ~30 anos, barba curta, camisa polo azul marinho 
      com logo bordado, capacete branco, pele morena, expressão confiante.

[SEG_1: HOOK] dur=8s
  framing: close_up_frontal
  action: personagem levanta placa solar trincada, olhar de espanto
  environment: telhado colonial, céu azul
  camera_motion: handheld_subtle
  audio_cue: "80% das instalações cometem esse erro"
  negative: no_text_overlay, no_zoom_digital

[SEG_2: BODY] dur=8s  
  framing: medium_lateral
  action: aponta para painel com angulação errada
  environment: área de demonstração solar
  camera_motion: dolly_right_slow
  audio_cue: "inclinação errada reduz 35% da eficiência"
  negative: no_abrupt_lighting

[SEG_3: PROOF] dur=8s
  framing: over_shoulder
  action: segura multímetro com leitura, expressão de confirmação
  environment: telhado de teste
  camera_motion: static_shallow_dof
  audio_cue: "com ângulo certo, tensão subiu 40%"
  negative: no_ai_graphics

[SEG_4: CTA] dur=8s
  framing: medium_closeup_frontal
  action: cruza braços, sorriso, joinha para câmera
  environment: telhado com painéis corretos, golden hour
  camera_motion: push_in_5pct
  audio_cue: "comenta QUERO para o checklist gratuito"
  negative: no_text, no_fade`;
}

function generateKlingPrompt(variation: Variation): string {
  return `## Kling 2.1 – Prompt de Vídeo Viral
## Aspecto: 9:16 | Duração Total: ~32s | 4 Cenas

### Configuração Global
- Resolução: 1080x1920 (vertical mobile-first)
- Estilo: UGC cinematográfico, câmera de mão, luz natural
- Personagem fixo: brasileiro ~30a, barba curta, polo azul marinho 
  com logo "Irmãos na Obra", capacete branco, pele morena

### Cena 1 – Gancho (0-8s)
Enquadramento: Close-up frontal, 35mm, shake sutil
Ação: Personagem segura placa solar danificada com ambas as mãos
Local: Telhado residencial colonial com céu aberto
Movimento: Câmera estática com micro-tremor natural
Narração: "Você sabia que 80% das instalações solares cometem esse erro?"
Proibido: texto na tela, zoom digital, watermark

### Cena 2 – Desenvolvimento (8-16s)
Enquadramento: Plano médio lateral, 50mm
Ação: Personagem aponta para painel solar mal inclinado  
Local: Área de demonstração com múltiplos painéis
Movimento: Dolly suave para direita
Narração: "A inclinação errada reduz até 35% da eficiência"
Proibido: corte abrupto, mudança de luz

### Cena 3 – Prova Social (16-24s)
Enquadramento: Over-the-shoulder, 85mm, profundidade rasa
Ação: Segura multímetro mostrando leitura positiva
Local: Mesmo telhado, painéis desfocados ao fundo
Movimento: Estático com foco seletivo
Narração: "Com o ângulo certo, a tensão subiu 40%"
Proibido: gráficos gerados, texto sobreposto

### Cena 4 – Call to Action (24-32s)
Enquadramento: Plano médio close frontal, push-in sutil
Ação: Cruza braços, sorriso, joinha para câmera
Local: Telhado com instalação correta, golden hour
Movimento: Push-in de 5% progressivo
Narração: "Comenta QUERO e eu mando o checklist gratuito!"
Proibido: fade-out, logo renderizado, texto na tela`;
}

// =============================================
// Mock Data
// =============================================

function createMockScores(totalTarget: number): ScoreAxis[] {
  const weights = [25, 20, 15, 15, 10, 10, 5];
  const labels = [
    'Força do Gancho',
    'Retenção Prevista',
    'Clareza do CTA',
    'Originalidade',
    'Sincronia Áudio-Visual',
    'Aderência à Tendência',
    'Legibilidade Legendas',
  ];
  const keys = ['gancho', 'retencao', 'cta', 'originalidade', 'sincronia', 'aderencia', 'legibilidade'];
  const icons = [
    <Crosshair key="g" className="h-3.5 w-3.5" />,
    <Eye key="r" className="h-3.5 w-3.5" />,
    <Target key="c" className="h-3.5 w-3.5" />,
    <Sparkles key="o" className="h-3.5 w-3.5" />,
    <Music key="s" className="h-3.5 w-3.5" />,
    <TrendingUp key="a" className="h-3.5 w-3.5" />,
    <Type key="l" className="h-3.5 w-3.5" />,
  ];

  // Distribute scores proportionally to approximate the target total
  const rawScores = weights.map((w) => {
    const base = totalTarget / 100;
    const jitter = (Math.random() - 0.5) * 10;
    return Math.min(100, Math.max(50, Math.round(base * 100 + jitter)));
  });

  return labels.map((label, i) => ({
    label,
    key: keys[i],
    weight: weights[i],
    value: rawScores[i],
    icon: icons[i],
  }));
}

const MOCK_VARIATIONS: Variation[] = [
  {
    id: 'var_1',
    index: 1,
    totalScore: 97,
    scores: createMockScores(97),
    caption:
      '80% das instalações solares no Brasil cometem esse erro GRAVE! 😱☀️ A inclinação errada pode reduzir até 35% da eficiência do seu sistema. Assista até o final e veja a prova com o multímetro!',
    hashtags:
      '#energiasolar #irmaosnaobra #dicas #solar #placasolarsolar #obra #construcao #reformas #telhado #engenharia',
    projectId: null,
    projectStatus: null,
    prompts: { veo3: '', seedance: '', kling: '' },
  },
  {
    id: 'var_2',
    index: 2,
    totalScore: 92,
    scores: createMockScores(92),
    caption:
      'Seu técnico de energia solar fez isso? 🚨 Cuidado com a instalação sem checklist de qualidade! Nós mostramos o antes e depois com dados reais.',
    hashtags:
      '#energiasolar #errodaobra #irmaosnaobra #checklist #instalacaosolar #solar #cuidado #qualidade #obra',
    projectId: null,
    projectStatus: null,
    prompts: { veo3: '', seedance: '', kling: '' },
  },
  {
    id: 'var_3',
    index: 3,
    totalScore: 88,
    scores: createMockScores(88),
    caption:
      'Teste real: placa solar barata vs premium em dia nublado ☁️⚡ O resultado vai te surpreender! Qual você escolheria?',
    hashtags:
      '#testesolar #energiasolar #irmaosnaobra #baratovscaro #placasolar #dica #economia #solar',
    projectId: null,
    projectStatus: null,
    prompts: { veo3: '', seedance: '', kling: '' },
  },
];

// Initialize prompts
MOCK_VARIATIONS.forEach((v) => {
  v.prompts.veo3 = generateVeo3Prompt(v);
  v.prompts.seedance = generateSeedancePrompt(v);
  v.prompts.kling = generateKlingPrompt(v);
});

const MOCK_COMPLETED_JOB: ModelingJob = {
  id: 'mj_demo_1',
  sourceUrl: 'https://www.tiktok.com/@solarbrasil/video/7384920183',
  currentStep: 6,
  status: 'completed',
  variations: MOCK_VARIATIONS,
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
};

// =============================================
// Component
// =============================================

export default function ModelandoFormatosVirais() {
  const router = useRouter();

  // Input state
  const [inputUrl, setInputUrl] = useState('');
  const [inputBrief, setInputBrief] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showInputCard, setShowInputCard] = useState(false);

  // Pipeline state
  const [jobs, setJobs] = useState<ModelingJob[]>([MOCK_COMPLETED_JOB]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Results / modal state
  const [promptModal, setPromptModal] = useState<{ open: boolean; variation: Variation | null }>({
    open: false,
    variation: null,
  });
  const [promptTab, setPromptTab] = useState<'veo3' | 'seedance' | 'kling'>('veo3');
  const [copySuccess, setCopySuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Creating project loading state per variation
  const [creatingProject, setCreatingProject] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle file drop/upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const names = files.map((f) => f.name);
    setUploadedFiles((prev) => [...prev, ...names]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const names = files.map((f) => f.name);
    setUploadedFiles((prev) => [...prev, ...names]);
  };

  // Simulate modeling process
  const handleStartModeling = () => {
    if (!inputUrl && uploadedFiles.length === 0) return;

    const newJob: ModelingJob = {
      id: 'mj_' + Math.random().toString(36).substr(2, 9),
      sourceUrl: inputUrl || uploadedFiles[0] || 'upload_local',
      currentStep: 0,
      status: 'processing',
      variations: [],
      createdAt: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setActiveJobId(newJob.id);
    setShowInputCard(false);
    setInputUrl('');
    setInputBrief('');
    setUploadedFiles([]);

    // Simulate pipeline progression
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setJobs((prev) =>
        prev.map((j) =>
          j.id === newJob.id
            ? {
                ...j,
                currentStep: step,
                status: step >= 6 ? 'completed' : 'processing',
                variations: step >= 6 ? MOCK_VARIATIONS : [],
              }
            : j
        )
      );
      if (step >= 6) {
        clearInterval(interval);
        showToast('Modelagem concluída! 3 variações geradas.');
      }
    }, 1800);
  };

  // Create project from variation
  const handleCreateProject = async (variation: Variation, sourceUrl?: string) => {
    try {
      setCreatingProject(variation.id);
      const status = variation.totalScore >= 95 ? 'pendente' : 'aguardando_aprovacao';
      
      // 1. Create project
      const project = await db.projetos.create(
        `Modelagem Viral #${variation.index} — Score ${variation.totalScore}`,
        'D'
      );

      // 2. Create videos_fonte record
      const vf = await db.videos_fonte.create(
        project.id,
        sourceUrl || 'https://www.tiktok.com/source',
        'tiktok',
        30,
        { processed_url: '' }
      );

      // 3. Create trecho record
      const trecho = await db.trechos.create(
        vf.id,
        0,
        30000,
        variation.totalScore,
        'Detectado via Modelagem Viral',
        variation.caption
      );
      // Approve the trecho so it is selected by default in roteiro and estudio
      await db.trechos.update(trecho.id, { aprovado: true });

      // 4. Create roteiro record
      const sentences = variation.caption.split(/[.!?]/).filter(s => s.trim().length > 0);
      const gancho = sentences[0]?.trim() || variation.caption;
      const cta = sentences[sentences.length - 1]?.trim() || '';
      const corpo = sentences.slice(1, sentences.length - 1).join('. ').trim() || sentences[1]?.trim() || '';
      const falar = variation.caption;

      const roteiro = await db.roteiros.create(
        trecho.id,
        'Modelagem Viral',
        gancho,
        corpo,
        cta,
        falar,
        [gancho, 'Gancho alternativo 1', 'Gancho alternativo 2']
      );
      // Approve the roteiro
      await db.roteiros.update(roteiro.id, { aprovado: true });

      // 5. Create viral score record
      const scoreData = {
        score_total: variation.totalScore,
        hook: variation.scores.find(s => s.key === 'gancho')?.value || 90,
        estrutura: variation.scores.find(s => s.key === 'originalidade')?.value || 90,
        retencao: variation.scores.find(s => s.key === 'retencao')?.value || 90,
        quebra_padrao: variation.scores.find(s => s.key === 'sincronia')?.value || 90,
        similaridade: variation.scores.find(s => s.key === 'legibilidade')?.value || 90,
        cta: variation.scores.find(s => s.key === 'cta')?.value || 90,
        aderencia: variation.scores.find(s => s.key === 'aderencia')?.value || 90,
        motivo: `Aprovado via Modelagem Viral com pontuação total de ${variation.totalScore}.`
      };
      await db.viral_scores.create(roteiro.id, scoreData);

      // 6. Update project status
      await db.projetos.update(project.id, { status });

      // Update variation state
      setJobs((prev) =>
        prev.map((j) => ({
          ...j,
          variations: j.variations.map((v) =>
            v.id === variation.id ? { ...v, projectId: project.id, projectStatus: status } : v
          ),
        }))
      );

      showToast(
        status === 'pendente'
          ? `Projeto criado e aprovado automaticamente (Score ≥ 95)!`
          : `Projeto criado — aguardando aprovação humana (Score < 95).`
      );
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar projeto.', 'error');
    } finally {
      setCreatingProject(null);
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      showToast('Falha ao copiar prompt.', 'error');
    }
  };

  // Get score badge color
  const getScoreBadge = (score: number) => {
    if (score >= 95) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Aprovado' };
    if (score >= 90) return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Revisão' };
    return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Reprovado' };
  };

  const getBarColor = (value: number) => {
    if (value >= 90) return 'from-emerald-500 to-emerald-400';
    if (value >= 75) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-rose-400';
  };

  // Completed job for display
  const completedJobs = jobs.filter((j) => j.status === 'completed' && j.variations.length > 0);
  const processingJobs = jobs.filter((j) => j.status === 'processing');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 relative">
      {/* ==================== TOAST ==================== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col gap-4">
        <div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold tracking-wider uppercase mb-1">
              <Target className="h-4 w-4" /> Modelagem Viral
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Modelando Formatos Virais
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Cole o link de um vídeo viral, faça upload de referências e receba{' '}
              <span className="text-amber-500 font-semibold">
                variações otimizadas com score preditivo
              </span>{' '}
              e prompts prontos para Veo 3, Seedance e Kling.
            </p>
          </div>

          <button
            onClick={() => setShowInputCard(!showInputCard)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] shrink-0"
          >
            <Plus className="h-5 w-5" /> Modelar Vídeo
          </button>
        </div>
      </div>

      {/* ==================== SECTION A: INPUT CARD ==================== */}
      {showInputCard && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5 backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-amber-500" /> Nova Modelagem
            </h3>
            <button
              onClick={() => setShowInputCard(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Link do Vídeo de Referência</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cole a URL do TikTok Shop, Reels, YouTube Shorts..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 outline-none transition-colors"
              />
              <Link2 className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
            </div>
          </div>

          {/* File Upload Drop Zone */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">
              Screenshots / Fotos de Referência{' '}
              <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? 'border-amber-500/60 bg-amber-500/5'
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className={`h-8 w-8 mx-auto mb-2 ${dragActive ? 'text-amber-500' : 'text-zinc-600'}`} />
              <p className="text-sm text-zinc-400">
                Arraste arquivos aqui ou{' '}
                <span className="text-amber-500 font-semibold">clique para selecionar</span>
              </p>
              <p className="text-[11px] text-zinc-600 mt-1">
                PNG, JPG, MP4 — até 50MB por arquivo
              </p>
            </div>

            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {uploadedFiles.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300"
                  >
                    <FileText className="h-3 w-3 text-amber-500" />
                    {name}
                    <button
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-zinc-500 hover:text-zinc-300 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Brief Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">
              Brief / Contexto{' '}
              <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Ex: Foco no nicho de energia solar residencial, target São Paulo, tom humorístico..."
              value={inputBrief}
              onChange={(e) => setInputBrief(e.target.value)}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="border-t border-zinc-800/60 pt-5 flex justify-end">
            <button
              onClick={handleStartModeling}
              disabled={!inputUrl && uploadedFiles.length === 0}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-7 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-amber-500/15 disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02]"
            >
              <Sparkles className="h-4.5 w-4.5" /> Analisar e Modelar
            </button>
          </div>
        </div>
      )}

      {/* ==================== SECTION B: PIPELINE PROGRESS ==================== */}
      {processingJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Jobs em Processamento
          </h3>
          {processingJobs.map((job) => (
            <div
              key={job.id}
              className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                    <Film className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-md">
                      {job.sourceUrl}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Iniciado há {Math.round((Date.now() - new Date(job.createdAt).getTime()) / 60000)} min
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                  PROCESSANDO
                </span>
              </div>

              {/* Pipeline Steps */}
              <div className="flex items-center gap-1">
                {PIPELINE_STEPS.map((step, i) => {
                  const isCompleted = i < job.currentStep;
                  const isActive = i === job.currentStep;
                  return (
                    <React.Fragment key={i}>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800/40'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-emerald-500/20'
                              : isActive
                              ? 'bg-amber-500/20'
                              : 'bg-zinc-800/60'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-px transition-all duration-700 ${
                            isCompleted ? 'bg-emerald-500/40' : 'bg-zinc-800/40'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(job.currentStep / 6) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state when no active jobs and input card is hidden */}
      {processingJobs.length === 0 && completedJobs.length === 0 && !showInputCard && (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-3xl space-y-4">
          <div className="inline-flex p-4 bg-zinc-900/60 rounded-full text-zinc-500">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhuma modelagem ativa</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Clique em <span className="text-amber-500 font-semibold">"+ Modelar Vídeo"</span> para
            iniciar a análise de um formato viral e gerar variações otimizadas.
          </p>
          <button
            onClick={() => setShowInputCard(true)}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mt-2"
          >
            <Plus className="h-4 w-4" /> Começar Agora
          </button>
        </div>
      )}

      {/* ==================== SECTION C: RESULTS — VARIATION CARDS ==================== */}
      {completedJobs.map((job) => (
        <div key={job.id} className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" /> Variações Geradas
              <span className="text-[10px] font-medium text-zinc-600 normal-case tracking-normal ml-1">
                — {job.variations.length} variações
              </span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> CONCLUÍDO
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {job.variations.map((variation) => {
              const badge = getScoreBadge(variation.totalScore);
              return (
                <div
                  key={variation.id}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-zinc-950/50"
                >
                  {/* Variation Header */}
                  <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      <Hash className="h-3 w-3" /> Variação {variation.index}
                    </span>
                    {variation.projectId && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-2.5 w-2.5" />
                        {variation.projectStatus === 'pendente' ? 'Projeto Criado' : 'Aguardando'}
                      </span>
                    )}
                  </div>

                  {/* Video Preview Placeholder */}
                  <div className="mx-5 relative aspect-[9/16] max-h-[280px] bg-zinc-950 rounded-xl border border-zinc-800/60 overflow-hidden flex items-center justify-center group/video cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/80" />
                    <div className="flex flex-col items-center gap-3 z-10">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover/video:scale-110 transition-transform duration-200">
                        <Play className="h-6 w-6 text-white ml-0.5 fill-white/90" />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">Preview 9:16</span>
                    </div>
                    {/* Score overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <div className={`${badge.bg} ${badge.border} border backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5`}>
                        <Zap className={`h-3.5 w-3.5 ${badge.text}`} />
                        <span className={`text-lg font-extrabold ${badge.text}`}>
                          {variation.totalScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Summary */}
                  <div className="px-5 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-white">
                          {variation.totalScore}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">/100</span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold ${badge.text} ${badge.bg} ${badge.border} border px-2.5 py-1 rounded-full uppercase tracking-wider`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* 7 Score Axes as progress bars */}
                    <div className="space-y-2">
                      {variation.scores.map((axis) => (
                        <div key={axis.key} className="flex items-center gap-2">
                          <div className="text-zinc-500 shrink-0">{axis.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-semibold text-zinc-400 truncate">
                                {axis.label}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-300 ml-1 shrink-0">
                                {axis.value}
                                <span className="text-zinc-600 font-normal ml-0.5">
                                  ({axis.weight}%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getBarColor(axis.value)} rounded-full transition-all duration-700`}
                                style={{ width: `${axis.value}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Caption + Hashtags */}
                  <div className="px-5 py-3 space-y-2">
                    <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-xl p-3 space-y-2">
                      <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3">
                        {variation.caption}
                      </p>
                      <p className="text-[10px] text-amber-500/70 font-medium line-clamp-2">
                        {variation.hashtags}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${variation.caption}\n\n${variation.hashtags}`);
                          showToast('Caption e hashtags copiados!');
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-amber-400 transition-colors"
                      >
                        <Clipboard className="h-3 w-3" /> Copiar texto
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="px-5 pb-5 pt-1 mt-auto space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setPromptModal({ open: true, variation });
                          setPromptTab('veo3');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-[1.02]"
                      >
                        <FileText className="h-3.5 w-3.5 text-amber-500" /> Exportar Prompt
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-[1.02]"
                        onClick={() => showToast('Download iniciado!')}
                      >
                        <Download className="h-3.5 w-3.5 text-zinc-400" /> Baixar
                      </button>
                    </div>
                    <button
                      onClick={() => handleCreateProject(variation, job.sourceUrl)}
                      disabled={!!variation.projectId || creatingProject === variation.id}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-[1.02] ${
                        variation.projectId
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/10'
                      } disabled:opacity-60 disabled:pointer-events-none`}
                    >
                      {creatingProject === variation.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Criando...
                        </>
                      ) : variation.projectId ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" /> Projeto Criado
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3.5 w-3.5" /> Criar Projeto
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ==================== SECTION D: PROMPT EXPORT MODAL ==================== */}
      {promptModal.open && promptModal.variation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPromptModal({ open: false, variation: null })}
          />

          {/* Modal */}
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-900/95 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-zinc-950/80 flex flex-col overflow-hidden backdrop-blur-xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" /> Exportar Prompt — Variação{' '}
                  {promptModal.variation.index}
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Prompt otimizado seguindo regras anti-bug: 9:16, ~8s por cena, personagem-âncora
                  fixo, câmera explícita.
                </p>
              </div>
              <button
                onClick={() => setPromptModal({ open: false, variation: null })}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Model Selector Tabs */}
            <div className="px-6 pt-4 shrink-0">
              <div className="flex gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80">
                {(['veo3', 'seedance', 'kling'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPromptTab(tab)}
                    className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      promptTab === tab
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {tab === 'veo3'
                      ? 'Veo 3'
                      : tab === 'seedance'
                      ? 'Seedance'
                      : 'Kling'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Content */}
            <div className="px-6 py-4 flex-1 overflow-y-auto min-h-0">
              <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[55vh] overflow-y-auto selection:bg-amber-500/30">
                {promptModal.variation.prompts[promptTab]}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800/60 flex items-center justify-between shrink-0 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-[11px] text-zinc-500">
                  Anti-bug: sem texto na tela, negative prompt por cena, personagem-âncora idêntico
                </span>
              </div>
              <button
                onClick={() =>
                  handleCopyPrompt(promptModal.variation!.prompts[promptTab])
                }
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] ${
                  copySuccess
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/15'
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
