'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Check, 
  Copy, 
  ArrowRight,
  RefreshCw,
  Info,
  HelpCircle
} from 'lucide-react';

export default function Roteirizador() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id');
  const trechoIdParam = searchParams?.get('trechoId');

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [trecho, setTrecho] = useState<any>(null);
  
  // Script fields
  const [roteiroId, setRoteiroId] = useState<string | null>(null);
  const [tema, setTema] = useState('');
  const [gancho, setGancho] = useState('');
  const [corpo, setCorpo] = useState('');
  const [cta, setCta] = useState('');
  const [falar, setFalar] = useState('');
  const [variacoesGancho, setVariacoesGancho] = useState<string[]>([]);
  
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadData(projectId, trechoIdParam);
    }
  }, [projectId, trechoIdParam]);

  const loadData = async (projId: string, trId?: string | null) => {
    try {
      setLoading(true);
      const proj = await db.projetos.get(projId);
      if (!proj) return;
      setProject(proj);

      let selectedTrecho = null;
      if (trId) {
        const cuts = await db.trechos.list(projId); // wait, db.trechos.list takes video_fonte_id. Let's find it.
        const videos = await db.videos_fonte.list(projId);
        if (videos && videos.length > 0) {
          const cutsList = await db.trechos.list(videos[0].id);
          selectedTrecho = cutsList.find((c: any) => c.id === trId) || cutsList[0];
        }
      } else {
        const videos = await db.videos_fonte.list(projId);
        if (videos && videos.length > 0) {
          const cutsList = await db.trechos.list(videos[0].id);
          selectedTrecho = cutsList.find((c: any) => c.aprovado) || cutsList[0];
        }
      }

      if (selectedTrecho) {
        setTrecho(selectedTrecho);
        
        // Check if script already exists
        const roteiros = await db.roteiros.list(selectedTrecho.id);
        if (roteiros && roteiros.length > 0) {
          const r = roteiros[0];
          setRoteiroId(r.id);
          setTema(r.tema || '');
          setGancho(r.gancho || '');
          setCorpo(r.corpo || '');
          setCta(r.cta || '');
          setFalar(r.falar || '');
          setVariacoesGancho(r.variacoes_gancho_json || []);
        } else {
          // Auto generate script if not exists
          await generateInitialScript(proj.nome, selectedTrecho);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialScript = async (projectName: string, targetTrecho: any) => {
    if (!targetTrecho) return;
    try {
      setGenerating(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const systemPrompt = `Você é o roteirista oficial dos 'Irmãos na Obra' (@irmaosnaobra__), com foco em energia solar e construção civil em Uberlândia-MG (região de atuação da concessionária Cemig).
Sua missão é criar roteiros de react altamente engajantes e virais baseados em trechos de outros vídeos.
O roteiro deve possuir uma estrutura clara:
1. Tema (curto)
2. Gancho (uma frase de impacto de até 3 segundos que prende a atenção imediata)
3. Corpo (a reacao técnica com humor e autoridade, agregando valor sobre obra ou placa solar e Cemig)
4. CTA (uma chamada direta para comentar "QUERO" no Instagram ou seguir o canal)
5. Falar (o texto corrido completo que o avatar HeyGen lerá)
6. Variacoes do Gancho (array com 3 opções adicionais de ganchos curtos para teste)

Retorne estritamente em formato JSON válido:
{
  "tema": "Tema curto do roteiro",
  "gancho": "O gancho principal curto",
  "corpo": "O corpo explicativo de react",
  "cta": "O CTA de engajamento",
  "falar": "O roteiro final contínuo para leitura do avatar",
  "variacoes_gancho": [
    "Variação de gancho 1",
    "Variação de gancho 2",
    "Variação de gancho 3"
  ]
}`;

      const userPrompt = `Gere o roteiro de react para o perfil Irmãos na Obra a partir deste trecho de vídeo transcrevido:
"${targetTrecho.transcricao}"
Motivo do corte: ${targetTrecho.motivo}
Nome do projeto: ${projectName}

O roteiro deve soar natural para o público brasileiro, dinâmico e focado no mercado de construção ou placas solares.`;

      const aiRes = await fetch(`${apiUrl}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          prompt: userPrompt
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const aiText = aiData.content?.[0]?.text || aiData.content || '{}';
        
        try {
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : aiText;
          const parsed = JSON.parse(cleanJson);
          
          setTema(parsed.tema || 'Análise de Obra');
          setGancho(parsed.gancho || '');
          setCorpo(parsed.corpo || '');
          setCta(parsed.cta || '');
          setFalar(parsed.falar || '');
          setVariacoesGancho(parsed.variacoes_gancho || []);
        } catch (err) {
          console.error("Erro no parse do script:", aiText);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateSpeakingScript = (newGancho: string, newCorpo: string, newCta: string) => {
    // Keep speaking text updated when edits occur
    const complete = `${newGancho} ${newCorpo} ${newCta}`.trim();
    setFalar(complete);
  };

  const handleApplyHookVariation = (hook: string) => {
    setGancho(hook);
    handleUpdateSpeakingScript(hook, corpo, cta);
  };

  const handleSave = async (approve = false) => {
    if (!trecho || !project) return;
    try {
      setLoading(true);
      const konuşmaMetni = falar.trim() || `${gancho} ${corpo} ${cta}`.trim();
      
      if (roteiroId) {
        await db.roteiros.update(roteiroId, {
          tema,
          gancho,
          corpo,
          cta,
          falar: konuşmaMetni,
          variacoes_gancho_json: variacoesGancho,
          aprovado: approve
        });
      } else {
        const newRoteiro = await db.roteiros.create(
          trecho.id,
          tema,
          gancho,
          corpo,
          cta,
          konuşmaMetni,
          variacoesGancho
        );
        setRoteiroId(newRoteiro.id);
        if (approve) {
          await db.roteiros.update(newRoteiro.id, { aprovado: true });
        }
      }

      if (approve) {
        // Update project status to allow studio step
        await db.projetos.update(project.id, { status: 'concluido' });
        router.push(`/estudio?id=${project.id}`);
      } else {
        alert('Roteiro salvo com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o roteiro.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(falar);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => router.push(project ? `/novo-projeto?id=${project.id}` : '/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Etapa 1
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Etapa 2: Roteirizador de React</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Revise a cópia do roteiro, mude o gancho ou reescreva o conteúdo de react técnico.
          </p>
        </div>

        <button
          onClick={() => project && trecho && generateInitialScript(project.nome, trecho)}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-500 hover:text-amber-400 border border-zinc-850 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
          Regerar Roteiro com IA
        </button>
      </div>

      {generating || loading && !tema ? (
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500 font-semibold">Escrevendo roteiro original com Claude...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Editor Form Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Editor de Roteiro
              </h3>

              {/* Tema */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tema do Vídeo</label>
                <input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Instalação de Placas Solares"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
                />
              </div>

              {/* Gancho */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    1. Gancho de Impacto (0s - 3s)
                    <HelpCircle className="h-3.5 w-3.5 text-zinc-600" title="Frase curta para segurar a retenção no Reels." />
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-500">{gancho.length} chars</span>
                </div>
                <textarea
                  rows={2}
                  value={gancho}
                  onChange={(e) => {
                    setGancho(e.target.value);
                    handleUpdateSpeakingScript(e.target.value, corpo, cta);
                  }}
                  placeholder="Escreva um gancho matador..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Corpo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    2. Reação e Valor Técnico (Corpo)
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-500">{corpo.length} chars</span>
                </div>
                <textarea
                  rows={5}
                  value={corpo}
                  onChange={(e) => {
                    setCorpo(e.target.value);
                    handleUpdateSpeakingScript(gancho, e.target.value, cta);
                  }}
                  placeholder="Reaja ao vídeo agregando conhecimento de engenharia ou energia solar..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* CTA */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    3. Chamada para Ação (CTA)
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-500">{cta.length} chars</span>
                </div>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => {
                    setCta(e.target.value);
                    handleUpdateSpeakingScript(gancho, corpo, e.target.value);
                  }}
                  placeholder="Ex: Comente SOLAR para fazer seu orçamento sem compromisso!"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Speaking voice preview box */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-zinc-300">Transcrição para Leitura do Avatar (HeyGen)</h4>
                <button
                  onClick={handleCopyToClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold"
                >
                  {copySuccess ? (
                    <><Check className="h-3.5 w-3.5" /> Copiado</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copiar Texto</>
                  )}
                </button>
              </div>

              <textarea
                rows={4}
                value={falar}
                onChange={(e) => setFalar(e.target.value)}
                placeholder="Roteiro corrido completo que será narrado..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-amber-500/50 outline-none transition-colors leading-relaxed font-sans"
              />
              <div className="flex items-center gap-2 text-zinc-500 text-[11px] bg-zinc-900/50 p-3 rounded-lg border border-zinc-900">
                <Info className="h-4 w-4 text-amber-500/80 shrink-0" />
                <span>O texto acima é o que de fato será falado pelo Avatar do HeyGen. Edições diretas no texto corrido acima serão preservadas na renderização do vídeo.</span>
              </div>
            </div>
          </div>

          {/* Sidebar hook options & Save */}
          <div className="space-y-6">
            {/* Hook variations */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Variações de Ganchos
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Clique em um gancho alternativo gerado pelo Claude para testá-lo no roteiro atual.
                </p>
              </div>

              <div className="space-y-3">
                {variacoesGancho.map((hook, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyHookVariation(hook)}
                    className="w-full text-left bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-700/60 border border-zinc-850 p-3.5 rounded-xl text-xs text-zinc-300 hover:text-white leading-normal transition-all"
                  >
                    <span className="font-bold text-[10px] text-amber-500 block mb-1">VARIAÇÃO {index + 1}</span>
                    "{hook}"
                  </button>
                ))}
              </div>
            </div>

            {/* Original Clip Info */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Referência Original</h4>
              <p className="text-xs text-zinc-400 italic line-clamp-4 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                "{trecho?.transcricao}"
              </p>
            </div>

            {/* Bottom buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01]"
              >
                Aprovar Roteiro e ir ao Estúdio <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 py-3 rounded-xl text-xs font-semibold transition-colors"
              >
                Salvar Rascunho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
