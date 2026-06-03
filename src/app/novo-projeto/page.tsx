'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Link2, 
  Play, 
  Sparkles, 
  Scissors, 
  Activity, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ListRestart,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function NovoProjeto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams?.get('id');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Ingestion, 2: Processing, 3: Review Cuts
  const [videoUrl, setVideoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [duration, setDuration] = useState('60');
  
  // Status flags during processing
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [activeStatus, setActiveStatus] = useState('');
  
  // Results
  const [project, setProject] = useState<any>(null);
  const [videoFonte, setVideoFonte] = useState<any>(null);
  const [trechos, setTrechos] = useState<any[]>([]);
  const [selectedTrecho, setSelectedTrecho] = useState<string | null>(null);

  useEffect(() => {
    if (projectIdParam) {
      loadExistingProject(projectIdParam);
    }
  }, [projectIdParam]);

  const loadExistingProject = async (id: string) => {
    try {
      setLoading(true);
      const proj = await db.projetos.get(id);
      if (proj) {
        setProject(proj);
        setProjectName(proj.nome);
        
        const videos = await db.videos_fonte.list(id);
        if (videos && videos.length > 0) {
          const vf = videos[0];
          setVideoFonte(vf);
          setVideoUrl(vf.url);
          
          const cuts = await db.trechos.list(vf.id);
          if (cuts && cuts.length > 0) {
            setTrechos(cuts);
            setSelectedTrecho(cuts[0].id);
            setStep(3);
          } else {
            setStep(2);
            // Re-run analysis or show that it needs analysis
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (log: string) => {
    setStatusLogs(prev => [...prev, log]);
    setActiveStatus(log);
  };

  const handleStartProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    try {
      setLoading(true);
      setStep(2);
      setStatusLogs([]);
      
      // 1. Create project if not exists
      addLog('Iniciando projeto e preparando banco de dados...');
      const name = projectName.trim() || `Projeto Viral - ${new Date().toLocaleDateString('pt-BR')}`;
      let currentProject = project;
      if (!currentProject) {
        currentProject = await db.projetos.create(name);
        setProject(currentProject);
      } else if (name !== currentProject.nome) {
        currentProject = await db.projetos.update(currentProject.id, { nome: name });
        setProject(currentProject);
      }

      // 2. Fetch and trim video through local Flask API
      addLog('Conectando ao Youtube/Redes Sociais e extraindo vídeo...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const analyzeRes = await fetch(`${apiUrl}/api/analyze-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: videoUrl,
          start_time: startTime,
          duration: parseFloat(duration)
        })
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.error || 'Erro ao processar o vídeo no servidor local.');
      }

      const videoData = await analyzeRes.json();
      addLog('Vídeo baixado, cortado no formato vertical 9:16 e transcrevido!');

      // Save video_fonte in DB
      const vf = await db.videos_fonte.create(
        currentProject.id,
        videoData.original_url || videoUrl,
        videoUrl.includes('tiktok') ? 'tiktok' : videoUrl.includes('instagram') ? 'instagram' : 'youtube',
        parseFloat(duration),
        { text: videoData.transcript, processed_url: videoData.video_url, title: videoData.title }
      );
      setVideoFonte(vf);

      // 3. AI Analysis with Claude (Anthropic Proxy) to score viral hook and extract top clips
      addLog('Enviando transcrição para o Claude AI analisar a viralidade do gancho...');
      
      const systemPrompt = `Você é um analista especializado em vídeos curtos virais de Reels/TikTok no nicho de construção civil e energia solar no Brasil (estilo da conta @irmaosnaobra__).
Sua tarefa é analisar a transcrição de um vídeo e identificar os melhores trechos de corte (gancho forte, corpo, relevância para o público).
Você deve retornar uma resposta JSON contendo um array de 1 a 2 trechos recomendados para corte. 
Formato JSON estrito a retornar:
{
  "trechos": [
    {
      "inicio_ms": 0,
      "fim_ms": 15000,
      "score_viral": 9.5,
      "motivo": "Explicação curta do porquê esse trecho é viral no nicho de obra/solar",
      "transcricao_corte": "Trecho exato da transcrição correspondente a este intervalo"
    }
  ]
}`;

      const userPrompt = `Analise o seguinte vídeo transcrevido:
Título original: ${videoData.title}
Transcrição completa: ${videoData.transcript}

Identifique os trechos mais virais que representam erros na obra, dúvidas de energia solar, ou curiosidades de construção. Estime os tempos de início e fim em milissegundos dentro do limite total de ${parseFloat(duration) * 1000} ms. Retorne estritamente o JSON válido.`;

      const aiRes = await fetch(`${apiUrl}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          prompt: userPrompt
        })
      });

      let parsedCuts = [];
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const aiText = aiData.content?.[0]?.text || aiData.content || '{}';
        
        try {
          // Extract JSON if wrapped in markdown
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : aiText;
          const parsed = JSON.parse(cleanJson);
          parsedCuts = parsed.trechos || [];
          addLog('Análise de IA concluída com sucesso!');
        } catch (jsonErr) {
          console.error("Erro ao fazer parse do JSON da IA:", aiText);
          parsedCuts = [];
        }
      }

      // Se falhar a IA ou não extrair nada, cria um trecho padrão com a duração inteira
      if (parsedCuts.length === 0) {
        addLog('IA não retornou formato padrão. Criando corte padrão do vídeo inteiro...');
        parsedCuts = [{
          inicio_ms: 0,
          fim_ms: parseFloat(duration) * 1000,
          score_viral: 7.5,
          motivo: "Vídeo completo analisado como corte único devido à curta duração.",
          transcricao_corte: videoData.transcript.substring(0, 300)
        }];
      }

      // Save cuts in database
      const savedCuts = [];
      for (const cut of parsedCuts) {
        const saved = await db.trechos.create(
          vf.id,
          cut.inicio_ms,
          cut.fim_ms,
          cut.score_viral,
          cut.motivo,
          cut.transcricao_corte
        );
        savedCuts.push(saved);
      }

      setTrechos(savedCuts);
      if (savedCuts.length > 0) {
        setSelectedTrecho(savedCuts[0].id);
      }

      // Update project status
      await db.projetos.update(currentProject.id, { status: 'aguardando_aprovacao' });
      
      setStep(3);
    } catch (err: any) {
      console.error(err);
      addLog(`ERRO: ${err.message || 'Erro inesperado durante o processamento'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCut = async () => {
    if (!selectedTrecho || !project) return;
    try {
      setLoading(true);
      // Approve the selected cut
      await db.trechos.update(selectedTrecho, { aprovado: true });
      
      // Navigate to Script editing page (Step 2)
      router.push(`/roteiro?id=${project.id}&trechoId=${selectedTrecho}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Etapa 1: Ingestão & Corte Viral</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Insira o link do vídeo de referência, recorte a melhor parte e analise a relevância do gancho com IA.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 bg-zinc-900/20 border border-zinc-800/60 p-3.5 rounded-2xl">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${step === 1 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-500'}`}>
          <Link2 className="h-3.5 w-3.5" /> 1. Fonte do Vídeo
        </div>
        <div className="h-px bg-zinc-800 flex-1"></div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${step === 2 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-500'}`}>
          <Activity className="h-3.5 w-3.5" /> 2. Processando
        </div>
        <div className="h-px bg-zinc-800 flex-1"></div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${step === 3 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-500'}`}>
          <Scissors className="h-3.5 w-3.5" /> 3. Escolha do Corte
        </div>
      </div>

      {/* STEP 1: INGESTION FORM */}
      {step === 1 && (
        <form onSubmit={handleStartProcess} className="bg-zinc-900/30 border border-zinc-800/80 p-8 rounded-2xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-zinc-300">Nome do Projeto (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Reação ao Erro de Conexão Solar de Uberlândia"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-zinc-300">Link do Vídeo (YouTube, Reels ou TikTok)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Cole a URL do vídeo aqui..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 outline-none transition-colors"
                />
                <Link2 className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
              </div>
              <span className="text-[11px] text-zinc-500 block">
                Dica: Você também pode digitar um termo de busca e o sistema pegará o primeiro vídeo do YouTube.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Tempo de Início (MM:SS)</label>
              <input
                type="text"
                required
                placeholder="00:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500/50 outline-none transition-colors text-center font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300">Duração do Corte (Segundos)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
              >
                <option value="15">15 Segundos (Rápido)</option>
                <option value="30">30 Segundos (Ideal)</option>
                <option value="45">45 Segundos</option>
                <option value="60">60 Segundos (Recomendado)</option>
                <option value="90">90 Segundos</option>
                <option value="120">120 Segundos (Máximo)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={!videoUrl}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white px-6 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01]"
            >
              Baixar e Analisar Vídeo <Play className="h-4 w-4 fill-current stroke-none" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PROCESSING LOGS */}
      {step === 2 && (
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Processando Vídeo e Transcrição</h3>
            <p className="text-zinc-500 text-sm max-w-md">
              O vídeo está sendo baixado em alta definição, cortado na proporção Reels (9:16) e analisado pela IA do Claude.
            </p>
          </div>

          {/* Console / Logs frame */}
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 text-left font-mono text-xs text-zinc-400 h-48 overflow-y-auto space-y-2.5">
            {statusLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-500/80 shrink-0">➜</span>
                <span className={idx === statusLogs.length - 1 ? 'text-zinc-200 font-bold' : ''}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: CUTS REVIEW & SELECTION */}
      {step === 3 && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Video Preview and Transcripts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video preview card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="h-4 w-4 text-amber-500 fill-amber-500/20" /> Vídeo Fonte Cortado (9:16)
              </h3>
              
              {videoFonte?.transcricao_json?.processed_url ? (
                <div className="relative aspect-[9/16] max-h-[500px] mx-auto overflow-hidden rounded-xl border border-zinc-800 bg-black">
                  <video 
                    src={videoFonte.transcricao_json.processed_url} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm">
                  Preview de vídeo indisponível
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Título do Vídeo</h4>
                <p className="text-sm font-semibold text-zinc-300">{videoFonte?.transcricao_json?.title || 'Título desconhecido'}</p>
              </div>
            </div>

            {/* Transcription card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-amber-500" /> Transcrição Completa
              </h3>
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 h-48 overflow-y-auto text-sm text-zinc-400 leading-relaxed">
                {videoFonte?.transcricao_json?.text || 'Sem transcrição disponível.'}
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis and Selection */}
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Análise de Cortes da IA
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  O Claude analisou a transcrição e sugeriu os seguintes ganchos e trechos virais.
                </p>
              </div>

              {/* Loop cuts */}
              <div className="space-y-4">
                {trechos.map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrecho(t.id)}
                    className={`border p-4.5 rounded-xl transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      selectedTrecho === t.id
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-zinc-400">Opção {idx + 1}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                        Score: {t.score_viral.toFixed(1)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.floor(t.inicio_ms / 1000)}s - {Math.floor(t.fim_ms / 1000)}s ({(t.fim_ms - t.inicio_ms) / 1000}s)
                      </div>
                      <p className="text-zinc-300 font-medium leading-normal text-xs">{t.motivo}</p>
                    </div>

                    <div className="text-[11px] text-zinc-500 line-clamp-2 bg-zinc-950 p-2 rounded-lg border border-zinc-900 italic">
                      "{t.transcricao}"
                    </div>
                  </div>
                ))}
              </div>

              {/* Approval Buttons */}
              <div className="border-t border-zinc-800/60 pt-5 space-y-3">
                <button
                  onClick={handleApproveCut}
                  disabled={!selectedTrecho || loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01]"
                >
                  Aprovar Corte e Roteirizar <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setTrechos([]);
                    setSelectedTrecho(null);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 py-3 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ListRestart className="h-3.5 w-3.5" /> Recomeçar Ingestão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
