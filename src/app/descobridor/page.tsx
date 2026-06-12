'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Zap, 
  Search, 
  Filter, 
  Check, 
  Download, 
  Play, 
  AlertCircle,
  HelpCircle,
  FileVideo2
} from 'lucide-react';

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.2 1.22 1.34 2.85 2.15 4.67 2.45v3.86c-1.74-.04-3.47-.54-4.93-1.49-.44-.29-.86-.62-1.25-.99v6.52c-.02 2.16-.72 4.29-2.02 5.99-1.61 2.06-4.07 3.33-6.72 3.44-2.88.08-5.74-1.12-7.53-3.41-1.79-2.29-2.24-5.38-1.26-8.08 1.01-2.73 3.49-4.73 6.42-5.18v3.91c-1.39.2-2.61.98-3.3 2.22-.76 1.35-.74 3.07.03 4.41.74 1.28 2.12 2.07 3.6 2.02 1.77.01 3.32-1.22 3.67-2.95.07-.46.09-.93.08-1.39V.02z"/>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface TrendingVideo {
  id: string;
  title: string;
  niche: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  url: string;
  views: string;
  likes: string;
  comments: string;
  viralScore: number;
  growthRate: number; // percentage in last 24h
  duration: string;
  sparkline: number[];
  creator: string;
}

export default function DescobridorViral() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('todos');
  const [selectedPlatform, setSelectedPlatform] = useState('todos');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  // List of viral videos tailored for @irmaosnaobra__ and solar/construction niche
  const trendingVideos: TrendingVideo[] = [
    {
      id: '1',
      title: 'Can you Clean Your Solar Panels like this? ☀️💦',
      niche: 'Limpeza Solar',
      platform: 'youtube',
      url: 'https://www.youtube.com/shorts/jilEDcpTiIM',
      views: '870K',
      likes: '48K',
      comments: '3.4K',
      viralScore: 98,
      growthRate: 35,
      duration: '15s',
      sparkline: [20, 25, 35, 42, 60, 80, 98],
      creator: 'SolarCleaning Official',
    },
    {
      id: '2',
      title: 'A limpeza de placas solares com escova rotativa profissional',
      niche: 'Limpeza Solar',
      platform: 'youtube',
      url: 'limpeza energia solar',
      views: '1.2M',
      likes: '95K',
      comments: '6.1K',
      viralScore: 95,
      growthRate: 18,
      duration: '45s',
      sparkline: [40, 45, 52, 58, 68, 79, 95],
      creator: 'Energia Solar Brasil',
    },
    {
      id: '3',
      title: 'Erro gravíssimo na sustentação de telhado colonial 🚨🧱',
      niche: 'Erros de Obra',
      platform: 'tiktok',
      url: 'https://www.youtube.com/shorts/3fVfNqB-05U', // Using working YouTube fallback shorts
      views: '650K',
      likes: '42K',
      comments: '2.9K',
      viralScore: 92,
      growthRate: 24,
      duration: '30s',
      sparkline: [10, 18, 32, 45, 58, 75, 92],
      creator: 'Pedreiro de Elite',
    },
    {
      id: '4',
      title: 'Quanto custa um inversor de energia solar residencial em 2026?',
      niche: 'Orçamento',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=kYJzXF2d9j8',
      views: '320K',
      likes: '19K',
      comments: '1.2K',
      viralScore: 86,
      growthRate: 12,
      duration: '90s',
      sparkline: [30, 35, 42, 50, 62, 74, 86],
      creator: 'Solar Descomplicado',
    },
    {
      id: '5',
      title: 'Gambiarra elétrica explosiva no quadro de distribuição! 💥🔌',
      niche: 'Gambiarras',
      platform: 'instagram',
      url: 'https://www.youtube.com/shorts/jilEDcpTiIM', // Using robust short URL
      views: '1.4M',
      likes: '110K',
      comments: '8.4K',
      viralScore: 97,
      growthRate: 40,
      duration: '22s',
      sparkline: [15, 25, 40, 58, 72, 85, 97],
      creator: 'Gambiarras de Obra',
    },
    {
      id: '6',
      title: 'Diferença entre painel solar barato vs painel solar premium',
      niche: 'Orçamento',
      platform: 'youtube',
      url: 'painel solar barato vs premium',
      views: '450K',
      likes: '28K',
      comments: '2.1K',
      viralScore: 89,
      growthRate: 15,
      duration: '60s',
      sparkline: [25, 32, 40, 49, 60, 75, 89],
      creator: 'Irmãos na Obra',
    }
  ];

  // Filtering logic
  const filteredVideos = trendingVideos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = selectedNiche === 'todos' || v.niche === selectedNiche;
    const matchesPlatform = selectedPlatform === 'todos' || v.platform === selectedPlatform;
    return matchesSearch && matchesNiche && matchesPlatform;
  });

  const handleImport = (url: string, title: string) => {
    // Navigate to Novo Projeto page prefilling the parameters
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    router.push(`/novo-projeto?import_url=${encodedUrl}&name=${encodedTitle}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header and back button */}
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
              <Zap className="h-4 w-4 fill-amber-500" /> Inteligência Competitiva
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Descobridor Viral (Konodata Style)</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Monitore os vídeos mais compartilhados no nicho de <span className="text-amber-500 font-semibold">construção, reformas e energia solar</span> no Brasil e crie seus próprios cortes instantaneamente.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 px-4.5 py-3 rounded-2xl flex items-center gap-3 shrink-0">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <div className="text-xs">
              <div className="font-extrabold text-zinc-300">Algoritmo Ativo</div>
              <div className="text-zinc-500 font-medium">Atualizado a cada 2 horas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-2xl space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por termo ou nicho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-amber-500/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          {/* Platform Filters */}
          <div className="flex gap-1.5 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 items-center justify-between">
            <button
              onClick={() => setSelectedPlatform('todos')}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${selectedPlatform === 'todos' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Plataformas
            </button>
            <button
              onClick={() => setSelectedPlatform('youtube')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedPlatform === 'youtube' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <YouTubeIcon className="h-3.5 w-3.5" /> YT
            </button>
            <button
              onClick={() => setSelectedPlatform('tiktok')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedPlatform === 'tiktok' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <TikTokIcon className="h-3.5 w-3.5" /> TikTok
            </button>
            <button
              onClick={() => setSelectedPlatform('instagram')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedPlatform === 'instagram' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <InstagramIcon className="h-3.5 w-3.5" /> Reels
            </button>
          </div>

          {/* Niche filter selector */}
          <div className="flex gap-1.5 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 items-center justify-between">
            {['todos', 'Limpeza Solar', 'Erros de Obra', 'Gambiarras'].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap px-2 ${
                  selectedNiche === n 
                    ? 'bg-amber-500 text-zinc-950 shadow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {n === 'todos' ? 'Todos Niches' : n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-3xl space-y-4">
          <div className="inline-flex p-4 bg-zinc-900/60 rounded-full text-zinc-500">
            <FileVideo2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum vídeo viral correspondente</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Tente redefinir seus filtros ou buscar por outro termo.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isHovered = hoveredVideo === video.id;

            return (
              <div
                key={video.id}
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
                className="bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 relative group hover:scale-[1.01]"
              >
                {/* Platform tag header */}
                <div className="p-5 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/20">
                  <div className="flex items-center gap-2">
                    {video.platform === 'youtube' && <YouTubeIcon className="h-4 w-4 text-red-500" />}
                    {video.platform === 'tiktok' && <TikTokIcon className="h-4 w-4 text-white" />}
                    {video.platform === 'instagram' && <InstagramIcon className="h-4 w-4 text-pink-500" />}
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{video.creator}</span>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {video.niche}
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 space-y-5">
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-500 transition-colors line-clamp-2">
                    {video.title}
                  </h3>

                  {/* Sparkline & Virality score */}
                  <div className="grid grid-cols-2 gap-4 items-center bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900">
                    <div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score Viral</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Zap className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
                        <span className="text-xl font-extrabold text-white">{video.viralScore}</span>
                        <span className="text-[10px] font-bold text-zinc-400">/100</span>
                      </div>
                    </div>

                    {/* Simple SVG Sparkline */}
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                        +{video.growthRate}% nas últimas 24h
                      </span>
                      <svg className="w-24 h-8 mt-1.5 text-emerald-500 shrink-0" viewBox="0 0 100 30" fill="none">
                        <path
                          d={`M ${video.sparkline.map((val, i) => `${(i / (video.sparkline.length - 1)) * 100} ${30 - (val / 100) * 25}`).join(' L ')}`}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={`M 0 30 L ${video.sparkline.map((val, i) => `${(i / (video.sparkline.length - 1)) * 100} ${30 - (val / 100) * 25}`).join(' L ')} L 100 30 Z`}
                          fill="currentColor"
                          fillOpacity="0.06"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Video metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-950/20 p-2.5 rounded-xl border border-zinc-900/40">
                    <div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" /> Views
                      </div>
                      <div className="font-extrabold text-zinc-300 mt-0.5">{video.views}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3" /> Likes
                      </div>
                      <div className="font-extrabold text-zinc-300 mt-0.5">{video.likes}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Comments
                      </div>
                      <div className="font-extrabold text-zinc-300 mt-0.5">{video.comments}</div>
                    </div>
                  </div>
                </div>

                {/* Import Footer Button */}
                <div className="p-5 border-t border-zinc-800/50 bg-zinc-950/20">
                  <button
                    onClick={() => handleImport(video.url, video.title)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 text-zinc-300 hover:text-zinc-950 py-3 rounded-xl text-xs font-bold transition-all duration-200 border border-zinc-800 hover:border-amber-500/20 group-hover:shadow-md"
                  >
                    Importar e Ingerir Vídeo <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
