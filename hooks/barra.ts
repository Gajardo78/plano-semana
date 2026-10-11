// Cálculo puro da barra (sem engine): fácil de testar.
export const DIAS = 5            // partes da barra = dias de uso por semana (cada uma vale 100/DIAS %)
export const CELULAS = 8         // caracteres por parte
const DIA_MS = 24 * 60 * 60 * 1000
const PARCIAIS = ' ▏▎▍▌▋▊▉'     // preenchimento contínuo dentro de uma célula (0/8 .. 7/8)

export type Ritmo = {
  usado: number                  // 0..100
  esperado: number | null        // 0..100, ou null sem horário de reinício
  dentro: boolean                // true: dentro do ritmo (azul); false: acima (amarelo)
  folga: number | null           // esperado - usado (negativo = acima)
}

const arred = (n: number) => Math.round(n * 10) / 10
const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

// A janela semanal vai de (reinício - 7 dias) até o reinício. A cada dia que passa, o orçamento
// cresce 100/DIAS % (contínuo, não em degraus), até 100% depois de DIAS dias.
export function calcularRitmo(percentUsed: number, resetsAt: string | undefined, agoraMs: number): Ritmo {
  const usado = arred(limitar(percentUsed, 0, 100))
  const reinicio = resetsAt ? Date.parse(resetsAt) : NaN
  if (Number.isNaN(reinicio)) return { usado, esperado: null, dentro: true, folga: null }
  const inicio = reinicio - 7 * DIA_MS
  const dias = limitar((agoraMs - inicio) / DIA_MS, 0, 7)
  const esperado = arred(Math.min(100, (dias * 100) / DIAS))
  return { usado, esperado, dentro: usado <= esperado, folga: arred(esperado - usado) }
}

export type Trecho = { texto: string; tipo: 'cheio' | 'vazio' | 'marca' | 'sep' }

// DIAS partes de CELULAS caracteres; preenchimento contínuo (blocos parciais) e uma marca
// (┃) onde o consumo diário esperado está agora.
export function montarBarra(usado: number, esperado: number | null): Trecho[] {
  const total = DIAS * CELULAS
  const cheias = (limitar(usado, 0, 100) / 100) * total
  const marca = esperado === null ? -1 : Math.min(total - 1, Math.floor((limitar(esperado, 0, 100) / 100) * total))
  const trechos: Trecho[] = []
  const juntar = (texto: string, tipo: Trecho['tipo']) => {
    const ultimo = trechos[trechos.length - 1]
    if (ultimo && ultimo.tipo === tipo && tipo !== 'marca') ultimo.texto += texto
    else trechos.push({ texto, tipo })
  }
  for (let dia = 0; dia < DIAS; dia++) {
    if (dia > 0) juntar(' ', 'sep')
    for (let c = 0; c < CELULAS; c++) {
      const i = dia * CELULAS + c
      if (i === marca) { juntar('┃', 'marca'); continue }
      const dentro = cheias - i
      if (dentro >= 1) juntar('█', 'cheio')
      else if (dentro > 0.0625) juntar(PARCIAIS[Math.min(7, Math.floor(dentro * 8))], 'cheio')
      else juntar('░', 'vazio')
    }
  }
  return trechos
}

export function textoReinicio(resetsAt: string | undefined, agoraMs: number): string {
  const t = resetsAt ? Date.parse(resetsAt) : NaN
  if (Number.isNaN(t) || t <= agoraMs) return ''
  const horas = Math.floor((t - agoraMs) / (60 * 60 * 1000))
  return horas >= 24 ? `reinicia em ${Math.floor(horas / 24)}d ${horas % 24}h` : `reinicia em ${horas}h`
}
