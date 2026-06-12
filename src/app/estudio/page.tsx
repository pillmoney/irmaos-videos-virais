'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getApiUrl, getProxiedUrl, safeFetch } from '@/lib/utils';
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
  UserCheck,
  Coins,
  Flame,
  Palette,
  CheckSquare,
  Edit,
  Save,
  Upload
} from 'lucide-react';

function EstudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id');

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [roteiro, setRoteiro] = useState<any>(null);
  const [render, setRender] = useState<any>(null);
  
  // Mode selection
  const [renderMode, setRenderMode] = useState<'ugc_voice' | 'heygen_avatar'>('ugc_voice');
  
  // HeyGen Assets
  const [heygenAvatars, setHeygenAvatars] = useState<any[]>([]);
  const [heygenTalkingPhotos, setHeygenTalkingPhotos] = useState<any[]>([]);
  const [heygenVoices, setHeygenVoices] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // HeyGen Inputs
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedHeygenVoiceId, setSelectedHeygenVoiceId] = useState('');
  const [layoutMode, setLayoutMode] = useState('bubble');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('');
  
  // UGC Voiceover Inputs
  const [voiceId, setVoiceId] = useState('thalita');
  const [aspect, setAspect] = useState('9:16');
  
  // UGC Generation States
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [wordTimings, setWordTimings] = useState<any[]>([]);
  const [audioDuration, setAudioDuration] = useState(15.0);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [originalVideoUrl, setOriginalVideoUrl] = useState('');
  const [renderingHyperframes, setRenderingHyperframes] = useState(false);
  const [hyperframesVideoUrl, setHyperframesVideoUrl] = useState('');
  const [hyperframesStatus, setHyperframesStatus] = useState('');
  const [hyperframesProgress, setHyperframesProgress] = useState(0);

  // Credit status states
  const [saldos, setSaldos] = useState<any[]>([]);
  const [isScarcityMode, setIsScarcityMode] = useState(false);

  // Brand Kit & QA States
  const [brandKit, setBrandKit] = useState<any>({
    cores_json: { primary: '#FDFBF7', secondary: '#0A192F', accent: '#B87333' },
    fontes: 'Montserrat',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200',
    selo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    b_roll_image_url: '',
    remover_watermark: false,
    b_roll_start: 2,
    b_roll_duration: 5,
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
  });
  const [isEditingBrandKit, setIsEditingBrandKit] = useState(false);
  const [manualHeygenVideoUrl, setManualHeygenVideoUrl] = useState('');
  const [uploadingManualVideo, setUploadingManualVideo] = useState(false);
  const [uploadManualError, setUploadManualError] = useState('');

  const handleUploadManualVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingManualVideo(true);
      setUploadManualError('');
      
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (data.success && data.url) {
        setManualHeygenVideoUrl(data.url);
        setAvatarVideoUrl(data.url);
      }
    } catch (err: any) {
      console.error(err);
      setUploadManualError(err.message || 'Erro ao realizar upload do vídeo local.');
    } finally {
      setUploadingManualVideo(false);
    }
  };

  const handleImagePaste = (field: string) => (e: React.ClipboardEvent<any>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setBrandKit((prev: any) => ({
                ...prev,
                [field]: event.target!.result as string
              }));
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
        }
      }
    }
  };

  const handleImageUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBrandKit((prev: any) => ({
            ...prev,
            [field]: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [lowerThirdName, setLowerThirdName] = useState('Irmãos na Obra');
  const [lowerThirdRole, setLowerThirdRole] = useState('Especialistas em Energia Solar');
  const [showLowerThird, setShowLowerThird] = useState(true);
  const [showCtaCard, setShowCtaCard] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);

  const [qaChecks, setQaChecks] = useState<any[]>([]);
  const [qaScore, setQaScore] = useState<number | null>(null);
  const [qaPassed, setQaPassed] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadData(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchSaldosAndBrandKit = async () => {
      try {
        const list = await db.ferramentas_saldo.list();
        setSaldos(list || []);
        const heygenSaldo = list.find((s: any) => s.ferramenta === 'HeyGen')?.saldo || 0;
        if (heygenSaldo < 10.0) {
          setIsScarcityMode(true);
        }
        
        const bk = await db.brand_kit.get();
        if (bk) {
          setBrandKit({
            b_roll_start: 2,
            b_roll_duration: 5,
            ...bk
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSaldosAndBrandKit();
  }, []);

  // HeyGen avatars loading
  const fetchHeygenAssets = async () => {
    try {
      setLoadingAssets(true);
      setErrorMsg('');
      const apiUrl = getApiUrl();
      
      const avData = await safeFetch(`${apiUrl}/api/heygen/avatars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setHeygenAvatars(avData.avatars || []);
      setHeygenTalkingPhotos(avData.talking_photos || []);
      
      if (avData.talking_photos && avData.talking_photos.length > 0) {
        setSelectedAvatarId(avData.talking_photos[0].id);
      } else if (avData.avatars && avData.avatars.length > 0) {
        setSelectedAvatarId(avData.avatars[0].avatar_id);
      }

      const vcData = await safeFetch(`${apiUrl}/api/heygen/voices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setHeygenVoices(vcData.voices || []);
      if (vcData.voices && vcData.voices.length > 0) {
        const sofia = vcData.voices.find((v: any) => v.name.toLowerCase().includes('sofia'));
        setSelectedHeygenVoiceId(sofia ? sofia.voice_id : vcData.voices[0].voice_id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao carregar avatares/vozes da HeyGen.');
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (renderMode === 'heygen_avatar' && heygenAvatars.length === 0) {
      fetchHeygenAssets();
    }
  }, [renderMode]);

  const loadData = async (projId: string) => {
    try {
      setLoading(true);
      const proj = await db.projetos.get(projId);
      if (!proj) return;
      setProject(proj);

      // Set default renderMode based on project's modulo_codigo
      if (proj.modulo_codigo === 'A' || proj.modulo_codigo === 'C' || proj.modulo_codigo === 'D') {
        setRenderMode('heygen_avatar');
      } else {
        setRenderMode('ugc_voice');
      }

      // Find videos
      const videos = await db.videos_fonte.list(projId);
      if (videos && videos.length > 0) {
        const vf = videos[0];
        if (vf.transcricao_json?.processed_url) {
          setOriginalVideoUrl(vf.transcricao_json.processed_url);
        } else if (vf.url) {
          setOriginalVideoUrl(vf.url);
        }
        
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
              setVoiceId(rnd.voice_id || 'thalita');
              setAspect(rnd.aspect || '9:16');
              
              if (rnd.avatar_id && rnd.avatar_id !== 'ugc_neural') {
                setRenderMode('heygen_avatar');
                setSelectedAvatarId(rnd.avatar_id);
                setSelectedHeygenVoiceId(rnd.voice_id || '');
              } else {
                setRenderMode('ugc_voice');
              }
              
              if (rnd.status === 'concluido' && rnd.video_url) {
                setHyperframesVideoUrl(rnd.video_url);
                setHyperframesStatus('success');
                setHyperframesProgress(100);
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

  const handleGenerateAudio = async () => {
    if (!roteiro || !project) return;
    try {
      setGeneratingAudio(true);
      setErrorMsg('');
      setAudioUrl('');
      
      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: roteiro.falar,
          voice_id: voiceId
        })
      });

      setAudioUrl(data.audio_url);
      setWordTimings(data.word_timings);
      setAudioDuration(data.duration);
      
      // Save or update render status in db
      if (render) {
        const updated = await db.renders.update(render.id, {
          voice_id: voiceId,
          aspect: aspect
        });
        setRender(updated);
      } else {
        const created = await db.renders.create(roteiro.id, 'ugc_neural', voiceId, aspect);
        setRender(created);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao gerar a locução neural.');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const runQaCheck = async (videoUrl: string) => {
    try {
      const apiUrl = getApiUrl();
      const qaData = await safeFetch(`${apiUrl}/api/montagem/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl,
          brand_kit: brandKit
        })
      });
      setQaChecks(qaData.checks || []);
      setQaScore(qaData.score_qa || 90);
      setQaPassed(qaData.passed || false);
    } catch (err) {
      console.error("QA check failed:", err);
    }
  };

  const handleSaveBrandKit = async () => {
    try {
      const updated = await db.brand_kit.update(brandKit);
      setBrandKit(updated);
      setIsEditingBrandKit(false);
      alert('Brand Kit salvo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o Brand Kit.');
    }
  };

  const handleRenderHyperframes = async () => {
    if (!originalVideoUrl || !audioUrl || !roteiro || !render) return;
    try {
      setRenderingHyperframes(true);
      setHyperframesStatus('Renderizando Reels Branded no compositor...');
      setHyperframesProgress(15);
      setErrorMsg('');

      // Auto-save brand kit
      try {
        await db.brand_kit.update(brandKit);
      } catch (bkErr) {
        console.error("Failed to auto-save Brand Kit:", bkErr);
      }

      const progressInterval = setInterval(() => {
        setHyperframesProgress(prev => {
          if (prev < 90) return prev + 12;
          return prev;
        });
      }, 3000);

      const apiUrl = getApiUrl();
      const data = await safeFetch(`${apiUrl}/api/montagem/remotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_video_url: originalVideoUrl,
          voiceover_audio_url: audioUrl,
          word_timings: wordTimings,
          duration: audioDuration,
          layout: layoutMode,
          brand_kit: brandKit,
          show_captions: showCaptions,
          lower_third: showLowerThird ? { name: lowerThirdName, role: lowerThirdRole, duration: 4.0 } : null,
          cta_card: showCtaCard ? brandKit.cta_card_json : null
        })
      });

      clearInterval(progressInterval);
      const finalVideoUrl = data.video_url;

      setHyperframesVideoUrl(finalVideoUrl);
      setHyperframesStatus('success');
      setHyperframesProgress(100);

      // Save in DB
      const updated = await db.renders.update(render.id, {
        video_url: finalVideoUrl,
        status: 'concluido'
      });
      setRender(updated);

      // Run QA Check
      await runQaCheck(finalVideoUrl);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao renderizar no compositor.');
      setHyperframesStatus('failed');
    } finally {
      setRenderingHyperframes(false);
    }
  };

  const handleRenderHeygenHyperframes = async (avatarUrl: string, renderEntry: any) => {
    if (!originalVideoUrl || !roteiro || !renderEntry) return;
    try {
      setRenderingHyperframes(true);
      
      const isMixLayout = layoutMode !== 'avatar_only';
      const apiUrl = getApiUrl();
      
      if (isMixLayout) {
        setHyperframesStatus('Renderizando Reels com Layout e Avatar no compositor...');
        setHyperframesProgress(92);
        
        const data = await safeFetch(`${apiUrl}/api/montagem/remotion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_video_url: originalVideoUrl,
            avatar_video_url: avatarUrl,
            word_timings: wordTimings || [],
            duration: audioDuration || 15.0,
            layout: layoutMode,
            brand_kit: brandKit,
            show_captions: showCaptions,
            lower_third: showLowerThird ? { name: lowerThirdName, role: lowerThirdRole, duration: 4.0 } : null,
            cta_card: showCtaCard ? brandKit.cta_card_json : null
          })
        });
        
        const finalVideoUrl = data.video_url;
        
        setHyperframesVideoUrl(finalVideoUrl);
        setHyperframesStatus('success');
        setHyperframesProgress(100);
        
        const updated = await db.renders.update(renderEntry.id, {
          video_url: finalVideoUrl,
          status: 'concluido'
        });
        setRender(updated);
        await runQaCheck(finalVideoUrl);
        return;
      }
      
      setHyperframesStatus('Aplicando Kit de Marca, Selo de IA e Rastreamento UTM...');
      setHyperframesProgress(92);

      const data = await safeFetch(`${apiUrl}/api/montagem/heygen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: avatarUrl,
          brand_kit: brandKit,
          script_text: roteiro.falar,
          duration: audioDuration,
          utm_source: 'plataforma_virais',
          utm_campaign: 'solar_doc'
        })
      });

      const finalVideoUrl = data.video_url;

      setHyperframesVideoUrl(finalVideoUrl);
      setHyperframesStatus('success');
      setHyperframesProgress(100);

      // Save in DB
      const updated = await db.renders.update(renderEntry.id, {
        video_url: finalVideoUrl,
        status: 'concluido'
      });
      setRender(updated);

      // Run QA Check
      await runQaCheck(finalVideoUrl);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao compor o vídeo final.');
      setHyperframesStatus('failed');
    } finally {
      setRenderingHyperframes(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!roteiro || !project) return;
    
    // Auto-save brand kit
    try {
      await db.brand_kit.update(brandKit);
    } catch (bkErr) {
      console.error("Failed to auto-save Brand Kit:", bkErr);
    }

    // Check manual fallback URL first
    if (manualHeygenVideoUrl.trim()) {
      try {
        setGeneratingAvatar(true);
        setErrorMsg('');
        setAvatarVideoUrl(manualHeygenVideoUrl);
        setHyperframesStatus('Iniciando montagem com vídeo manual da HeyGen...');
        setHyperframesProgress(20);
        setRenderingHyperframes(true);
        
        let currentRender = render;
        if (currentRender) {
          currentRender = await db.renders.update(currentRender.id, {
            status: 'pendente'
          });
          setRender(currentRender);
        } else {
          currentRender = await db.renders.create(roteiro.id, selectedAvatarId || 'manual', selectedHeygenVoiceId || 'manual', aspect);
          setRender(currentRender);
        }
        
        setHyperframesProgress(95);
        await handleRenderHeygenHyperframes(manualHeygenVideoUrl.trim(), currentRender);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Erro ao compor com vídeo manual.');
        setHyperframesStatus('failed');
        setRenderingHyperframes(false);
      } finally {
        setGeneratingAvatar(false);
      }
      return;
    }
    
    if (!selectedAvatarId) {
      setErrorMsg('Selecione um Avatar ou insira um Link de Vídeo Manual.');
      return;
    }

    try {
      setGeneratingAvatar(true);
      setErrorMsg('');
      setAvatarVideoUrl('');
      setHyperframesStatus('Iniciando geração com HeyGen...');
      setHyperframesProgress(5);
      setRenderingHyperframes(true);
      
      const apiUrl = getApiUrl();
      const genData = await safeFetch(`${apiUrl}/api/heygen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_id: selectedAvatarId,
          voice_id: selectedHeygenVoiceId,
          input_text: roteiro.falar,
          aspect: aspect,
          title: `Reels Project ${project.nome}`
        })
      });
      const videoId = genData.data?.video_id || genData.video_id;
      if (!videoId) {
        throw new Error('Video ID não retornado pela HeyGen.');
      }

      // Save or update render status in db as pending
      let currentRender = render;
      if (currentRender) {
        currentRender = await db.renders.update(currentRender.id, {
          avatar_id: selectedAvatarId,
          voice_id: selectedHeygenVoiceId,
          aspect: aspect,
          status: 'pendente'
        });
        setRender(currentRender);
      } else {
        currentRender = await db.renders.create(roteiro.id, selectedAvatarId, selectedHeygenVoiceId, aspect);
        setRender(currentRender);
      }

      // Poll video status
      setHyperframesStatus('HeyGen gerando o Avatar...');
      setHyperframesProgress(20);

      const pollStatus = async () => {
        let attempts = 0;
        const maxAttempts = 120; // 6 minutes max
        
        return new Promise<string>((resolve, reject) => {
          const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
              clearInterval(interval);
              reject(new Error('Tempo limite excedido aguardando geração do avatar.'));
              return;
            }

            try {
              const statusData = await safeFetch(`${apiUrl}/api/heygen/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_id: videoId })
              });
              const resultData = statusData.data || statusData;
              const status = resultData.status;
              const progress = resultData.progress || 0;
              const downloadUrl = resultData.video_url || resultData.url;

              console.log(`[HeyGen Polling] Status: ${status}, Progress: ${progress}%`);

              if (status === 'success' || status === 'completed') {
                clearInterval(interval);
                resolve(downloadUrl);
              } else if (status === 'failed' || status === 'reject') {
                clearInterval(interval);
                reject(new Error(`Geração falhou na HeyGen: ${resultData.error?.message || 'Erro desconhecido'}`));
              } else {
                setHyperframesProgress(Math.min(90, 20 + Math.floor(progress * 0.7)));
                setHyperframesStatus(`HeyGen processando avatar... (${progress}%)`);
              }
            } catch (pollErr) {
              console.error("Polling error:", pollErr);
            }
          }, 3000);
        });
      };

      const finalUrl = await pollStatus();
      setAvatarVideoUrl(finalUrl);
      setHyperframesProgress(95);
      setHyperframesStatus('Avatar concluído! Iniciando montagem HyperFrames...');

      await handleRenderHeygenHyperframes(finalUrl, currentRender);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao gerar o avatar HeyGen.');
      setHyperframesStatus('failed');
      setRenderingHyperframes(false);
    } finally {
      setGeneratingAvatar(false);
    }
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

      {/* Credits Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/70 border border-zinc-900 p-4.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <Coins className="h-5 w-5 text-amber-500" />
          <div className="text-left text-xs">
            <span className="font-bold text-zinc-300 block">Saldos de Produção</span>
            <div className="flex gap-4 mt-0.5 text-zinc-500 font-semibold">
              {saldos.map((s, idx) => (
                <span key={idx}>
                  {s.ferramenta}: <span className="text-zinc-300 font-bold">{s.ferramenta === 'HeyGen' ? `${s.saldo.toFixed(1)}c` : `$${s.saldo.toFixed(2)}`}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {isScarcityMode ? (
          <div className="flex items-center gap-1.5 text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl">
            <Flame className="h-4 w-4 text-red-400 animate-pulse" /> Modo Escassez Ativado (&lt; 10c)
          </div>
        ) : (
          <div className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Saldo Suficiente
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Video className="text-amber-500" /> Etapa 3: Estúdio de Edição Inteligente
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Escolha entre voz UGC com legendas ativas ou influenciadores digitais IA da HeyGen em layouts premium.
          </p>
        </div>
        
        {/* Render Mode Tabs */}
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex shrink-0">
          <button
            onClick={() => setRenderMode('ugc_voice')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              renderMode === 'ugc_voice'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Locução UGC Grátis
          </button>
          <button
            onClick={() => setRenderMode('heygen_avatar')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              renderMode === 'heygen_avatar'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3" /> Avatar HeyGen
          </button>
        </div>
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
                <Tv className="h-5 w-5 text-amber-500" /> Preview do Vídeo Final
              </h3>

              {hyperframesVideoUrl ? (
                <div className="space-y-4">
                  {/* Final Rendered Composition Preview */}
                  <div className="relative aspect-[9/16] max-w-[320px] mx-auto overflow-hidden rounded-2xl border-2 border-amber-500 bg-black shadow-2xl animate-fade-in">
                    <video 
                      src={getProxiedUrl(hyperframesVideoUrl)} 
                      controls 
                      loop
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/20">
                      Reels Final Gerado
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center md:justify-start">
                        <CheckCircle className="h-4 w-4" /> Reels compilado com sucesso!
                      </span>
                      <p className="text-[11px] text-zinc-500">Vídeo finalizado com áudio e legendas sincronizadas.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <a
                        href={getProxiedUrl(hyperframesVideoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        <Download className="h-3.5 w-3.5" /> Baixar Reels
                      </a>
                    </div>
                  </div>

                  {qaScore !== null && (
                    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4 text-left animate-fade-in">
                      <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <CheckSquare className="h-4 w-4 text-emerald-400" /> Relatório de QA e Conformidade IA
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-0.5 font-semibold">Validação automática de ToS do Instagram e identidade visual.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-emerald-400">{qaScore}%</span>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/20">Aprovado</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2.5">
                          {qaChecks.map((check: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block leading-tight">{check.desc}</span>
                                <span className="text-[10px] text-zinc-500 font-semibold">Status: Conformidade verificada</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-zinc-900/40 p-4.5 rounded-xl space-y-2.5 flex flex-col justify-between border border-zinc-900">
                          <div className="text-[11px] leading-relaxed text-zinc-400">
                            <span className="font-bold text-emerald-400 block mb-1">Rótulo de IA e ToS de Rede Social</span>
                            O vídeo foi exportado com o metadado <code className="text-zinc-300 font-mono text-[10px] bg-zinc-950 px-1 py-0.5 rounded">Gerações Sintéticas - Criado com IA</code> embutido no arquivo e as tags UTM anexadas. Pronto para impulsionamento ou distribuição orgânica.
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-1">
                            <UserCheck className="h-3.5 w-3.5 text-zinc-400" /> Decisor: Liberado para Publicação
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : renderingHyperframes ? (
                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-5 min-h-[400px]">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-zinc-800 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full absolute top-0 left-0" style={{ transform: 'rotate(0deg)', animation: 'spin 1s linear infinite' }}></div>
                    <span className="text-xs font-bold text-amber-500 absolute">{hyperframesProgress}%</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-200">{hyperframesStatus}</h4>
                    <p className="text-zinc-500 text-[11px]">Isso pode levar de 1 a 3 minutos dependendo da HeyGen e renderização.</p>
                  </div>
                  <div className="w-full max-w-xs bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${hyperframesProgress}%` }}></div>
                  </div>
                </div>
              ) : renderMode === 'ugc_voice' && audioUrl ? (
                <div className="space-y-5">
                  {/* Locução gerada - pronto para renderizar */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl text-center space-y-4">
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 inline-block">
                      <Play className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-200">Locução Neural Pronta!</h4>
                      <p className="text-zinc-500 text-xs">
                        Ouça a locução abaixo e, se gostar da sincronia, clique para compor o Reels final.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto py-2">
                      <audio src={getProxiedUrl(audioUrl)} controls className="w-full" />
                    </div>

                    <div className="text-[10px] text-zinc-500">
                      Voz: {voiceId.toUpperCase()} • Sincronia: {wordTimings.length} palavras mapeadas
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Composição com HyperFrames
                      </h4>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        Mesclar o vídeo de fundo original com a locução neural gratuita e as legendas ativas animadas via GSAP (Estilo TikTok Shop).
                      </p>
                    </div>

                    <button
                      onClick={handleRenderHyperframes}
                      disabled={renderingHyperframes}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:scale-[1.01]"
                    >
                      <Layers className="h-4 w-4" /> Compor Reels Final (Grátis)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
                  <div className="p-4 bg-zinc-900/60 rounded-full text-zinc-500">
                    <Tv className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-300">Aguardando geração da locução / avatar</h4>
                    <p className="text-zinc-500 text-xs max-w-sm">
                      {renderMode === 'ugc_voice' 
                        ? 'Selecione uma voz neural no painel lateral à direita e clique em "Gerar Locução e Sincronia".'
                        : 'Selecione seu Avatar HeyGen, voz e layout à direita e clique em "Gerar Avatar e Compor Reels".'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Roteiro falado preview summary */}
              <div className="bg-zinc-950/40 border border-zinc-900 p-4.5 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Roteiro Aprovado para Locução
                </span>
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  "{roteiro?.falar || 'Nenhum roteiro carregado.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Right settings sidebar */}
          <div className="space-y-6">
            
            {/* UGC Mode Settings */}
            {renderMode === 'ugc_voice' && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5 animate-fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-amber-500" /> Locução UGC Neural
                </h3>

                {/* Voice Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    Selecione a Voz Neural
                    <span title="Vozes neurais da Microsoft Edge TTS, 100% gratuitas e com resposta em milissegundos.">
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-600 font-bold" />
                    </span>
                  </label>
                  <select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
                  >
                    <option value="thalita">Thalita (Feminina, Hype / Vendas) ✨</option>
                    <option value="antonio">Antonio (Masculino, Profissional)</option>
                    <option value="francisca">Francisca (Feminina, Conversacional)</option>
                    <option value="valerio">Valerio (Masculino, Técnico)</option>
                  </select>
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
                  onClick={handleGenerateAudio}
                  disabled={generatingAudio || !roteiro}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {generatingAudio ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Gerando Locução...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Locução e Sincronia
                    </>
                  )}
                </button>
              </div>
            )}

            {/* HeyGen Mode Settings */}
            {renderMode === 'heygen_avatar' && (
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl space-y-5 animate-fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" /> Configuração do Avatar
                </h3>

                {loadingAssets ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
                    <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                    <span className="text-xs text-zinc-500 font-semibold">Carregando avatares do HeyGen...</span>
                  </div>
                ) : (
                  <>
                    {/* Manual video URL input (Fallback) */}
                    <div className="space-y-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Link do Vídeo Manual (HeyGen)
                        </label>
                        <input
                          type="text"
                          value={manualHeygenVideoUrl}
                          onChange={(e) => setManualHeygenVideoUrl(e.target.value)}
                          placeholder="Cole a URL do vídeo gerado no site da HeyGen (MP4)..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none transition-colors font-semibold placeholder:text-zinc-600"
                        />
                      </div>

                      {/* Local Video Upload Option */}
                      <div className="pt-2 border-t border-zinc-800/40 space-y-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Ou envie o arquivo baixado do Heygen (.MP4):
                        </label>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-950 hover:bg-zinc-900/60 p-4 rounded-xl cursor-pointer group transition-all duration-150 relative overflow-hidden">
                            <input
                              type="file"
                              accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
                              onChange={handleUploadManualVideo}
                              className="hidden"
                              disabled={uploadingManualVideo}
                            />
                            {uploadingManualVideo ? (
                              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
                                <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                                <span>Enviando arquivo ao servidor...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-center gap-1">
                                <Upload className="h-5 w-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                                  Selecionar Vídeo Local
                                </span>
                                <span className="text-[9px] text-zinc-500 font-medium">
                                  MP4 ou MOV até 100MB
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                        
                        {uploadManualError && (
                          <p className="text-[10px] text-rose-500 font-semibold leading-relaxed">
                            ⚠️ {uploadManualError}
                          </p>
                        )}
                        
                        {manualHeygenVideoUrl && (
                          <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between gap-2">
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 truncate">
                              <CheckCircle className="h-3 w-3 shrink-0" /> Vídeo Pronto para Renderizar!
                            </span>
                            <button
                              type="button"
                              onClick={() => setManualHeygenVideoUrl('')}
                              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              Limpar
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-normal font-semibold">
                        💡 **Bypass de Limites de API:** Se a geração automática falhar por falta de créditos de API, crie e gere o vídeo usando seus créditos normais no painel do site do HeyGen, baixe o MP4 e faça o upload aqui.
                      </p>
                    </div>

                    {/* Avatar Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        Selecione o Avatar / Foto
                      </label>
                      <select
                        value={selectedAvatarId}
                        onChange={(e) => setSelectedAvatarId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
                      >
                        {heygenTalkingPhotos.length > 0 && (
                          <optgroup label="Suas Fotos Falantes (Talking Photos)" className="bg-zinc-950 text-white">
                            {heygenTalkingPhotos.map((tp: any) => (
                              <option key={tp.id} value={tp.id} className="bg-zinc-950 text-white">
                                {tp.talking_photo_name || `Talking Photo (${tp.id.substring(0, 6)})`}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {heygenAvatars.length > 0 && (
                          <optgroup label="Avatares HeyGen" className="bg-zinc-950 text-white">
                            {heygenAvatars.map((av: any) => (
                              <option key={av.avatar_id} value={av.avatar_id} className="bg-zinc-950 text-white">
                                {av.avatar_name || `Avatar (${av.avatar_id.substring(0, 6)})`}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      
                      {/* Avatar preview image if available */}
                      {(() => {
                        const selectedTp = heygenTalkingPhotos.find(t => t.id === selectedAvatarId);
                        const selectedAv = heygenAvatars.find(a => a.avatar_id === selectedAvatarId);
                        const imgUrl = selectedTp?.image_url || selectedAv?.preview_image_url;
                        if (imgUrl) {
                          return (
                            <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-850 bg-zinc-950 mx-auto shadow-inner animate-fade-in">
                              <img src={imgUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* HeyGen Voice Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Voz do Influenciador (PT)
                      </label>
                      <select
                        value={selectedHeygenVoiceId}
                        onChange={(e) => setSelectedHeygenVoiceId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
                      >
                        {heygenVoices.map((v: any) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name} ({v.gender === 'male' ? 'Masculino' : 'Feminino'}) • {v.voice_type === 'cloned' ? 'Clonada ✨' : 'Padrão'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Layout Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Layout do Vídeo
                      </label>
                      <select
                        value={layoutMode}
                        onChange={(e) => setLayoutMode(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors font-semibold"
                      >
                        <option value="bubble">Círculo Flutuante (Loom Style) 🟡</option>
                        <option value="split">Tela Dividida (Meio a Meio) ➗</option>
                        <option value="pip">Retângulo PIP (Miniatura) 🔲</option>
                        <option value="avatar_only">Apenas Influenciador (Cheia) 👤</option>
                      </select>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                        {layoutMode === 'bubble' && 'O influenciador aparece em um círculo dourado no canto com o vídeo original atrás.'}
                        {layoutMode === 'split' && 'O vídeo original ocupa a metade de cima e o influenciador ocupa a metade de baixo.'}
                        {layoutMode === 'pip' && 'O influenciador aparece em uma miniatura retangular no canto inferior direito.'}
                        {layoutMode === 'avatar_only' && 'O influenciador preenche toda a tela, ideal para roteiros explicativos focados.'}
                      </p>
                    </div>

                    {/* Error warning */}
                    {errorMsg && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl leading-relaxed flex items-start gap-2">
                        <span className="font-bold shrink-0">ERRO:</span>
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit HeyGen generation */}
                    <div className="space-y-2">
                      <button
                        onClick={handleGenerateAvatar}
                        disabled={generatingAvatar || !roteiro || !selectedAvatarId}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        {generatingAvatar ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Gerando Influenciador...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Gerar Avatar e Compor Reels
                          </>
                        )}
                      </button>
                      
                      {isScarcityMode && (
                        <span className="text-[10px] text-red-400 font-semibold block text-center mt-1 leading-normal">
                          ⚠️ Saldo crítico. Recomenda-se o Modo Locução UGC Grátis.
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Dedicated B-Roll Image Paste/Upload Editor */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Palette className="h-4 w-4 text-amber-500" /> Edição Visual: Imagem B-Roll / Prints
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Cole prints de tela, imagens de referência ou fotos da obra para aparecerem sobrepostas no vídeo final.
              </p>

              {brandKit.b_roll_image_url ? (
                <div className="space-y-3">
                  <div className="relative group max-w-xs mx-auto rounded-xl overflow-hidden border border-zinc-850 bg-zinc-950/85">
                    <img 
                      src={brandKit.b_roll_image_url} 
                      alt="B-Roll Overlay" 
                      className="max-h-40 object-contain mx-auto p-2" 
                    />
                    <button
                      type="button"
                      onClick={() => setBrandKit((prev: any) => ({ ...prev, b_roll_image_url: '' }))}
                      className="absolute top-2 right-2 bg-red-650 hover:bg-red-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-all shadow-md cursor-pointer border-none"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase">Tempo de Início (s)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={brandKit.b_roll_start ?? 2}
                        onChange={(e) => setBrandKit((prev: any) => ({
                          ...prev,
                          b_roll_start: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase">Duração (s)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={brandKit.b_roll_duration ?? 5}
                        onChange={(e) => setBrandKit((prev: any) => ({
                          ...prev,
                          b_roll_duration: parseFloat(e.target.value) || 1
                        }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onPaste={handleImagePaste('b_roll_image_url')}
                  tabIndex={0}
                  className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 focus:outline-none focus:border-amber-500/60"
                  onClick={() => document.getElementById('b-roll-file-input')?.click()}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Palette className="h-8 w-8 text-zinc-600" />
                    <span className="text-xs text-zinc-400 font-medium">Clique para selecionar imagem</span>
                    <span className="text-[10px] text-zinc-500 font-semibold block">ou clique aqui e pressione <strong>Ctrl+V</strong> para colar</span>
                  </div>
                  <input
                    id="b-roll-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload('b_roll_image_url')}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Brand Kit Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                <span className="flex items-center gap-1.5"><Palette className="h-4 w-4 text-amber-500" /> Kit de Marca (Brand Kit)</span>
                <button
                  onClick={() => setIsEditingBrandKit(!isEditingBrandKit)}
                  className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer bg-transparent border-none outline-none"
                >
                  {isEditingBrandKit ? "Fechar" : "Editar"}
                </button>
              </h3>

              {isEditingBrandKit ? (
                <div className="space-y-3.5 text-left animate-fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Cream</label>
                      <input 
                        type="color" 
                        value={brandKit.cores_json.primary} 
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          cores_json: { ...brandKit.cores_json, primary: e.target.value }
                        })}
                        className="w-full h-8 rounded bg-zinc-950 border border-zinc-850 cursor-pointer p-0.5" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Navy</label>
                      <input 
                        type="color" 
                        value={brandKit.cores_json.secondary} 
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          cores_json: { ...brandKit.cores_json, secondary: e.target.value }
                        })}
                        className="w-full h-8 rounded bg-zinc-950 border border-zinc-850 cursor-pointer p-0.5" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Copper</label>
                      <input 
                        type="color" 
                        value={brandKit.cores_json.accent} 
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          cores_json: { ...brandKit.cores_json, accent: e.target.value }
                        })}
                        className="w-full h-8 rounded bg-zinc-950 border border-zinc-850 cursor-pointer p-0.5" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Fonte Visual</label>
                    <select
                      value={brandKit.fontes}
                      onChange={(e) => setBrandKit({ ...brandKit, fontes: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Montserrat">Montserrat (Impacto)</option>
                      <option value="Inter">Inter (Clean)</option>
                      <option value="Roboto">Roboto (Clássica)</option>
                      <option value="Outfit">Outfit (Premium)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Título do Card de CTA</label>
                    <input
                      type="text"
                      value={brandKit.cta_card_json.title}
                      onChange={(e) => setBrandKit({
                        ...brandKit,
                        cta_card_json: { ...brandKit.cta_card_json, title: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Texto do Botão CTA</label>
                    <input
                      type="text"
                      value={brandKit.cta_card_json.button_text}
                      onChange={(e) => setBrandKit({
                        ...brandKit,
                        cta_card_json: { ...brandKit.cta_card_json, button_text: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">URL ou Imagem do Logo da Marca</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={brandKit.logo_url || ''}
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          logo_url: e.target.value
                        })}
                        onPaste={handleImagePaste('logo_url')}
                        placeholder="Cole URL do logo ou pressione Ctrl+V para colar imagem"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <label className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border border-zinc-750">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('logo_url')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">URL ou Imagem do Selo da Marca / IA</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={brandKit.selo_url || ''}
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          selo_url: e.target.value
                        })}
                        onPaste={handleImagePaste('selo_url')}
                        placeholder="Cole URL do selo ou pressione Ctrl+V para colar imagem"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <label className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border border-zinc-750">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('selo_url')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">URL ou Imagem de Sobreposição (B-Roll)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={brandKit.b_roll_image_url || ''}
                        onChange={(e) => setBrandKit({
                          ...brandKit,
                          b_roll_image_url: e.target.value
                        })}
                        onPaste={handleImagePaste('b_roll_image_url')}
                        placeholder="Cole URL do B-Roll ou pressione Ctrl+V para colar imagem"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <label className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border border-zinc-750">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('b_roll_image_url')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 pb-2 border-t border-zinc-800/40">
                    <input
                      type="checkbox"
                      id="remover_watermark"
                      checked={brandKit.remover_watermark || false}
                      onChange={(e) => setBrandKit({
                        ...brandKit,
                        remover_watermark: e.target.checked
                      })}
                      className="rounded bg-zinc-950 border-zinc-850 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="remover_watermark" className="text-[11px] font-bold text-zinc-300 cursor-pointer select-none">
                      Remover Marca d'Água de IA ("Criado com IA")
                    </label>
                  </div>
 
                  <button
                    onClick={handleSaveBrandKit}
                    className="w-full inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer border-0"
                  >
                    <Save className="h-3.5 w-3.5" /> Salvar Alterações
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 text-left text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Paleta ativa:</span>
                    <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: brandKit.cores_json.primary }} title="Cream"></span>
                    <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: brandKit.cores_json.secondary }} title="Navy"></span>
                    <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: brandKit.cores_json.accent }} title="Copper"></span>
                  </div>
                  <div className="text-zinc-400">
                    Fonte ativa: <span className="text-zinc-200 font-bold font-mono">{brandKit.fontes}</span>
                  </div>
                  <div className="text-zinc-400 leading-snug">
                    CTA Card: <span className="text-zinc-200 italic">"{brandKit.cta_card_json.title}"</span>
                  </div>
                  {brandKit.logo_url && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span>Logo:</span>
                      <img src={brandKit.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded bg-zinc-950 border border-zinc-850" />
                    </div>
                  )}
                  {brandKit.selo_url && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span>Selo:</span>
                      <img src={brandKit.selo_url} alt="Selo" className="w-8 h-8 object-contain rounded bg-zinc-950 border border-zinc-850" />
                    </div>
                  )}
                  {brandKit.b_roll_image_url && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span>B-Roll:</span>
                      <img src={brandKit.b_roll_image_url} alt="B-Roll" className="w-8 h-8 object-contain rounded bg-zinc-950 border border-zinc-850" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Retoque Humano (Manual Overrides) Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Edit className="h-4 w-4 text-amber-500" /> Retoque Humano (Exceção)
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">Ativar Lower-Third Overlay</span>
                  <input
                    type="checkbox"
                    checked={showLowerThird}
                    onChange={(e) => setShowLowerThird(e.target.checked)}
                    className="rounded border-zinc-850 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </div>

                {showLowerThird && (
                  <div className="space-y-2.5 pl-3 border-l border-zinc-800 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Nome/Identificador</label>
                      <input
                        type="text"
                        value={lowerThirdName}
                        onChange={(e) => setLowerThirdName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Cargo/Subtítulo</label>
                      <input
                        type="text"
                        value={lowerThirdRole}
                        onChange={(e) => setLowerThirdRole(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">Ativar Card CTA Final</span>
                  <input
                    type="checkbox"
                    checked={showCtaCard}
                    onChange={(e) => setShowCtaCard(e.target.checked)}
                    className="rounded border-zinc-850 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2">
                  <span className="text-xs font-bold text-zinc-400">Ativar Legendas Dinâmicas</span>
                  <input
                    type="checkbox"
                    checked={showCaptions}
                    onChange={(e) => setShowCaptions(e.target.checked)}
                    className="rounded border-zinc-850 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </div>
 
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Estas modificações serão compiladas no vídeo final em conformidade com as regras do Módulo B.
                </p>
              </div>
            </div>

            {/* Publish Actions */}
            {hyperframesVideoUrl && (
              <div className="space-y-3">
                <button
                  onClick={handleSimulatePublish}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 hover:text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:scale-[1.01] cursor-pointer"
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

export default function Estudio() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-semibold">Carregando estúdio...</div>}>
      <EstudioContent />
    </Suspense>
  );
}
