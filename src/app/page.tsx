'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/supabase';
import { 
  Plus, 
  Video, 
  FileText, 
  Tv, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Trash2,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';

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


interface Projeto {
  id: string;
  nome: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const fetchProjetos = async () => {
    try {
      setLoading(true);
      const data = await db.projetos.list();
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await db.projetos.delete(id);
        fetchProjetos();
      } catch (error) {
        console.error('Erro ao deletar projeto:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'publicado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3.5 w-3.5" /> Publicado
          </span>
        );
      case 'aguardando_aprovacao':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" /> Revisão Humana
          </span>
        );
      case 'falhou':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5" /> Falhou
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <Clock className="h-3.5 w-3.5" /> Pendente
          </span>
        );
    }
  };

  const filteredProjetos = projetos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: projetos.length,
    revisao: projetos.filter(p => p.status === 'aguardando_aprovacao').length,
    publicados: projetos.filter(p => p.status === 'publicado').length,
    pendentes: projetos.filter(p => p.status === 'pendente').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="h-4 w-4" /> Painel de Controle
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Irmãos Vídeos Virais</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Gere reels de react automatizados com avatar de IA para o perfil <span className="text-amber-500 font-semibold">@irmaosnaobra__</span>
          </p>
        </div>

        <Link
          href="/novo-projeto"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-200 shadow-[0_4px_20px_rgba(245,158,11,0.25)] border border-amber-400/20 hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          Novo Projeto Viral
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projetos</span>
            <div className="p-2 bg-zinc-950 rounded-lg text-zinc-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{stats.total}</span>
          </div>
        </div>

        {/* Em Revisão */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Revisão Humana</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{stats.revisao}</span>
          </div>
        </div>

        {/* Publicados */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Publicados</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Instagram className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{stats.publicados}</span>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Pendentes</span>
            <div className="p-2 bg-zinc-950 rounded-lg text-zinc-500">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{stats.pendentes}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/20 border border-zinc-800/60 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {['todos', 'pendente', 'aguardando_aprovacao', 'publicado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                statusFilter === status
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-900/60 hover:bg-zinc-900 hover:text-zinc-200 text-zinc-400'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'aguardando_aprovacao' ? 'Revisão' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500 font-semibold">Carregando projetos...</span>
        </div>
      ) : filteredProjetos.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-3xl">
          <div className="inline-flex p-4 bg-zinc-900/60 rounded-full text-zinc-500 mb-4">
            <Video className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum projeto encontrado</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'todos'
              ? 'Tente ajustar seus termos de busca ou filtros de status.'
              : 'Adicione seu primeiro link de vídeo para começar a criar react com avatar.'}
          </p>
          {!searchTerm && statusFilter === 'todos' && (
            <Link
              href="/novo-projeto"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-500 hover:text-amber-400 border border-zinc-800 rounded-xl text-sm font-semibold transition-colors"
            >
              Criar Projeto
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjetos.map((projeto) => (
            <div
              key={projeto.id}
              className="bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700/60 p-6 rounded-2xl flex flex-col justify-between gap-6 hover:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(projeto.status)}
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {new Date(projeto.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors duration-150 leading-snug">
                    {projeto.nome}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 mt-2">
                <button
                  onClick={(e) => handleDelete(projeto.id, e)}
                  className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Excluir Projeto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex gap-2">
                  {projeto.status === 'pendente' && (
                    <Link
                      href={`/novo-projeto?id=${projeto.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-bold border border-zinc-800 transition-colors"
                    >
                      Processar Vídeo <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {projeto.status === 'aguardando_aprovacao' && (
                    <Link
                      href={`/roteiro?id=${projeto.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/10"
                    >
                      Revisar Roteiro <FileText className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {projeto.status === 'concluido' && (
                    <Link
                      href={`/estudio?id=${projeto.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Ver Estúdio <Tv className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {projeto.status === 'publicado' && (
                    <Link
                      href={`/estudio?id=${projeto.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-xs transition-colors"
                    >
                      Ver Publicação <Instagram className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
