import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limite } from '../types'
import { DIAS, calcularRitmo, montarBarra, textoReinicio } from './barra'

const limite = atom({ plugin: 'plano-semana', key: 'limite' } as const, null)
const tique = atom({ plugin: 'plano-semana', key: 'tique' } as const, 0)

const AZUL = 'blue'
const AMARELO = 'yellow'

const daSemana = (limites: { kind: string; percentUsed: number; resetsAt?: string }[]): Limite | null => {
  const sete = limites.find(l => l.kind === 'seven_day')
  return sete ? { percentUsed: sete.percentUsed, resetsAt: sete.resetsAt } : null
}

export const register: Register = on => {
  // Começa (e a cada recarga do mod) lendo o que a sessão já sabe e marcando 1 tique por minuto,
  // para a marca de "esperado" andar mesmo com você parado.
  on('session.start', async ($, e, next) => {
    const uso = await $.session.usage()
    const sete = daSemana(uso.rateLimits)
    if (sete) await update($, limite, () => sete)
    $.clock.every(60_000, async () => {
      const agora = await $.clock.now()
      await update($, tique, () => agora)
    })

    return next(e)
  })

  // O motor avisa quando uma janela anda um ponto inteiro e depois de cada turno.
  on('session.measure', async ($, e, next) => {
    const sete = daSemana(e.rateLimits)
    if (sete) await update($, limite, () => sete)

    return next(e)
  })

  // A barra fica SEMPRE no lugar: sem dados ainda, aparece vazia com "aguardando dados".
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    await read($, tique) // assina o tique: o desenho é refeito a cada minuto
    const guardado = await read($, limite)
    const uso = await $.session.usage()
    const atual = daSemana(uso.rateLimits) ?? guardado
    const agora = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)

    if (atual === null) {
      return (
        <Box>
          {montarBarra(0, null).map((t, i) => (
            <Text key={i} dimColor>
              {t.texto}
            </Text>
          ))}
          <Text dimColor> semana: aguardando dados do plano · {DIAS} dias</Text>
        </Box>
      )
    }

    const ritmo = calcularRitmo(atual.percentUsed, atual.resetsAt, agora)
    const cor = ritmo.dentro ? AZUL : AMARELO
    const resumo =
      ritmo.esperado === null
        ? `semana ${ritmo.usado}%`
        : ritmo.dentro
          ? `semana ${ritmo.usado}% · dentro do ritmo (${ritmo.esperado}% esperado)`
          : `semana ${ritmo.usado}% · ${Math.abs(ritmo.folga ?? 0)} pts acima do ritmo (${ritmo.esperado}% esperado)`
    const reinicio = textoReinicio(atual.resetsAt, agora)

    return (
      <Box>
        {montarBarra(ritmo.usado, ritmo.esperado).map((t, i) => (
          <Text
            key={i}
            color={t.tipo === 'cheio' ? cor : undefined}
            dimColor={t.tipo === 'vazio' || t.tipo === 'sep'}
            bold={t.tipo === 'marca'}
          >
            {t.texto}
          </Text>
        ))}
        <Text color={cor}> {resumo}</Text>
        {reinicio ? <Text dimColor> · {reinicio}</Text> : null}
        <Text dimColor> · {DIAS} dias</Text>
      </Box>
    )
  })
}
