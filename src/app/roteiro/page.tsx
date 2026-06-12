'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getApiUrl, safeFetch } from '@/lib/utils';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Check, 
  Copy, 
  ArrowRight,
  RefreshCw,
  Info,
  HelpCircle,
  Gauge,
  AlertTriangle
} from 'lucide-react';

function RoteirizadorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id');
  const trechoIdParam = searchParams?.get('trechoId');

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [trecho, setTrecho] = useState<any>(null);
  const [videoFonte, setVideoFonte] = useState<any>(null);
  
  // Script fields
  const [roteiroId, setRoteiroId] = useState<string | null>(null);
  const [tema, setTema] = useState('');
  const [gancho, setGancho] = useState('');
  const [corpo, setCorpo] = useState('');
  const [cta, setCta] = useState('');
  const [falar, setFalar] = useState('');

  // Viral Score states
  const [viralScoreLoading, setViralScoreLoading] = useState(false);
  const [viralScoreData, setViralScoreData] = useState<any>(null);
  const [limiarRampa, setLimiarRampa] = useState(80);
  
  // Option fields (3 options of each)
  const [tituloOpcoes, setTituloOpcoes] = useState<string[]>(['', '', '']);
  const [ganchoOpcoes, setGanchoOpcoes] = useState<string[]>(['', '', '']);
  const [corpoOpcoes, setCorpoOpcoes] = useState<string[]>(['', '', '']);
  const [ctaOpcoes, setCtaOpcoes] = useState<string[]>(['', '', '']);
  
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
      let vf: any = null;
      const videos = await db.videos_fonte.list(projId);
      if (videos && videos.length > 0) {
        vf = videos[0];
        setVideoFonte(vf);
        const cutsList = await db.trechos.list(vf.id);
        if (trId) {
          selectedTrecho = cutsList.find((c: any) => c.id === trId) || cutsList[0];
        } else {
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
          
          try {
            const vs = await db.viral_scores.getForRoteiro(r.id);
            if (vs) {
              setViralScoreData(vs);
            }
          } catch (vsErr) {
            console.error('Erro ao carregar score viral:', vsErr);
          }
          
          let loadedOptions = {
            titulo_opcoes: [r.tema || ''],
            gancho_opcoes: [r.gancho || ''],
            corpo_opcoes: [r.corpo || ''],
            cta_opcoes: [r.cta || '']
          };

          if (r.variacoes_gancho_json) {
            const v = r.variacoes_gancho_json;
            if (v.gancho_opcoes && Array.isArray(v.gancho_opcoes)) {
              // New format
              loadedOptions = {
                titulo_opcoes: Array.isArray(v.titulo_opcoes) ? v.titulo_opcoes : [r.tema || ''],
                gancho_opcoes: v.gancho_opcoes,
                corpo_opcoes: Array.isArray(v.corpo_opcoes) ? v.corpo_opcoes : [r.corpo || ''],
                cta_opcoes: Array.isArray(v.cta_opcoes) ? v.cta_opcoes : [r.cta || '']
              };
            } else if (Array.isArray(v)) {
              // Legacy format
              loadedOptions = {
                titulo_opcoes: v.map((item: any) => typeof item === 'string' ? (r.tema || '') : (item.tema || r.tema || '')),
                gancho_opcoes: v.map((item: any) => typeof item === 'string' ? item : (item.gancho || r.gancho || '')),
                corpo_opcoes: v.map((item: any) => typeof item === 'string' ? (r.corpo || '') : (item.corpo || r.corpo || '')),
                cta_opcoes: v.map((item: any) => typeof item === 'string' ? (r.cta || '') : (item.cta || r.cta || ''))
              };
            }
          }

          const padArray = (arr: string[], defaultVal: string) => {
            const newArr = [...arr];
            while (newArr.length < 3) {
              newArr.push(defaultVal);
            }
            return newArr.slice(0, 3);
          };

          setTituloOpcoes(padArray(loadedOptions.titulo_opcoes, r.tema || ''));
          setGanchoOpcoes(padArray(loadedOptions.gancho_opcoes, r.gancho || ''));
          setCorpoOpcoes(padArray(loadedOptions.corpo_opcoes, r.corpo || ''));
          setCtaOpcoes(padArray(loadedOptions.cta_opcoes, r.cta || ''));
        } else {
          // Auto generate script if not exists
          await generateInitialScript(proj.nome, selectedTrecho, vf);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialScript = async (projectName: string, targetTrecho: any, vfRecord?: any) => {
    if (!targetTrecho) return;
    try {
      setGenerating(true);
      const apiUrl = getApiUrl();
      const sourceVideo = vfRecord || videoFonte;

      const systemPrompt = `Você é um Redator e Copywriter fora de série, mentor em viralização e roteiros de alto impacto no estilo de Alex Hormozi, GaryVee e os maiores criadores de conteúdo do mundo.
Sua missão é criar exatamente 3 opções para cada uma das janelas de um roteiro UGC (Título, Gancho, Corpo e CTA) que adaptam o vídeo de referência de forma disruptiva, imprevisível e altamente magnética para o novo tema selecionado.

Diretrizes de Copywriting (Estilo Hormozi & Fora da Caixa):
1. QUEBRA DE PADRÃO ABSOLUTA: Esqueça ganchos lógicos ou óbvios (ex: "Você quer economizar energia?"). Vá direto ao ponto de impacto ou use uma reviravolta (Plot Twist) ou polêmica (ex: "A internet inteira tá achando que esse vídeo foi feito por IA...", "Se você fizer isso na sua obra, a Cemig vai amar cobrar sua multa...").
2. CONTEÚDO RICO E SETORIAL: Injete fatos reais, termos técnicos do setor (placas de silício monocristalino, microinversores, inclinação de telhado, norma NBR 16690, estrutura de alumínio anodizado) misturados com humor leve, regional (Uberlândia-MG/Minas) e linguagem coloquial de canteiro de obras.
3. COMENTÁRIOS DA INTERNET E REAÇÕES: Imagine o que a comunidade comentaria sobre o vídeo de referência (ex: dúvidas técnicas, ceticismo: "isso é montagem", "está carregando errado", "mulher não dá conta disso") e use esse ceticismo/curiosidade como o gancho para criar engajamento imediato.
4. RITMO E DIÁLOGO CONVERSACIONAL: Frases curtas, ritmo rápido, sem enrolação. Use contraste e analogias fortes.
5. ESTRUTURA DO ROTEIRO:
   - TÍTULO (Curto, instigante, gera clique)
   - GANCHO (0s a 3s: Gancho Hormozi, quebra de padrão total, mistério ou plot twist)
   - CORPO (3s a 12s: Resolução do mistério, explicação técnica real, valor e autoridade)
   - CTA (12s a 15s: Chamada direta sem parecer vendedor chato, ex: "Comenta SOLAR pra ver se seu telhado serve")

Você DEVE gerar exatamente 3 opções para cada uma das seguintes categorias:
- TÍTULO (Título curto do Reels/TikTok)
- GANCHO (Frase de impacto inicial de 0s a 3s)
- CORPO (Explicação técnica de 3s a 12s)
- CTA (Chamada para ação de alta conversão de 12s a 15s)

Retorne estritamente em formato JSON válido com a seguinte estrutura de chaves:
{
  "titulo_opcoes": ["Opção 1", "Opção 2", "Opção 3"],
  "gancho_opcoes": ["Opção 1", "Opção 2", "Opção 3"],
  "corpo_opcoes": ["Opção 1", "Opção 2", "Opção 3"],
  "cta_opcoes": ["Opção 1", "Opção 2", "Opção 3"]
}

NÃO adicione nenhum texto adicional antes ou depois do bloco JSON. Retorne apenas o JSON puro.`;

      const originalTitle = sourceVideo?.transcricao_json?.title || 'Não disponível';
      const originalTranscript = sourceVideo?.transcricao_json?.text || targetTrecho.transcricao || 'Não disponível';

      const userPrompt = `DADOS DO VÍDEO DE REFERÊNCIA ORIGINAL:
- Título original: ${originalTitle}
- Trecho exato para React (Corte): "${targetTrecho.transcricao}"
- Transcrição completa/Contexto: "${originalTranscript.substring(0, 1500)}"
- Motivo de ser viral: ${targetTrecho.motivo}

NOVO TEMA / PRODUTO ALVO DO NOSSO CANAL:
- Tema/Nome do Projeto: "${projectName}"

INSTRUÇÕES EXPECÍFICAS DE ENGENHARIA DE CÓPIA:
1. Extraia o "ceticismo" ou os "comentários da internet" implícitos sobre o vídeo original (ex: "é montagem", "duvido que seja de verdade", "pedreiro fez besteira", "IA que fez").
2. Crie uma copy "fora da caixa" (Out-of-the-box) com base nisso. Use ganchos no estilo Alex Hormozi (Plot twists surpreendentes, quebra de padrão total nos primeiros 3 segundos, perguntas misteriosas e imperativas).
3. Misture fatos técnicos reais da construção/energia solar no Brasil (geração de energia, inversores de string vs microinversores, dimensionamento de cabos, disjuntores, telhas galvalume, etc.) com humor e profissionalismo.
4. Garanta que as opções fujam do óbvio. NADA de "Você já pensou em economizar energia?" ou "O segredo da construção civil". Use o estilo disruptivo!`;

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
          
          if (parsed.titulo_opcoes && parsed.gancho_opcoes && parsed.corpo_opcoes && parsed.cta_opcoes) {
            setTituloOpcoes(parsed.titulo_opcoes);
            setGanchoOpcoes(parsed.gancho_opcoes);
            setCorpoOpcoes(parsed.corpo_opcoes);
            setCtaOpcoes(parsed.cta_opcoes);
            
            // Auto fill with the first options
            const defaultTema = parsed.titulo_opcoes[0] || 'Análise de Obra';
            const defaultGancho = parsed.gancho_opcoes[0] || '';
            const defaultCorpo = parsed.corpo_opcoes[0] || '';
            const defaultCta = parsed.cta_opcoes[0] || '';
            
            setTema(defaultTema);
            setGancho(defaultGancho);
            setCorpo(defaultCorpo);
            setCta(defaultCta);
            setFalar(`${defaultGancho} ${defaultCorpo} ${defaultCta}`.trim());
          }
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

  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const list = await db.projetos.list();
        const count = list ? list.length : 0;
        // Rampa de calibração: começa em 80, sobe 2 pontos por projeto concluído, teto em 95
        const threshold = Math.min(95, 80 + count * 2);
        setLimiarRampa(threshold);
      } catch (err) {
        console.error(err);
      }
    };
    fetchThreshold();
  }, []);

  const calculateViralScore = async () => {
    try {
      setViralScoreLoading(true);
      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/viral-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          gancho,
          corpo,
          cta,
          falar
        })
      });
      if (data.success && data.score_data) {
        setViralScoreData(data.score_data);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao calcular o Viral Score.');
    } finally {
      setViralScoreLoading(false);
    }
  };

  const handleSave = async (approve = false) => {
    if (!trecho || !project) return;
    
    // 1. Enforce Viral Score Check if approving
    let currentScoreData = viralScoreData;
    if (approve && !currentScoreData) {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        const data = await safeFetch(`${apiUrl}/api/viral-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tema,
            gancho,
            corpo,
            cta,
            falar
          })
        });
        currentScoreData = data.score_data;
        setViralScoreData(currentScoreData);
      } catch (err) {
        console.error('Erro ao buscar Viral Score ao aprovar:', err);
      } finally {
        setLoading(false);
      }
    }

    if (approve && currentScoreData && currentScoreData.score_total < limiarRampa) {
      const forceApproval = window.confirm(
        `Atenção: O Viral Score (${currentScoreData.score_total.toFixed(1)}) está abaixo do limiar de calibração da conta (${limiarRampa}).\n\n` +
        `Recomendamos refinar o roteiro para aumentar as chances de viralização.\n\n` +
        `Deseja aprovar e prosseguir mesmo assim? (Forçar Aprovação)`
      );
      if (!forceApproval) {
        return;
      }
    }

    try {
      setLoading(true);
      const konuşmaMetni = falar.trim() || `${gancho} ${corpo} ${cta}`.trim();
      
      const savedOptions = {
        titulo_opcoes: tituloOpcoes,
        gancho_opcoes: ganchoOpcoes,
        corpo_opcoes: corpoOpcoes,
        cta_opcoes: ctaOpcoes
      };
      
      let finalRoteiroId = roteiroId;
      if (finalRoteiroId) {
        await db.roteiros.update(finalRoteiroId, {
          tema,
          gancho,
          corpo,
          cta,
          falar: konuşmaMetni,
          variacoes_gancho_json: savedOptions,
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
          savedOptions as any
        );
        finalRoteiroId = newRoteiro.id;
        setRoteiroId(newRoteiro.id);
        if (approve) {
          await db.roteiros.update(newRoteiro.id, { aprovado: true });
        }
      }

      if (currentScoreData) {
        await db.viral_scores.create(finalRoteiroId!, currentScoreData);
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
          onClick={() => project && trecho && generateInitialScript(tema || project.nome, trecho)}
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
              <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" /> Editor de Roteiro
                </span>
                <span className="text-xs text-zinc-500 font-medium">UGC Script Editor</span>
              </h3>

              {/* Tema / Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Título do Vídeo (Tema)</label>
                <input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Instalação de Placas Solares"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
                />
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {tituloOpcoes.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTema(opt)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all duration-200 text-left line-clamp-1 cursor-pointer ${
                        tema === opt
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                      title={opt}
                    >
                      <span className="text-amber-500 font-bold mr-1">#{idx + 1}</span>
                      {opt || 'Aguardando...'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gancho */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    1. Gancho de Impacto (0s - 3s)
                    <span title="Frase curta para segurar a retenção no Reels.">
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-600" />
                    </span>
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
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {ganchoOpcoes.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setGancho(opt);
                        handleUpdateSpeakingScript(opt, corpo, cta);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all duration-200 text-left line-clamp-2 cursor-pointer h-12 flex items-center leading-tight ${
                        gancho === opt
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                      title={opt}
                    >
                      <span>
                        <span className="text-amber-500 font-bold mr-1 block text-[9px] uppercase tracking-wide">Opção {idx + 1}</span>
                        {opt || 'Aguardando...'}
                      </span>
                    </button>
                  ))}
                </div>
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
                  rows={4}
                  value={corpo}
                  onChange={(e) => {
                    setCorpo(e.target.value);
                    handleUpdateSpeakingScript(gancho, e.target.value, cta);
                  }}
                  placeholder="Reaja ao vídeo agregando conhecimento de engenharia ou energia solar..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors leading-relaxed"
                />
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {corpoOpcoes.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCorpo(opt);
                        handleUpdateSpeakingScript(gancho, opt, cta);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all duration-200 text-left line-clamp-2 cursor-pointer h-12 flex items-center leading-tight ${
                        corpo === opt
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                      title={opt}
                    >
                      <span>
                        <span className="text-amber-500 font-bold mr-1 block text-[9px] uppercase tracking-wide">Opção {idx + 1}</span>
                        {opt || 'Aguardando...'}
                      </span>
                    </button>
                  ))}
                </div>
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
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {ctaOpcoes.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCta(opt);
                        handleUpdateSpeakingScript(gancho, corpo, opt);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-semibold border transition-all duration-200 text-left line-clamp-1 cursor-pointer ${
                        cta === opt
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                      title={opt}
                    >
                      <span className="text-amber-500 font-bold mr-1">#{idx + 1}</span>
                      {opt || 'Aguardando...'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Speaking voice preview box */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-zinc-300">Transcrição para Locução UGC Neural</h4>
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
                <span>O texto acima é o que de fato será falado pela voz neural. Edições diretas no texto corrido acima serão preservadas na geração do áudio.</span>
              </div>
            </div>
          </div>

          {/* Sidebar hook options & Save */}
          <div className="space-y-6">
            {/* CARD 1: MOTOR DE AVALIAÇÃO VIRAL (GATE 1) */}
            <div className="bg-zinc-900/40 border border-zinc-800/85 p-6 rounded-2xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Gauge className="h-4.5 w-4.5 text-amber-500" /> Portão 1: Viral Score
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Limiar: {limiarRampa}%
                </span>
              </div>

              {viralScoreData ? (
                <div className="space-y-4">
                  {/* Score Total */}
                  <div className="text-center py-4 bg-zinc-950/80 rounded-xl border border-zinc-900 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tracking-tight text-white">
                      {viralScoreData.score_total}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                      Probabilidade Prevista
                    </span>
                    
                    {viralScoreData.score_total >= limiarRampa ? (
                      <span className="mt-3 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> Aprovado no Gate
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        className="mt-3 text-[10px] font-extrabold uppercase bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:scale-[1.02] cursor-pointer"
                        title="Clique para forçar a aprovação e ir ao estúdio"
                      >
                        <AlertTriangle className="h-3 w-3 animate-pulse text-amber-500" /> Ignorar Gate & Aprovar
                      </button>
                    )}
                  </div>

                  {/* Detalhes de composição transparente */}
                  <div className="space-y-2.5">
                    {[
                      { name: 'Força do Gancho (0-3s)', score: viralScoreData.hook },
                      { name: 'Estrutura do Copy', score: viralScoreData.estrutura },
                      { name: 'Retenção Prevista', score: viralScoreData.retencao },
                      { name: 'Quebra de Padrão Abertura', score: viralScoreData.quebra_padrao },
                      { name: 'Similaridade Vencedores', score: viralScoreData.similaridade },
                      { name: 'Clareza do CTA', score: viralScoreData.cta },
                      { name: 'Aderência à Plataforma', score: viralScoreData.aderencia }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-zinc-400">{metric.name}</span>
                          <span className={`${metric.score >= limiarRampa ? 'text-emerald-400' : 'text-amber-400'}`}>{metric.score}</span>
                        </div>
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${metric.score >= limiarRampa ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} 
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Motivo do Score */}
                  <div className="bg-zinc-950/50 border border-zinc-900/60 p-3 rounded-xl text-[11px] text-zinc-400 leading-relaxed max-h-32 overflow-y-auto">
                    <strong className="text-zinc-300 block mb-1">Análise do Copiloto:</strong>
                    {viralScoreData.motivo}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs text-zinc-500 max-w-[200px]">Roteiro pendente de avaliação de performance</span>
                </div>
              )}

              <button
                type="button"
                onClick={calculateViralScore}
                disabled={viralScoreLoading || loading}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-amber-500 hover:text-amber-400 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${viralScoreLoading ? 'animate-spin' : ''}`} />
                {viralScoreLoading ? 'Avaliando com Claude...' : 'Avaliar Viral Score'}
              </button>

              {viralScoreData && viralScoreData.score_total < limiarRampa && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-900/40 to-orange-950/40 hover:from-rose-900/60 hover:to-orange-950/60 border border-rose-800/40 hover:border-rose-800/60 text-rose-200 py-3 rounded-xl text-xs font-bold transition-all duration-150"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Aprovar Mesmo Assim (Forçar)
                </button>
              )}
            </div>

            {/* Hook variations replaced by UGC tips */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Estrutura UGC Ads
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Diretrizes de anúncios virais de alta retenção no Reels.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-400">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <strong className="text-amber-500 block mb-0.5">0s - 3s: Gancho UGC</strong>
                  Prenda a atenção imediatamente com uma frase disruptiva ou pergunta polêmica sobre obra/Cemig.
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <strong className="text-amber-500 block mb-0.5">3s - 12s: Explicação Técnica</strong>
                  Apresente a solução de engenharia ou os ganhos de energia solar com humor e clareza.
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                  <strong className="text-amber-500 block mb-0.5">12s - 15s: CTA de Alta Conversão</strong>
                  Peça uma ação simples, como comentar "QUERO" para receber atendimento ou proposta comercial.
                </div>
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

export default function Roteirizador() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-semibold">Carregando roteirizador...</div>}>
      <RoteirizadorContent />
    </Suspense>
  );
}
