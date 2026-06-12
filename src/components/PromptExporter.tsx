'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface PromptExporterProps {
  isOpen: boolean;
  onClose: () => void;
  variation: {
    idx: number;
    script: string;
    caption: string;
    storyboard_json: any;
  } | null;
  analysis: {
    product_json: any;
    scenario_json: any;
    framing_type: string;
    hook_json: any;
    body_json: any;
    cta_json: any;
  } | null;
}

type TargetModel = 'veo3' | 'seedance' | 'kling';

const MODEL_INFO: Record<TargetModel, { name: string; badge: string; color: string }> = {
  veo3: { name: 'Veo 3', badge: 'Google', color: 'text-blue-400' },
  seedance: { name: 'Seedance', badge: 'ByteDance', color: 'text-purple-400' },
  kling: { name: 'Kling', badge: 'Kuaishou', color: 'text-pink-400' },
};

function generatePrompt(
  model: TargetModel,
  variation: PromptExporterProps['variation'],
  analysis: PromptExporterProps['analysis']
): string {
  if (!variation || !analysis) return '';

  const characterAnchor = analysis.product_json?.character_anchor 
    || 'mulher, ~25 anos, cabelo na altura do ombro, pele clara, expressão natural e confiante';
  
  const product = analysis.product_json?.name || 'o produto em destaque';
  const scenario = analysis.scenario_json?.description || 'ambiente com luz natural suave';
  const hookText = analysis.hook_json?.text || '[frase do gancho]';
  const ctaText = analysis.cta_json?.text || '[CTA falado — ex.: Link na bio!]';
  const bodyAction = analysis.body_json?.action || 'mostrando detalhes do produto de diferentes ângulos';

  const negativeGlobal = 'sem texto na tela, sem mãos deformadas, sem distorção de tecido, sem trocar de pessoa entre cenas';

  if (model === 'veo3') {
    return `[GLOBAL]
Aspect ratio: 9:16 | Duração por cena: 8s | Estilo: UGC realista, luz natural
Âncora de personagem (repetir igual em TODAS as cenas):
"${characterAnchor}"
Negative (todas as cenas): ${negativeGlobal}

CENA 1 — GANCHO (8s)
[Âncora de personagem] de pé em ${scenario}, olhando pra câmera e segurando
${product} em destaque. Uma ação: ergue o produto mostrando o caimento/detalhe.
Câmera: fixa, leve push-in. Produto com textura real, detalhes nítidos.
Áudio: fala curta de abertura "${hookText}", lip-sync natural.
(Overlay em pós: texto do gancho)
Negative: ${negativeGlobal}

CENA 2 — CORPO (8s)
[Âncora de personagem] ${bodyAction}.
Uma ação: movimento contínuo mostrando o produto. Câmera: pan lento acompanhando.
Foco na textura e nos detalhes.
Áudio: "[benefício/qualidade do produto]".
Negative: ${negativeGlobal}

CENA 3 — CORPO/PROVA (8s)
[Âncora de personagem] mostrando um detalhe específico (zoom no acabamento/estampa/funcionalidade).
Uma ação: aproxima o produto da câmera.
Câmera: close-up estável.
Negative reforçado: ${negativeGlobal}, sem distorção de proporções

CENA 4 — CTA (8s)
[Âncora de personagem] sorrindo, apontando pra baixo (gesto de "link/sacola").
Uma ação: gesto de CTA.
Câmera: fixa. Áudio: "${ctaText}", lip-sync natural.
(Overlay em pós: CTA + selo de loja)
Negative: ${negativeGlobal}

---
Variação #${(variation.idx || 0) + 1}
Se houver variantes de cor, duplicar Cena 2 por cor mantendo a mesma âncora de personagem.`;
  }

  if (model === 'seedance') {
    return `# Seedance Prompt — Variação #${(variation.idx || 0) + 1}
# Formato: 9:16 vertical | ~8s por clipe

## Personagem (manter consistente):
${characterAnchor}

## Clipe 1 — Gancho
Descrição: Pessoa de pé em ${scenario}, olhando direto para a câmera, segurando ${product}.
Movimento: leve push-in
Estilo: UGC realista, luz natural difusa
Negative: ${negativeGlobal}

## Clipe 2 — Demonstração
Descrição: Mesma pessoa ${bodyAction}.
Movimento: pan lateral lento
Estilo: foco nos detalhes do produto, textura real
Negative: ${negativeGlobal}

## Clipe 3 — Close-up
Descrição: Mesma pessoa mostrando detalhe do produto em close.
Movimento: câmera estável, zoom suave
Negative: ${negativeGlobal}, sem distorção

## Clipe 4 — CTA
Descrição: Mesma pessoa sorrindo, gesto de "compre agora" apontando para baixo.
Movimento: câmera fixa
Negative: ${negativeGlobal}

> Áudio e texto overlay são adicionados em pós-produção.`;
  }

  // Kling
  return `# Kling AI Prompt — Variação #${(variation.idx || 0) + 1}
# Aspect: 9:16 | Duration: ~8s per scene

## Character Reference (SAME in every scene):
${characterAnchor}

## Scene 1 (Hook - 8s):
"${characterAnchor}" standing in ${scenario}, holding ${product}, looking at camera with confident smile. Camera: slow push-in. Natural lighting, UGC style.
Negative: ${negativeGlobal}

## Scene 2 (Body - 8s):
"${characterAnchor}" ${bodyAction}. Camera: slow pan following the action. Focus on product texture and details.
Negative: ${negativeGlobal}

## Scene 3 (Proof - 8s):
"${characterAnchor}" showing close-up detail of the product. Camera: stable close-up shot. Sharp details.
Negative: ${negativeGlobal}, no proportion distortion

## Scene 4 (CTA - 8s):
"${characterAnchor}" smiling, pointing downward (shopping gesture). Camera: fixed. Clean background.
Negative: ${negativeGlobal}

> Audio, text overlays, and captions added in post-production.`;
}

export default function PromptExporter({ isOpen, onClose, variation, analysis }: PromptExporterProps) {
  const [selectedModel, setSelectedModel] = useState<TargetModel>('veo3');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prompt = generatePrompt(selectedModel, variation, analysis);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Exportar Prompt</h3>
              <p className="text-xs text-zinc-500">
                Variação #{(variation?.idx || 0) + 1} — prompt pronto para colar na IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Model Selector */}
        <div className="flex gap-2 p-4 border-b border-zinc-800/40">
          {(Object.keys(MODEL_INFO) as TargetModel[]).map((model) => {
            const info = MODEL_INFO[model];
            const isActive = selectedModel === model;
            return (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-400 border border-amber-500/20'
                    : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {info.name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 ${info.color}`}>
                  {info.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prompt Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800/40 p-5">
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {prompt}
            </pre>
          </div>

          {/* Anti-bug Rules Reminder */}
          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400/80 font-medium">
              ℹ Regras anti-bug aplicadas: âncora de personagem idêntica em todas as cenas, 
              1 ação por cena, sem texto-na-tela (overlay em pós), negative prompt por cena, 
              câmera explícita. Formato 9:16 vertical, ~8s/cena.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-800/60 bg-zinc-900/80">
          <p className="text-xs text-zinc-500">
            Prompt gerado para <span className={`font-bold ${MODEL_INFO[selectedModel].color}`}>{MODEL_INFO[selectedModel].name}</span>
          </p>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { generatePrompt };
export type { TargetModel };
