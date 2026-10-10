export type Uso = { tokens: number; ventana: number; porcentaje: number; cincoHoras: number | null; semana: number | null; usd: number | null }

declare module 'claude-code' {
  interface PluginState {
    'guardian-cache': { uso: Uso | null; ultimo: number; ahora: number; traspaso: string | null; esperando: boolean }
  }
}
