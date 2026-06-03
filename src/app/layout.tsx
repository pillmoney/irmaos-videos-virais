import type { Metadata } from 'next';
import { Outfit, Geist } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Irmãos Vídeos Virais | Reels React Obra & Solar',
  description: 'Plataforma interna para criação de vídeos de React com Avatar de IA para o nicho de Obra e Energia Solar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("dark", "h-full", outfit.variable, "font-sans", geist.variable)}>
      <body className="min-h-full bg-[#09090b] text-zinc-100 font-sans flex antialiased">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950">
          {children}
        </main>
      </body>
    </html>
  );
}
