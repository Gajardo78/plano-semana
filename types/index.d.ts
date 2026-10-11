export type Limite = { percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'plano-semana': { limite: Limite | null; tique: number }
  }
}
