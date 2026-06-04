'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Tv, 
  Settings, 
  Play, 
  Sparkles, 
  Layers, 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle,
  HelpCircle,
  Video,
  FileText,
  UserCheck
} from 'lucide-react';

export default function Estudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id');

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [roteiro, setRoteiro] = useState<any>(null);
  const [render, setRender] = useState<any>(null);
  
  // HeyGen Inputs
  // Pre-fill with standard working avatars or let them type
  const [avatarId, setAvatarId] = useState('josh_lite_20230505');
  const [voiceId, setVoiceId] = useState('br_portuguese_male');
  const [aspect, setAspect] = useState('9:16');
  
  // HeyGen Generation States
  const [generating, setGenerating] = useState(false);
  const [heygenVideoId, setHeygenVideoId] = useState('');
  const [heygenStatus, setHeygenStatus] = useState('');
  const [heygenProgress, setHeygenProgress] = useState(0);
  const [heygenVideoUrl, setHeygenVideoUrl] = useState('');
  const [polling, setPolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Avatars list from HeyGen
  const [avatarsList, setAvatarsList] = useState<any[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadData(projectId);
    }
  }, [projectId]);

  // Load avatars list on mount
  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoadingAvatars(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/heygen/avatars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        // Handle different response shapes from v2 or v1
        const list = data.data?.avatars || data.avatars || data.avatar_list || [];
        setAvatarsList(list.slice(0, 10)); // Top 10 avatars
      }
    } catch (err) {
      console.error('Erro ao buscar avatares:', err);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const loadData = async (projId: string) => {
    try {
      setLoading(true);
      const proj = await db.projetos.get(projId);
      if (!proj) return;
      setProject(proj);

      // Find videos
      const videos = await db.videos_fonte.list(projId);
      if (videos && videos.length > 0) {
        const vf = videos[0];
        
        // Find approved/first cut
        const cuts = await db.trechos.list(vf.id);
        const approvedCut = cuts.find((c: any) => c.aprovado) || cuts[0];
        
        if (approvedCut) {
          const roteiros = await db.roteiros.list(approvedCut.id);
          if (roteiros && roteiros.length > 0) {
            const r = roteiros[0];
            setRoteiro(r);
            
            // Check if there is already a render entry
            const renders = await db.renders.list(r.id);
            if (renders && renders.length > 0) {
              const rnd = renders[0];
              setRender(rnd);
              setAvatarId(rnd.avatar_id);
              setVoiceId(rnd.voice_id || 'br_portuguese_male');
              setAspect(rnd.aspect || '9:16');
              
              if (rnd.status === 'renderizando' || rnd.status === 'pendente') {
                // If it was rendering, check status or start polling
                const videoIdPattern = rnd.video_url?.match(/video_id=([^&]+)/) || rnd.video_url?.match(/\/([a-zA-Z0-9]+)$/);
                const vid = videoIdPattern ? videoIdPattern[1] : '';
                if (vid) {
                  setHeygenVideoId(vid);
                  setHeygenStatus(rnd.status);
                  startStatusPolling(vid, rnd.id);
                }
              } else if (rnd.status === 'concluido' && rnd.video_url) {
                setHeygenVideoUrl(rnd.video_url);
                setHeygenStatus('success');
                setHeygenProgress(100);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!roteiro || !project) return;
    try {
      setGenerating(true);
      setErrorMsg('');
      setHeygenVideoUrl('');
      setHeygenProgress(0);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const generateRes = await fetch(`${apiUrl}/api/heygen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_id: avatarId.trim(),
          voice_id: voiceId.trim(),
          input_text: roteiro.falar,
          aspect: aspect,
          title: `Video Obra: ${project.nome}`
        })
      });

      if (!generateRes.ok) {
        const errData = await generateRes.json();
        throw new Error(errData.error || 'Erro ao gerar vídeo no HeyGen.');
      }

      const genData = await generateRes.json();
      const videoId = genData.data?.video_id || genData.video_id;
      
      if (!videoId) {
        throw new Error('Video ID não retornado pelo HeyGen.');
      }

      setHeygenVideoId(videoId);
      setHeygenStatus('processing');
      
      // Save render status in db
      let rndId = '';
      if (render) {
        const updated = await db.renders.update(render.id, {
          avatar_id: avatarId,
          voice_id: voiceId,
          status: 'renderizando',
          video_url: videoId
        });
        setRender(updated);
        rndId = updated.id;
      } else {
        const created = await db.renders.create(roteiro.id, avatarId, voiceId, aspect);
        await db.renders.update(created.id, { status: 'renderizando', video_url: videoId });
        setRender(created);
        rndId = created.id;
      }

      // Start polling status
      startStatusPolling(videoId, rndId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao enviar a requisição para a HeyGen.');
      setGenerating(false);
    }
  };

  const startStatusPolling = (vid: string, rndId: string) => {
    setPolling(true);
    let intervalCount = 0;
    
    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const statusRes = await fetch(`${apiUrl}/api/heygen/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_id: vid })
        });

        if (statusRes.ok) {
          const statusData = await statusRes.ok ? await statusRes.json() : null;
          const status = statusData?.data?.status || statusData?.status;
          
          if (status === 'completed' || status === 'success') {
            const url = statusData?.data?.video_url || statusData?.video_url;
            setHeygenVideoUrl(url);
            setHeygenStatus('success');
            setHeygenProgress(100);
            setPolling(false);
            setGenerating(false);
            
            // Update in db
            const updated = await db.renders.update(rndId, { status: 'concluido', video_url: url });
            setRender(updated);
            clearInterval(pollInterval);
          } else if (status === 'failed') {
            setHeygenStatus('failed');
            setPolling(false);
            setGenerating(false);
            
            const failMsg = statusData?.data?.failure_message || 
                            statusData?.failure_message || 
                            statusData?.data?.error?.message || 
                            'A geração do avatar falhou no HeyGen.';
            setErrorMsg(`A geração falhou no HeyGen: ${failMsg}`);
            
            await db.renders.update(rndId, { status: 'falhou' });
            clearInterval(pollInterval);
          } else {
            // Still processing
            setHeygenStatus('processing');
            const progress = statusData?.data?.progress || statusData?.progress || 10;
            setHeygenProgress(progress);
          }
        }
      } catch (err) {
        console.error('Erro ao consultar status:', err);
      }
      
      intervalCount++;
      // Stop polling after 15 minutes to avoid infinite loop
      if (intervalCount > 90) {
        setPolling(false);
        setGenerating(false);
        clearInterval(pollInterval);
      }
    };

    // Check immediately
    checkStatus();
    
    // Poll every 10 seconds
    const pollInterval = setInterval(checkStatus, 10000);
  };

  const handleSimulatePublish = async () => {
    if (!render || !project) return;
    try {
      setLoading(true);
      // Create publication in db
      const pub = await db.publicacoes.create(render.id, 'instagram');
      
      // Simulate post
      setTimeout(async () => {
        await db.publicacoes.update(pub.id, {
          status: 'publicado',
          instagram_media_id: 'ig_' + Math.random().toString(36).substr(2, 9),
          postado_em: new Date().toISOString()
        });
        
        await db.projetos.update(project.id, { status: 'publicado' });
        setLoading(false);
        alert('Vídeo publicado com sucesso no Reels do Instagram @irmaosnaobra__!');
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back Link */}
      <div>
        <button
          onClick={() => router.push(project ? `/roteiro?id=${project.id}` : '/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Etapa 2
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Etapa 3: Estúdio & Geração de Avatar</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Configure o avatar da HeyGen, gere a fala sincronizada e exporte o vídeo com layout vertical (9:16) para o Reels.
        </p>
      </div>

      {loading && !project ? (
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500 font-semibold">Carregando estúdio...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main settings column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Renders / Generation preview area */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="h-5 w-5 text-amber-500" /> Preview do Estúdio
              </h3>

              {heygenVideoUrl ? (
                <div className="space-y-4">
                  {/* Blended composition preview */}
                  <div className="relative aspect-[9/16] max-w-[320px] mx-auto overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-black shadow-2xl">
                    <div className="absolute inset-0 flex flex-col">
                      {/* Top: Source video placeholder/cut simulation */}
                      <div className="h-1/2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
                        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Corte do Vídeo Original</span>
                      </div>
                      
                      {/* Bottom: HeyGen Avatar */}
                      <div className="h-1/2 bg-zinc-900 overflow-hidden relative">
                        <video 
                          src={heygenVideoUrl} 
                          controls 
                          loop
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                          Avatar Sincronizado
                        </div>
                      </div>
                    </div>

                    {/* Captions Overlay simulation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center px-4 pointer-events-none">
                      <span className="bg-amber-500 text-zinc-950 px-2 py-1 rounded font-black text-xs uppercase shadow-lg tracking-wider border border-amber-400">
                        {roteiro?.gancho ? roteiro.gancho.split(' ').slice(0, 3).join(' ') : 'LEGENDA DINÂMICA'}...
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center md:justify-start">
                        <CheckCircle className="h-4 w-4" /> Vídeo renderizado com sucesso!
                      </span>
                      <p className="text-[11px] text-zinc-500">Avatar gerado e integrado ao roteiro final.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <a
                        href={heygenVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-white border border-zinc-850 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        <Download className="h-3.5 w-3.5" /> Baixar Avatar
                      </a>
                    </div>
                  </div>
                </div>
              ) : generating || polling ? (
                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-200">Geração HeyGen em Andamento</h4>
                    <p className="text-zinc-500 text-[11px]">Consumindo créditos da API. Status: {heygenStatus} ({heygenProgress}%)</p>
                  </div>
                  <div className="w-full max-w-xs bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${heygenProgress || 15}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-zinc-900/60 rounded-full text-zinc-500">
                    <Tv className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-300">Avatar pronto para ser gerado</h4>
                    <p className="text-zinc-500 text-xs max-w-sm">
                      Clique no botão ao lado para enviar a fala ao HeyGen. O processamento geralmente leva de 1 a 3 minutos.
                    </p>
                  </div>
                </div>
              )}

              {/* Roteiro falado preview summary */}
              <div className="bg-zinc-950/40 border border-zinc-900 p-4.5 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Roteiro Aprovado</span>
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  "{roteiro?.falar || 'Nenhum roteiro carregado.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Right settings sidebar */}
          <div className="space-y-6">
            
            {/* Configuration Form */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-amber-500" /> Configuração do Avatar
              </h3>

              {/* Avatar ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  Avatar ID
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-600" title="Código identificador do HeyGen para o boneco/clone digital." />
                </label>
                <input
                  type="text"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="Ex: josh_lite_20230505"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-mono"
                />
              </div>

              {/* Voice ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  Voice ID (Voz de Fala)
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-600" title="Código identificador da voz do narrador (Ex: ElevenLabs ou HeyGen standard)." />
                </label>
                <input
                  type="text"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="Ex: br_portuguese_male"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-mono"
                />
              </div>

              {/* Format Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Formato do Vídeo</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
                >
                  <option value="9:16">Vertical 9:16 (Instagram Reels/TikTok)</option>
                  <option value="16:9">Horizontal 16:9 (YouTube)</option>
                  <option value="1:1">Quadrado 1:1 (Post Feed)</option>
                </select>
              </div>

              {/* Error warning */}
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl leading-relaxed flex items-start gap-2">
                  <span className="font-bold shrink-0">ERRO:</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Trigger */}
              <button
                onClick={handleGenerateVideo}
                disabled={generating || polling || !roteiro}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Sparkles className="h-4 w-4" /> Gerar Avatar no HeyGen
              </button>
            </div>

            {/* Quick Select Avatars List (if found) */}
            {avatarsList.length > 0 && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5" /> Avatares Disponíveis
                </h4>
                <div className="grid grid-cols-2 gap-2 h-36 overflow-y-auto pr-1">
                  {avatarsList.map((av: any) => (
                    <button
                      key={av.avatar_id}
                      onClick={() => setAvatarId(av.avatar_id)}
                      className={`text-left text-[10px] p-2 rounded-lg border transition-all truncate ${
                        avatarId === av.avatar_id
                          ? 'border-amber-500 bg-amber-500/5 text-amber-500'
                          : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {av.avatar_name || av.avatar_id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Publish Actions */}
            {heygenVideoUrl && (
              <div className="space-y-3">
                <button
                  onClick={handleSimulatePublish}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01]"
                >
                  <Share2 className="h-4 w-4" /> Publicar no Instagram Reels
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
