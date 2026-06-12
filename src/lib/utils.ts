import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return '/api/backend';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

export function getProxiedUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (url.includes('/static/downloads/')) {
        const parts = url.split('/static/downloads/');
        return `http://localhost:5000/static/downloads/${parts[1]}`;
      }
    }
  }
  if (url.includes('/static/downloads/')) {
    const parts = url.split('/static/downloads/');
    return `/static/downloads/${parts[1]}`;
  }
  return url;
}

export async function safeFetch(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errMessage = `Erro no servidor (${res.status})`;
    try {
      const errData = await res.json();
      errMessage = errData.error || errMessage;
    } catch {
      try {
        const text = await res.text();
        errMessage = text.substring(0, 150) || res.statusText;
      } catch {
        errMessage = res.statusText || errMessage;
      }
    }
    throw new Error(errMessage);
  }
  
  try {
    return await res.json();
  } catch (err: any) {
    throw new Error(`Resposta do servidor não pôde ser analisada como JSON: ${err.message}`);
  }
}


