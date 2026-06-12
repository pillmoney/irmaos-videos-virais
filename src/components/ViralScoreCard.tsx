'use client';

import React from 'react';
import {
  Zap,
  Eye,
  Crosshair,
  Shield,
  Music,
  TrendingUp,
  Type,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ScoreAxis {
  name: string;
  weight: number;
  score: number;
  icon: React.ElementType;
}

interface ViralScoreCardProps {
  scoreTotal: number;
  axes: {
    hook_strength: number;
    retention: number;
    cta_clarity: number;
    originality: number;
    audio_visual_sync: number;
    trend_adherence: number;
    caption_readability: number;
  };
  compact?: boolean;
}

const AXES_CONFIG: { key: string; name: string; weight: number; icon: React.ElementType }[] = [
  { key: 'hook_strength', name: 'Força do Gancho', weight: 25, icon: Zap },
  { key: 'retention', name: 'Retenção Prevista', weight: 20, icon: Eye },
  { key: 'cta_clarity', name: 'Clareza do CTA', weight: 15, icon: Crosshair },
  { key: 'originality', name: 'Originalidade', weight: 15, icon: Shield },
  { key: 'audio_visual_sync', name: 'Sincronia Áudio-Visual', weight: 10, icon: Music },
  { key: 'trend_adherence', name: 'Aderência à Tendência', weight: 10, icon: TrendingUp },
  { key: 'caption_readability', name: 'Legibilidade Legendas', weight: 5, icon: Type },
];

function getScoreColor(score: number): string {
  if (score >= 95) return 'text-emerald-400';
  if (score >= 80) return 'text-amber-400';
  return 'text-rose-400';
}

function getBarColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getBarGlow(score: number): string {
  if (score >= 90) return 'shadow-[0_0_8px_rgba(16,185,129,0.3)]';
  if (score >= 75) return 'shadow-[0_0_8px_rgba(245,158,11,0.3)]';
  return 'shadow-[0_0_8px_rgba(244,63,94,0.3)]';
}

export default function ViralScoreCard({ scoreTotal, axes, compact = false }: ViralScoreCardProps) {
  const isApproved = scoreTotal >= 95;

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} rounded-2xl bg-zinc-900/60 border border-zinc-800/80`}>
      {/* Score Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isApproved ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            {isApproved ? (
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-400" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Viral Score</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${getScoreColor(scoreTotal)}`}>
                {scoreTotal}
              </span>
              <span className="text-zinc-500 text-sm font-medium">/ 100</span>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isApproved
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {isApproved ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" />
              Aprovado (≥95)
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              Revisão Humana
            </>
          )}
        </span>
      </div>

      {/* Score Axes */}
      <div className="space-y-3">
        {AXES_CONFIG.map((axis) => {
          const score = (axes as any)[axis.key] ?? 0;
          const Icon = axis.icon;
          const weighted = Math.round((score / 100) * axis.weight);

          return (
            <div key={axis.key} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {axis.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    ({weighted}/{axis.weight})
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(score)} ${getBarGlow(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gate Status */}
      <div className={`mt-5 p-3 rounded-xl border ${
        isApproved 
          ? 'bg-emerald-500/5 border-emerald-500/10' 
          : 'bg-amber-500/5 border-amber-500/10'
      }`}>
        <p className={`text-xs font-medium ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isApproved
            ? '✓ Score acima do gate (≥95) — variação aprovada automaticamente como Pendente.'
            : '⚠ Score abaixo do gate (<95) — variação entrará como Revisão Humana.'}
        </p>
      </div>
    </div>
  );
}

export { AXES_CONFIG };
export type { ViralScoreCardProps };
