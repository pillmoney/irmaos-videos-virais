'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getApiUrl, safeFetch } from '@/lib/utils';
import { 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  Zap, 
  BrainCircuit, 
  Sliders, 
  TrendingUp, 
  Eye, 
  ChevronRight, 
  Plus, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  Play,
  Film,
  Award,
  Info
} from 'lucide-react';

export default function FunilElite() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'ideacao' | 'autocritica' | 'preview' | 'render' | 'testes'>('ideacao');
  const [loading, setLoading] = useState(false);
  const [ideationTopic, setIdeationTopic] = useState('Como economizar 90% na conta de luz com painel solar da Cemig');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [funnelStats, setFunnelStats] = useState<any[]>([]);
  
  // States for self-critique simulation
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [critiqueRunning, setCritiqueRunning] = useState(false);
  const [critiqueLogs, setCritiqueLogs] = useState<any[]>([]);
  const [critiqueScriptResult, setCritiqueScriptResult] = useState<any>(null);
  
  // Previews list
  const [previews, setPreviews] = useState<any[]>([
    { id: 'pr1', title: 'Erros na fundação da casa que o pedreiro escondeu', score: 92, decision: 'avancou', checks: [
      { desc: 'Bate com o brief/roteiro', status: true },
      { desc: 'Fidelidade da marca/produtos', status: true },
      { desc: 'Gancho visual scroll-stop de 0-3s', status: true },
      { desc: 'Qualidade do áudio/lip-sync', status: true }
    ]},
    { id: 'pr2', title: 'Reação a telhado sem inclinação correta', score: 82, decision: 'borderline_revisar', checks: [
      { desc: 'Bate com o brief/roteiro', status: true },
      { desc: 'Fidelidade da marca/produtos', status: true },
      { desc: 'Gancho visual scroll-stop de 0-3s', status: false },
      { desc: 'Qualidade do áudio/lip-sync', status: true }
    ]}
  ]);

  // Renders / Render Queue list
  const [renderQueue, setRenderQueue] = useState<any[]>([
    { id: 'rq1', title: 'Erros na fundação da casa que o pedreiro escondeu', modulo: 'A', costEstimate: 1.2, budgetSpent: 120.0, budgetCap: 500.0, status: 'pronto' },
    { id: 'rq2', title: 'Reação a telhado sem inclinação correta', modulo: 'A', costEstimate: 1.2, budgetSpent: 495.0, budgetCap: 500.0, status: 'cap_excedido' }
  ]);

  // Live Tests list
  const [liveTests, setLiveTests] = useState<any[]>([
    { id: 'lt1', title: 'A taxa secreta da Cemig que você paga sem saber', views: '18.4K', commentSpeed: 'Alta (42/hora)', saves: 310, shares: 145, nonfollowers: '88%', benchmark: 'Bateu', decision: 'escalar' },
    { id: 'lt2', title: 'Limpeza de painel solar com água com cloro', views: '450', commentSpeed: 'Baixa (2/hora)', saves: 12, shares: 5, nonfollowers: '12%', benchmark: 'Abaixo', decision: 'arquivar' }
  ]);

  useEffect(() => {
    loadFunnelMetrics();
  }, []);

  const loadFunnelMetrics = async () => {
    try {
      const metrics = await db.funil_metrics.list();
      setFunnelStats(metrics || []);
      
      const savedIdeas = await db.ideias.list();
      setIdeas(savedIdeas || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideationTopic.trim() || loading) return;

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/funil/ideacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho: ideationTopic })
      });
      
      // Save generated ideas to Local DB
      const createdIdeas: any[] = [];
      if (data.ideias && data.ideias.length > 0) {
        for (const idea of data.ideias) {
          const saved = await db.ideias.create(
            'lote_' + Math.random().toString(36).substr(2, 5),
            idea.angulo,
            idea.gancho,
            idea.pre_score,
            'avancou'
          );
          createdIdeas.push(saved);
        }
      }
      
      setIdeas(prev => [...createdIdeas, ...prev]);
      await db.funil_metrics.create(1, 15, createdIdeas.length, (createdIdeas.length / 15) * 100, 0.02, 0.0);
      loadFunnelMetrics();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao rodar ideação.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSelfCritique = async (idea: any) => {
    try {
      setSelectedIdeaId(idea.id);
      setCritiqueRunning(true);
      setCritiqueScriptResult(null);
      setCritiqueLogs([]);

      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/funil/autocritica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gancho: idea.gancho,
          corpo: `Reagir e explicar por que o tema '${idea.angulo}' é crucial no nicho de obras/energia solar no Brasil, indicando o impacto no bolso do morador e dando explicações de qualidade de cimento ou placas.`,
          cta: 'Comente OBRA para receber nosso manual de concreto gratuito no WhatsApp.',
          tema: idea.angulo
        })
      });
      if (data.success && data.data) {
        setCritiqueLogs(data.data.iteracoes || []);
        setCritiqueScriptResult(data.data.final_roteiro || null);
        
        // Save critique event in db
        await db.autocritica.create(
          idea.id,
          data.data.iteracoes.length,
          data.data.iteracoes[0]?.score_antes || 70,
          data.data.final_roteiro?.score_final || 85,
          data.data.iteracoes.map((i: any) => i.critica).join(' | '),
          true
        );
        
        await db.funil_eventos.create(idea.id, 2, 'ia', 'avancou', 0.15);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao rodar loop de auto-crítica.');
    } finally {
      setCritiqueRunning(false);
    }
  };

  const handleRunPreviewValidation = async (previewId: string) => {
    try {
      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/funil/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview_id: previewId })
      });
      
      // Update local list
      setPreviews(prev => prev.map(p => p.id === previewId ? {
        ...p,
        score: data.score_qa,
        decision: data.decision,
        checks: data.checks
      } : p));
      
      alert(`Validação de IA concluída! Score: ${data.score_qa} (${data.decision.replace('_', ' ')})`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerRender = async (queueItem: any) => {
    if (queueItem.status === 'cap_excedido') {
      alert('ERRO: Renderização bloqueada! O gasto mensal deste módulo atingiu o orçamento limite configurado na governança.');
      return;
    }
    
    alert(`Renderização completa disparada via HeyGen para o vídeo: "${queueItem.title}". Custo estimado: ${queueItem.costEstimate} créditos HeyGen debitados.`);
    // Remove item from queue as it is now processing
    setRenderQueue(prev => prev.filter(q => q.id !== queueItem.id));
    await db.funil_eventos.create(queueItem.id, 4, 'humano', 'avancou', queueItem.costEstimate);
  };

  // Funnel names mapping for step visuals
  const stagesNames = [
    { num: 1, name: '1. Ideação', icon: Plus, desc: 'Lançar 15 ideias, pré-pontuar' },
    { num: 2, name: '2. Auto-Crítica', icon: BrainCircuit, desc: 'Loop IA até bater score >= 85' },
    { num: 3, name: '3. Preview Barato', icon: Play, desc: 'QA visual e gancho visual IA' },
    { num: 4, name: '4. Render Pago', icon: Film, desc: 'Render HeyGen (check cap de custos)' },
    { num: 5, name: '5. Teste ao Vivo', icon: Eye, desc: 'Benchmark orgânico 1h e 72h' },
    { num: 6, name: '6. Escala Viral', icon: Award, desc: 'Winner library + recalibração' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="h-4 w-4" /> Esteira Operacional de Vídeos
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Funil de Aprovação de Elite</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Garantia de eficiência: matar ideias fracas no texto e queimar render caro apenas em conteúdos com Viral Score validado.
          </p>
        </div>
      </div>

      {/* FUNNEL PERFORMANCE FLOWCHART */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-500" /> Observabilidade do Funil (Métricas Acumuladas)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {stagesNames.map((stage) => {
            const stat = funnelStats.find((s: any) => s.etapa === stage.num);
            const StepIcon = stage.icon;
            return (
              <div key={stage.num} className="bg-zinc-950/70 border border-zinc-900/80 p-4 rounded-xl flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-zinc-850 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-600">ETAPA {stage.num}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-300 block leading-tight">{stage.name}</span>
                  <span className="text-[10px] text-zinc-500 block leading-tight">{stage.desc}</span>
                </div>

                <div className="border-t border-zinc-900/80 pt-2.5 flex justify-between items-end text-[10px] text-zinc-500 font-semibold">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-650">Itens</span>
                    <span className="text-zinc-300 text-xs font-extrabold">{stat ? stat.saidas : '0'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-650">Taxa C.</span>
                    <span className="text-emerald-400 font-extrabold">{stat ? `${stat.taxa_conversao.toFixed(0)}%` : '0%'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPERATIONS CENTER TABS */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-850 overflow-x-auto">
          {[
            { id: 'ideacao', name: 'Etapa 1: Ideação em Massa' },
            { id: 'autocritica', name: 'Etapa 2: Auto-Crítica de Roteiro' },
            { id: 'preview', name: 'Etapa 3: Preview de IA' },
            { id: 'render', name: 'Etapa 4: Renderização & Gates' },
            { id: 'testes', name: 'Etapa 5/6: Testes ao Vivo & Escala' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* TAB 1: MASS IDEATION */}
        {activeTab === 'ideacao' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left: Input */}
            <div className="space-y-6">
              <form onSubmit={handleGenerateIdeas} className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Plus className="h-4.5 w-4.5 text-amber-500" /> Disparar Ideação em Massa
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1">
                    Gere dezenas de ganchos em paralelo. O sistema elimina ideias fracas automaticamente.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nicho / Tema Central</label>
                  <textarea
                    rows={4}
                    required
                    value={ideationTopic}
                    onChange={(e) => setIdeationTopic(e.target.value)}
                    placeholder="Ex: Como economizar na fiação elétrica da casa..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none transition-colors leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !ideationTopic.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Gerando 15 ângulos...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Gerar Idéias e Auto-Cortar
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Curated short-list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-white">Shortlist de Ângulos Virais (Pre-Score &gt;= 80)</h3>
                <span className="text-xs text-zinc-500 font-semibold">{ideas.filter(i => i.status === 'avancou').length} ideias ativas</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {ideas.length === 0 ? (
                  <div className="bg-zinc-950/40 border border-dashed border-zinc-900 rounded-xl py-16 text-center text-zinc-500 text-xs">
                    Nenhuma ideia gerada ainda neste lote.
                  </div>
                ) : (
                  ideas.map((idea) => (
                    <div 
                      key={idea.id} 
                      className={`border p-4.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        idea.status === 'cortada' 
                          ? 'border-zinc-900/50 bg-zinc-950/10 opacity-40' 
                          : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            idea.status === 'cortada' ? 'bg-zinc-900 text-zinc-500' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {idea.status === 'cortada' ? 'Cortada' : 'Avançou'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold">
                            {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-white">{idea.angulo}</h4>
                        <p className="text-[11px] text-zinc-400 italic">"Gancho: {idea.gancho}"</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">Pre-Score</span>
                          <span className="text-sm font-black text-amber-500">{idea.pre_score}</span>
                        </div>
                        
                        {idea.status !== 'cortada' && (
                          <button
                            onClick={() => {
                              setActiveTab('autocritica');
                              handleRunSelfCritique(idea);
                            }}
                            className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-[10px] font-bold border border-zinc-800"
                          >
                            Auto-Crítica
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SELF-CRITIQUE */}
        {activeTab === 'autocritica' && (
          <div className="grid lg:grid-cols-5 gap-8 animate-fade-in">
            {/* Left: Critique loop logs */}
            <div className="lg:col-span-3 bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <BrainCircuit className="h-4.5 w-4.5 text-amber-500" /> Loop de Auto-Crítica Inteligente (Claude)
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  A IA reescreve e reavalia a copy contra a biblioteca de vencedores antes de solicitar aprovação.
                </p>
              </div>

              {critiqueRunning ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                  <span className="text-xs text-zinc-500 font-semibold">Claude rodando iterações de auto-crítica...</span>
                </div>
              ) : critiqueLogs.length > 0 ? (
                <div className="space-y-4">
                  {critiqueLogs.map((log) => (
                    <div key={log.iteracao} className="bg-zinc-950/80 border border-zinc-900 p-4.5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-xs font-black text-amber-500">Iteração {log.iteracao} / 3</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-500">Score antes: <strong className="text-zinc-400">{log.score_antes}</strong></span>
                          <span className="text-[10px] text-zinc-500">Score depois: <strong className="text-emerald-400">{log.score_depois}</strong></span>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/20 p-3 rounded-lg border border-zinc-900 italic">
                        <strong className="text-zinc-300 block mb-0.5">Apontamento da IA:</strong>
                        "{log.critica}"
                      </div>

                      <div className="space-y-1.5 text-[11px] bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                        <strong className="text-zinc-300 block mb-1">Cópia Melhorada no Loop:</strong>
                        <p><span className="text-amber-500 font-bold">Gancho:</span> {log.roteiro_melhorado?.gancho}</p>
                        <p><span className="text-amber-500 font-bold">Corpo:</span> {log.roteiro_melhorado?.corpo}</p>
                        <p><span className="text-amber-500 font-bold">CTA:</span> {log.roteiro_melhorado?.cta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-500 text-xs">
                  Selecione uma ideia na Etapa 1 e dispare a auto-crítica para ver o loop rodar.
                </div>
              )}
            </div>

            {/* Right: Final Script & Gate Exception */}
            <div className="lg:col-span-2 space-y-6">
              {critiqueScriptResult && (
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-5 animate-fade-in">
                  <div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                      Régua Superada
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">Roteiro Final Otimizado</h3>
                  </div>

                  <div className="space-y-3 text-xs bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                    <p><span className="text-amber-500 font-bold block mb-0.5">Gancho Final:</span> {critiqueScriptResult.gancho}</p>
                    <p><span className="text-amber-500 font-bold block mb-0.5">Corpo Final:</span> {critiqueScriptResult.corpo}</p>
                    <p><span className="text-amber-500 font-bold block mb-0.5">CTA Final:</span> {critiqueScriptResult.cta}</p>
                  </div>

                  <div className="flex justify-between items-center py-2 border-y border-zinc-900 text-xs">
                    <span className="text-zinc-500 font-semibold">Viral Score Final:</span>
                    <span className="text-lg font-black text-emerald-400">{critiqueScriptResult.score_final} / 100</span>
                  </div>

                  {/* Batch Approval Gate Exception */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-[10px] text-zinc-500 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900">
                      <Info className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Como o roteiro superou a régua de 85, a IA auto-aprovou e encaminhou direto para o Preview. Nenhuma ação humana é obrigatória aqui.</span>
                    </div>

                    <button
                      onClick={() => {
                        alert('Roteiro aprovado e encaminhado para o Preview visual de IA!');
                        setCritiqueScriptResult(null);
                        setCritiqueLogs([]);
                        setActiveTab('preview');
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-3 rounded-xl text-xs font-bold transition-all"
                    >
                      Confirmar e Ir para Preview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CHEAP PREVIEW */}
        {activeTab === 'preview' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            {previews.map((p) => (
              <div key={p.id} className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500">PROVA VISUAL RASCUNHO</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      p.decision === 'avancou' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.decision.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-3 leading-snug">{p.title}</h4>
                </div>

                {/* Validation checklist */}
                <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-xl space-y-3 my-3">
                  <strong className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-1.5">Checks de Validação da IA:</strong>
                  <div className="space-y-2">
                    {p.checks.map((c: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{c.desc}</span>
                        {c.status ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-t border-zinc-900">
                  <span className="text-zinc-500 font-semibold">QA Score:</span>
                  <span className="font-extrabold text-white">{p.score} / 100</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleRunPreviewValidation(p.id)}
                    className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-850 py-2.5 rounded-xl text-[10px] font-bold transition-all"
                  >
                    Regerar Check
                  </button>
                  <button
                    onClick={() => {
                      alert('Item aprovado no preview visual e movido para fila de render completo.');
                      setPreviews(prev => prev.filter(item => item.id !== p.id));
                      setActiveTab('render');
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 py-2.5 rounded-xl text-[10px] font-bold transition-all"
                  >
                    Liberar para Render
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: RENDER & COST GATES */}
        {activeTab === 'render' && (
          <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
            <div className="px-1">
              <h3 className="text-sm font-bold text-white">Fila de Renderização Completa (Custos Elevados - HeyGen/Seedance)</h3>
              <p className="text-zinc-500 text-xs mt-0.5">O sistema estima o custo e bloqueia a criação se estourar o cap mensal configurado na Governança.</p>
            </div>

            <div className="space-y-3">
              {renderQueue.map((item) => (
                <div key={item.id} className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        Módulo {item.modulo}
                      </span>
                      {item.status === 'cap_excedido' && (
                        <span className="text-[9px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Bloqueado: Cap Excedido
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                    
                    <div className="flex gap-4 mt-2 text-[10px] text-zinc-500 font-semibold">
                      <span>Custo Estimado: <strong className="text-zinc-300">{item.costEstimate} créditos HeyGen</strong></span>
                      <span>Orçamento Módulo Consumido: <strong className="text-zinc-300">${item.budgetSpent} / ${item.budgetCap}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-auto flex items-center gap-3">
                    <button
                      onClick={() => handleTriggerRender(item)}
                      disabled={item.status === 'cap_excedido'}
                      className={`px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        item.status === 'cap_excedido'
                          ? 'bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black shadow-lg hover:scale-[1.01]'
                      }`}
                    >
                      Aprovar Render Pago
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE TESTS & SCALE */}
        {activeTab === 'testes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="px-1">
              <h3 className="text-sm font-bold text-white">Etapa 5 & 6: Testes ao Vivo & Compounding Algorítmico</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Sinais medidos na primeira 1h e 72h. Apenas os que superam os benchmarks recebem escala e realimentam a biblioteca.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {liveTests.map((t) => (
                <div key={t.id} className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        t.decision === 'escalar' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {t.decision === 'escalar' ? 'Bateu Benchmark' : 'Arquivado'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">Instagram Reels</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white leading-snug">{t.title}</h4>
                    
                    {/* Live Stats */}
                    <div className="grid grid-cols-4 gap-2 text-center py-2.5 bg-zinc-950 rounded-xl border border-zinc-900">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block uppercase">Views</span>
                        <span className="text-xs font-extrabold text-zinc-200">{t.views}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block uppercase">Velocidade C.</span>
                        <span className="text-xs font-extrabold text-zinc-200">{t.commentSpeed.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block uppercase">Saves</span>
                        <span className="text-xs font-extrabold text-zinc-200">{t.saves}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block uppercase">Compartilh.</span>
                        <span className="text-xs font-extrabold text-zinc-200">{t.shares}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-4 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Decisão Automática:</span>
                    <span className={`font-black uppercase tracking-widest ${t.decision === 'escalar' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {t.decision === 'escalar' ? '🚀 Impulsionar / Boost verba' : '📁 Arquivar para Aprendizado'}
                    </span>
                  </div>

                  {t.decision === 'escalar' && (
                    <button
                      onClick={() => {
                        alert('Sucesso! Vídeo adicionado à Biblioteca de Vencedores dos últimos 7 dias. Os pesos do Viral Score foram recalibrados automaticamente com base nestes dados de engajamento.');
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-3 rounded-xl text-xs font-bold transition-all mt-2"
                    >
                      Alimentar Biblioteca de Vencedores (Etapa 6)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
