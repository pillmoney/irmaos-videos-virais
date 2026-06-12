'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Tv, 
  Settings, 
  Cpu,
  CheckCircle2, 
  AlertTriangle,
  HardHat,
  Sun,
  TrendingUp
} from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const [config, setConfig] = useState({ has_anthropic_key: false, has_heygen_key: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConfig() {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/config-status`);
        if (res.ok) {
          const data = await res.ok ? await res.json() : null;
          if (data) {
            setConfig(data);
          }
        }
      } catch (err) {
        console.error('Erro ao conectar com API Flask:', err);
      } finally {
        setLoading(false);
      }
    }
    checkConfig();
  }, []);

  const menuItems = [
    { name: 'Painel Geral', href: '/', icon: LayoutDashboard },
    { name: 'Novo Projeto', href: '/novo-projeto', icon: Video },
    { name: 'Roteirizador', href: '/roteiro', icon: FileText },
    { name: 'Estúdio UGC', href: '/estudio', icon: Tv },
    { name: 'Agente Estrategista', href: '/estrategista', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full text-zinc-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/60 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <HardHat className="h-6 w-6 text-zinc-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">Irmãos na Obra</h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block mt-1">Vídeos Virais</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-500 border-l-2 border-amber-500 pl-3.5'
                  : 'hover:bg-zinc-900/60 hover:text-zinc-100 text-zinc-400'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-amber-500' : 'text-zinc-500 group-hover:text-zinc-300'
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* API Integrations Status Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Cpu className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Serviços Integrados</span>
        </div>

        <div className="space-y-2 text-xs px-2">
          {/* Anthropic Status */}
          <div className="flex items-center justify-between py-1 border-b border-zinc-900">
            <span className="text-zinc-500">Claude AI (Anthropic)</span>
            {loading ? (
              <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse"></span>
            ) : config.has_anthropic_key ? (
              <div className="flex items-center gap-1 text-emerald-500 font-semibold text-[10px]">
                <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                Ativo
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose-500 font-semibold text-[10px]">
                <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
                Inativo
              </div>
            )}
          </div>

          {/* HeyGen Status */}
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">HeyGen Avatar</span>
            {loading ? (
              <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse"></span>
            ) : config.has_heygen_key ? (
              <div className="flex items-center gap-1 text-emerald-500 font-semibold text-[10px]">
                <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                Ativo
              </div>
            ) : (
              <div className="flex items-center gap-1 text-rose-500 font-semibold text-[10px]">
                <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
                Inativo
              </div>
            )}
          </div>
        </div>

        {/* Solar Branding Tag */}
        <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span className="text-[10px] text-zinc-500 font-medium">Nicho Obra e Solar</span>
        </div>
      </div>
    </aside>
  );
}
