'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Send, 
  RefreshCw,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { getApiUrl, safeFetch } from '@/lib/utils';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Estrategista() {
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    username: '@irmaosnaobra__',
    followers: '1.019',
    followersGrowth: '+8.2%',
    avgViews: '850',
    engagementRate: '6.4%',
    postsCount: '70'
  });
  
  const [recentPosts, setRecentPosts] = useState([
    {
      id: 'p1',
      title: 'Quando o cliente quer economizar na fiação da obra...',
      views: '4.2K',
      likes: '412',
      shares: '54',
      retention: '88%',
      status: 'viral',
      review: 'Excelente gancho de curiosidade + quebra de padrão visual nos primeiros 2 segundos. O tema de fiação errada conecta com o medo de incêndio, gerando compartilhamentos preventivos.'
    },
    {
      id: 'p2',
      title: 'Limpeza de painéis com sabão em pó? NUNCA FAÇA ISSO!',
      views: '850',
      likes: '92',
      shares: '12',
      retention: '42%',
      status: 'normal',
      review: 'O gancho foi bom, mas a explicação técnica no meio do vídeo foi muito lenta. Faltou dinâmica visual. O público perdeu o interesse aos 6 segundos.'
    },
    {
      id: 'p3',
      title: 'A taxa secreta que a Cemig cobra de quem tem painel solar',
      views: '15.8K',
      likes: '1.4K',
      shares: '280',
      retention: '94%',
      status: 'super-viral',
      review: 'Fenômeno. Gancho de indignação sobre impostos/taxas ativa um sentimento coletivo forte. A CTA pedindo para comentar "SOLAR" gerou enxurrada de comentários, o que forçou o algoritmo a distribuir o Reels.'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o seu **Agente Estrategista de IA** focado no perfil **@irmaosnaobra__**. 

Analisei as métricas reais do seu perfil (com **1.019 seguidores** e **70 publicações**). O seu Reels sobre **"Taxa Secreta da Cemig"** foi o seu melhor desempenho recente, alcançando **15.8K visualizações** (excelente para o tamanho da sua conta) e **94% de retenção média**. 

O segredo do seu engajamento está em ganchos de **indignação ou prejuízo financeiro na obra** combinados com **CTAs de comentários (como "Comente SOLAR")**.

Sobre o que você quer estrategizar hoje? Escolha um prompt rápido abaixo ou envie sua dúvida!`
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // Decodificador de Virais states
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'decodificador'>('diagnostico');
  const [decodeUrl, setDecodeUrl] = useState('');
  const [decodeComments, setDecodeComments] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [decodeResult, setDecodeResult] = useState<any>(null);

  const handleDecodeVideo = async () => {
    if (!decodeUrl) return;
    try {
      setDecoding(true);
      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/decodificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: decodeUrl,
          manual_comments: decodeComments
        })
      });

      if (data.success) {
        setDecodeResult({
          title: data.title,
          analysis: data.analysis
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao decodificar vídeo.');
    } finally {
      setDecoding(false);
    }
  };

  const quickPrompts = [
    "Qual o melhor gancho para vender energia solar essa semana?",
    "Como aumentar a retenção do vídeo após os primeiros 3 segundos?",
    "Quero testar um nicho de roupas masculinas. Como adaptar meu perfil?",
    "Analise meu tema: Erro na concretagem da laje que custou 5 mil reais"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: textToSend }];
    setChatMessages(newMessages);
    setUserInput('');
    setChatLoading(true);

    try {
      const apiUrl = getApiUrl();
      
      const systemPrompt = `Você é o Agente Estrategista de IA oficial do perfil @irmaosnaobra__ (nicho de construção civil, engenharia e energia solar em Uberlândia-MG, sob a rede da Cemig). 
Sua missão é dar diagnósticos analíticos, decifrar o algoritmo do Instagram/TikTok e ajudar o usuário a criar ganchos de alta retenção e "receitas de viralização".

Suas regras de atuação:
1. Responda de forma direta, tática e extremamente acionável (use tópicos, negritos e insights práticos).
2. Use dados e métricas do perfil nas análises (Seguidores: 1.019, Publicações: 70, Vídeo mais viral: "Taxa Secreta da Cemig" com 15.8K views e 94% de retenção).
3. Adapte-se ao nicho do usuário: se ele perguntar sobre energia solar ou obras, use ganchos de medo de prejuízo, erros comuns em obras e as tarifas da Cemig.
4. Se ele quiser testar outros nichos/produtos (ex: roupas, ferramentas, etc.), ensine-o a modelar o formato de react viral (gancho visual forte + reações expressivas + explicação de valor rápida + CTA de comentários) para esse novo nicho.
5. Sempre forneça exemplos de ganchos (0-3s), corpo (3-12s) e CTA (12-15s) prontos para uso.`;

      const userPrompt = `Histórico recente da conversa:
${JSON.stringify(newMessages.slice(-6))}

Pergunta do usuário:
"${textToSend}"

Por favor, dê uma resposta estratégica detalhada em português, ensinando como jogar a favor do algoritmo e alcançar a viralidade.`;

      const data = await safeFetch(`${apiUrl}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          prompt: userPrompt
        })
      });

      const replyText = data.content?.[0]?.text || data.content || 'Não consegui formular a resposta estratégica. Tente novamente.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Ocorreu um erro ao conectar com meu cérebro estratégico. Verifique se o seu servidor Flask está rodando na porta 5000!' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="h-4 w-4" /> Inteligência Estratégica
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Agente Estrategista & Analítico</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Métricas em tempo real de <span className="text-amber-500 font-semibold">{metrics.username}</span> e inteligência preditiva para bater o algoritmo do Instagram Reels.
          </p>
        </div>

        <button 
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Instagram
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Seguidores</span>
            <Users className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{metrics.followers}</span>
            <span className="text-xs text-emerald-400 font-bold ml-2">{metrics.followersGrowth}</span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Alcance Médio</span>
            <Eye className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{metrics.avgViews}</span>
            <span className="text-[10px] text-zinc-500 font-semibold ml-2">por Reels</span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Engajamento</span>
            <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{metrics.engagementRate}</span>
            <span className="text-xs text-emerald-400 font-bold ml-2">Altíssimo 🔥</span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Publicações</span>
            <Instagram className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">{metrics.postsCount}</span>
            <span className="text-[10px] text-zinc-500 font-semibold ml-2">vídeos ativos</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('diagnostico')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'diagnostico'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Diagnóstico & Mentor de Formatos
        </button>
        <button
          onClick={() => setActiveTab('decodificador')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'decodificador'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Decodificador de Virais (Engenharia Reversa)
        </button>
      </div>

      {/* Main Layout: Diagnóstico */}
      {activeTab === 'diagnostico' && (
        <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Left Side: Analytics & Recipe (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Recent Performance Analysis */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Instagram className="h-5 w-5 text-amber-500" /> Histórico de Reels & Diagnóstico de IA
            </h3>
            
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="bg-zinc-950 border border-zinc-900 p-4.5 rounded-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-zinc-300 line-clamp-1">{post.title}</span>
                    <span className={`self-start sm:self-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      post.status === 'super-viral' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                        : post.status === 'viral' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {post.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Post Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center py-2 bg-zinc-900/30 rounded-lg border border-zinc-900/60">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">Views</span>
                      <span className="text-xs font-extrabold text-zinc-200">{post.views}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">Likes</span>
                      <span className="text-xs font-extrabold text-zinc-200">{post.likes}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">Shares</span>
                      <span className="text-xs font-extrabold text-zinc-200">{post.shares}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">Retenção</span>
                      <span className="text-xs font-extrabold text-amber-500">{post.retention}</span>
                    </div>
                  </div>

                  {/* IA Strategic Review */}
                  <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-900 text-xs text-zinc-400 leading-relaxed flex gap-2">
                    <BrainCircuit className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <p><strong>Feedback Estratégico:</strong> {post.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Virality Recipe Box */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-transparent border border-amber-500/20 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 animate-pulse" /> A Receita do Viral (Fórmula Algorítmica)
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O algoritmo do Reels recompensa principalmente a **Taxa de Retenção** (usuários assistindo até o fim e repetindo o vídeo) e o **Engajamento Ativo** (comentários e compartilhamentos). Aqui está o segredo validado para o seu canal:
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">1. Gancho Emocional</span>
                <p className="text-zinc-400 leading-normal">Ganchos de <strong>medo de prejuízo</strong> ou <strong>curiosidade imediata</strong> dobram a retenção dos primeiros 3s.</p>
              </div>

              <div className="p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">2. Ritmo UGC</span>
                <p className="text-zinc-400 leading-normal">Cortes visuais a cada 1.5s, legendas coloridas destacando palavras fortes e tom acelerado.</p>
              </div>

              <div className="p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">3. Loop de Comentários</span>
                <p className="text-zinc-400 leading-normal">Finalize mandatoriamente com CTAs do tipo <strong>"Comente SOLAR"</strong>. O algoritmo ama comentários!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat with Agent (2 cols) */}
        <div className="lg:col-span-2 flex flex-col bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden h-[630px]">
          {/* Chat Header */}
          <div className="p-4 bg-zinc-950 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg text-zinc-950">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full"></span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Agente Estrategista</h4>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Online • Analisando Perfil</span>
              </div>
            </div>
            
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              CLAUDE 3.5
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md rounded-tr-none'
                    : 'bg-zinc-950 text-zinc-300 border border-zinc-900 rounded-tl-none space-y-2'
                }`}>
                  {/* Process markdown highlights */}
                  <p className="whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-semibold ml-1">Processando dados e gerando estratégia...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Container */}
          <div className="p-3 bg-zinc-950/60 border-t border-zinc-900 space-y-2">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1 block">Dúvidas Frequentes</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={chatLoading}
                  className="bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-400 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                >
                  {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(userInput);
            }}
            className="p-3 bg-zinc-950 border-t border-zinc-800/80 flex gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Pergunte ao estrategista (ex: avalie um tema)..."
              disabled={chatLoading}
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || chatLoading}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none text-zinc-950 p-2.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        </div>
      )}

      {/* Main Layout: Decodificador */}
      {activeTab === 'decodificador' && (
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Inputs Column */}
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-amber-500" /> Decodificar Vídeo
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Mapeie a cópia, ritmo e dores do público de qualquer vídeo viral externo.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Link do Vídeo</label>
                  <input
                    type="text"
                    required
                    placeholder="Cole o link do Reels, TikTok ou YouTube..."
                    value={decodeUrl}
                    onChange={(e) => setDecodeUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Comentários (Fallback Manual)</label>
                    <span className="text-[10px] text-zinc-500 font-semibold">Para ToS/limite de API</span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder="Cole aqui o texto dos comentários principais se o vídeo for de terceiro do Instagram/TikTok..."
                    value={decodeComments}
                    onChange={(e) => setDecodeComments(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none transition-colors leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDecodeVideo}
                  disabled={decoding || !decodeUrl}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {decoding ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Decodificando com IA...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Decodificar Vídeo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Column (2/3 width) */}
          <div className="lg:col-span-2">
            {decodeResult ? (
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
                <div>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 uppercase tracking-widest">
                    Decodificação Concluída
                  </span>
                  <h3 className="text-xl font-black text-white mt-2 leading-tight">
                    {decodeResult.title}
                  </h3>
                </div>

                {/* Render the markdown analysis */}
                <div className="bg-zinc-950 border border-zinc-900/60 p-6 rounded-xl text-zinc-300 text-sm leading-relaxed space-y-4 max-h-[600px] overflow-y-auto whitespace-pre-wrap font-sans">
                  {decodeResult.analysis}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-3xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-zinc-900/60 rounded-full text-zinc-650">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-zinc-300">Aguardando Decodificação</h4>
                <p className="text-zinc-500 text-xs max-w-sm">
                  Insira o link de um vídeo viral do nicho ao lado e decodifique a receita de sucesso do concorrente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
