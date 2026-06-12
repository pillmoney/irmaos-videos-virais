'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Sparkles, 
  Coins, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Bell, 
  ShieldAlert, 
  UserCheck, 
  BarChart3,
  Flame,
  Info
} from 'lucide-react';

export default function GovernancaCreditos() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saldos, setSaldos] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number>(30); // Default alert threshold %
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(true);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  // Métrica-rei (cost per result) data
  const formatosPerformance = [
    { rank: 1, modulo: 'Módulo A: UGC Ads', formato: 'Reação com Bolha (Bubble)', leads: 245, custoTotal: 122.50, custoPorLead: 0.50, eficiencia: 'Excelente' },
    { rank: 2, modulo: 'Módulo C: Porta-voz', formato: 'Spokesperson Ads circular', leads: 180, custoTotal: 108.00, custoPorLead: 0.60, eficiencia: 'Boa' },
    { rank: 3, modulo: 'Módulo B: Orgânico', formato: 'Footage Real (Split screen)', leads: 320, custoTotal: 256.00, custoPorLead: 0.80, eficiencia: 'Boa' },
    { rank: 4, modulo: 'Módulo A: UGC Ads', formato: 'Avatar Completo (Avatar Only)', leads: 90, custoTotal: 135.00, custoPorLead: 1.50, eficiencia: 'Abaixo do esperado' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const saldosList = await db.ferramentas_saldo.list();
      const orcamentosList = await db.orcamentos.list();
      setSaldos(saldosList || []);
      setOrcamentos(orcamentosList || []);
      
      // Load local config for alerts
      if (typeof window !== 'undefined') {
        const threshold = window.localStorage.getItem('alert_threshold');
        if (threshold) setAlertThreshold(Number(threshold));
        
        const wa = window.localStorage.getItem('whatsapp_alerts');
        if (wa) setWhatsappAlerts(wa === 'true');
        
        const em = window.localStorage.getItem('email_alerts');
        if (em) setEmailAlerts(em === 'true');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCap = async (moduloId: string, cap: number) => {
    try {
      await db.orcamentos.update(moduloId, { cap_mensal: cap });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAlerts = () => {
    setIsSaving(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('alert_threshold', String(alertThreshold));
      window.localStorage.setItem('whatsapp_alerts', String(whatsappAlerts));
      window.localStorage.setItem('email_alerts', String(emailAlerts));
    }
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações de alerta salvas com sucesso!');
    }, 600);
  };

  // Determine if scarcity mode is triggered based on HeyGen credits
  const heygenSaldo = saldos.find(s => s.ferramenta === 'HeyGen')?.saldo || 0;
  const isScarcityMode = heygenSaldo < 10.0; // scarcity threshold is 10.0 HeyGen credits

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Back to Dashboard */}
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
            <Coins className="h-4 w-4" /> Governança & Créditos
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Núcleo Operacional & Burn Rate</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Acompanhe o saldo das ferramentas em tempo real, defina limites por canal e monitore o ROI.
          </p>
        </div>

        {isScarcityMode && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-2xl animate-pulse">
            <Flame className="h-5 w-5 text-red-400" />
            <div className="text-left">
              <span className="text-xs font-black text-red-400 block uppercase tracking-wider">Estratégia de Escassez Ativa</span>
              <span className="text-[10px] text-zinc-400">HeyGen &lt; 10 créditos. Duração travada em 8s e 1 variação.</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500 font-semibold">Carregando governança...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. PAINEL DE SALDO & BURN RATE */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" /> Saldos das Ferramentas & Taxa de Queima
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {saldos.map((saldo, idx) => (
                  <div key={idx} className="bg-zinc-950/70 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold text-zinc-400">{saldo.ferramenta}</span>
                      <TrendingDown className="h-4 w-4 text-zinc-600" />
                    </div>

                    <div>
                      <span className="text-3xl font-black text-white">
                        {saldo.ferramenta === 'HeyGen' ? `${saldo.saldo.toFixed(1)}c` : `$${saldo.saldo.toFixed(2)}`}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase mt-1">Saldo Atual</span>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500 font-medium">Burn rate/dia:</span>
                        <span className="text-zinc-300 font-bold">
                          {saldo.ferramenta === 'HeyGen' ? `${saldo.burn_rate_dia} c/dia` : `$${saldo.burn_rate_dia}/dia`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500 font-medium">Projeção:</span>
                        <span className="text-amber-500 font-bold">
                          {new Date(saldo.data_esgotamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CAPS DE ORÇAMENTO POR MÓDULO */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-amber-500" /> Limites & Caps de Orçamento Mensal
              </h3>

              <div className="space-y-5">
                {orcamentos.map((orc, idx) => {
                  const percent = Math.min(100, (orc.gasto_mes / orc.cap_mensal) * 100);
                  const isOverThreshold = percent >= 80;
                  return (
                    <div key={idx} className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">
                            {orc.modulo_id === 'A' ? 'Módulo A: UGC Ads (Pago)' : orc.modulo_id === 'B' ? 'Módulo B: Orgânico @irmaosnaobra' : 'Módulo C: Porta-voz (Pago)'}
                          </h4>
                          <span className="text-[10px] text-zinc-500">Mapeamento e controle de verba por campanha</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-zinc-500 font-bold">Gasto:</span>
                            <span className="text-sm font-black text-white ml-1.5">${orc.gasto_mes} / ${orc.cap_mensal}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOverThreshold ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-amber-500 to-amber-300'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>{percent.toFixed(0)}% do orçamento consumido</span>
                          {isOverThreshold && <span className="text-red-400 font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Limite crítico atingido!</span>}
                        </div>
                      </div>

                      {/* Slider to adjust cap */}
                      <div className="flex items-center gap-4 pt-2">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">Ajustar Teto:</label>
                        <input
                          type="range"
                          min="100"
                          max="1500"
                          step="50"
                          value={orc.cap_mensal}
                          onChange={(e) => handleUpdateCap(orc.modulo_id, Number(e.target.value))}
                          className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. MÉTRICA-REI: CUSTO POR RESULTADO */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" /> Métrica-Rei: Custo Por Lead e Conversão
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Mapeamento automático de cliques e leads integrados via WhatsApp e CRM para definir a eficiência de cada criativo.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Módulo</th>
                      <th className="py-3.5 px-4">Layout de Edição</th>
                      <th className="py-3.5 px-4 text-center">Leads Gerados</th>
                      <th className="py-3.5 px-4 text-center">Custo por Lead</th>
                      <th className="py-3.5 px-4 text-center">Eficiência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatosPerformance.map((f, idx) => (
                      <tr key={idx} className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-amber-500">#{f.rank}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{f.modulo}</td>
                        <td className="py-3.5 px-4 text-zinc-300">{f.formato}</td>
                        <td className="py-3.5 px-4 text-center text-zinc-300 font-semibold">{f.leads}</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">${f.custoPorLead.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            f.eficiencia === 'Excelente' ? 'bg-emerald-500/20 text-emerald-400' :
                            f.eficiencia === 'Boa' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {f.eficiencia}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar Columns */}
          <div className="space-y-6">
            
            {/* 4. CONFIGURAÇÃO DE ALERTAS */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-amber-500" /> Configuração de Alertas
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1">
                  Configure quando receber notificações de saldos baixos nas ferramentas.
                </p>
              </div>

              <div className="space-y-4">
                {/* Threshold Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span>Threshold de Alerta</span>
                    <span className="text-amber-500">{alertThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Saldos baixos (crítico)</span>
                    <span>Moderação</span>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={whatsappAlerts}
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      className="rounded border-zinc-800 text-amber-500 focus:ring-amber-500 bg-zinc-950 h-4 w-4"
                    />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">Alertas via WhatsApp (Z-API)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded border-zinc-800 text-amber-500 focus:ring-amber-500 bg-zinc-950 h-4 w-4"
                    />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">Alertas via E-mail corporativo</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAlerts}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </div>

            {/* 5. ESTRATÉGIA DE ESCASSEZ */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" /> Estratégia de Escassez
              </h3>
              
              <div className="text-xs text-zinc-400 space-y-3.5 leading-relaxed">
                <p>
                  Quando o saldo de créditos da conta HeyGen fica abaixo do threshold configurado (ex: &lt; 10 créditos), a plataforma entra automaticamente em **Modo Escassez**.
                </p>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                    <Info className="h-3.5 w-3.5 shrink-0" /> Restrições Ativas no Modo Escassez:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-500 text-[10px]">
                    <li>Força roteiros de no máximo 8 segundos.</li>
                    <li>Gera apenas 1 opção de cena (desativa múltiplas).</li>
                    <li>Reutiliza avatares locais sem novas chamadas pagas.</li>
                  </ul>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-zinc-400">Status do Sistema:</span>
                  {isScarcityMode ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">ATITUDES LIMITADAS</span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SALDO SEGURO</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
