import { test, expect } from 'claude-code/testing'

import { CELULAS, DIAS, calcularRitmo, montarBarra, textoReinicio } from './barra'

const DIA = 24 * 60 * 60 * 1000
const reinicio = '2026-10-14T12:00:00.000Z'
const inicio = Date.parse(reinicio) - 7 * DIA

test('no fim do dia 1, o esperado é 20% e 18% está dentro', () => {
  const r = calcularRitmo(18, reinicio, inicio + DIA)
  expect(r.esperado).toBe(20)
  expect(r.dentro).toBe(true)
  expect(r.folga).toBe(2)
})

test('25% no fim do dia 1 está acima (amarelo) por 5 pontos', () => {
  const r = calcularRitmo(25, reinicio, inicio + DIA)
  expect(r.dentro).toBe(false)
  expect(r.folga).toBe(-5)
})

test('o esperado avança continuamente: meio dia = 10%', () => {
  expect(calcularRitmo(0, reinicio, inicio + DIA / 2).esperado).toBe(10)
})

test('depois de 5 dias o esperado fica em 100%', () => {
  expect(calcularRitmo(90, reinicio, inicio + 6 * DIA).esperado).toBe(100)
  expect(calcularRitmo(90, reinicio, inicio + 6 * DIA).dentro).toBe(true)
})

test('sem horário de reinício não há comparação e a cor é a de "dentro"', () => {
  const r = calcularRitmo(40, undefined, 0)
  expect(r.esperado).toBeNull()
  expect(r.dentro).toBe(true)
})

test('a barra tem 5 partes de 8 células e a marca fica onde o esperado está', () => {
  const trechos = montarBarra(0, 50)
  const texto = trechos.map(t => t.texto).join('')
  expect(texto.replace(/ /g, '').length).toBe(DIAS * CELULAS)
  expect(texto.split(' ').length).toBe(DIAS)
  expect(texto.indexOf('┃')).toBeGreaterThan(-1)
})

test('o preenchimento é contínuo: 30% = 1 parte cheia e meia', () => {
  const texto = montarBarra(30, null).map(t => t.texto).join('')
  const partes = texto.split(' ')
  expect(partes[0]).toBe('█'.repeat(CELULAS))
  expect(partes[1].startsWith('████')).toBe(true)
  expect(partes[2]).toBe('░'.repeat(CELULAS))
})

test('texto de reinício', () => {
  expect(textoReinicio(reinicio, inicio)).toBe('reinicia em 7d 0h')
  expect(textoReinicio(reinicio, Date.parse(reinicio) - 5 * 60 * 60 * 1000)).toBe('reinicia em 5h')
  expect(textoReinicio(undefined, 0)).toBe('')
})
