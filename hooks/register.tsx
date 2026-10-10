import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Uso } from '../types'

// El caché del prompt dura una hora desde el último mensaje.
const DURA_MIN = 60
const AVISO_MIN = 5

const uso = atom({ plugin: 'guardian-cache', key: 'uso' } as const, null)
const ultimo = atom({ plugin: 'guardian-cache', key: 'ultimo' } as const, 0)
const ahora = atom({ plugin: 'guardian-cache', key: 'ahora' } as const, 0)
const traspaso = atom({ plugin: 'guardian-cache', key: 'traspaso' } as const, null)
const esperando = atom({ plugin: 'guardian-cache', key: 'esperando' } as const, false)

const miles = (n: number): string => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))

export const register: Register = on => {
  let yaAvise = false

  on('session.start', async ($, e, next) => {
    const t = await $.clock.now()
    await update($, ahora, () => t)

    $.clock.every(30_000, () => {
      void (async () => {
        const ya = await $.clock.now()
        await update($, ahora, () => ya)
        const desde = await read($, ultimo)

        if (desde === 0) {
          return
        }

        const quedan = DURA_MIN - (ya - desde) / 60_000

        if (quedan <= AVISO_MIN && quedan > 0 && !yaAvise) {
          yaAvise = true
          $.ui.toast(`Al caché le quedan ${Math.ceil(quedan)} min. Envía un mensaje o haz el traspaso.`, {
            timeoutMs: 15_000,
          })
        }
      })()
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const ventana = (kind: string): number | null =>
      e.rateLimits.find(limite => limite.kind === kind)?.percentUsed ?? null
    const nuevo: Uso = {
      tokens: e.context.tokens ?? 0,
      ventana: e.context.window,
      porcentaje: e.context.percent ?? 0,
      cincoHoras: ventana('five_hour'),
      semana: ventana('seven_day'),
      usd: e.cost?.usd ?? null,
    }
    await update($, uso, () => nuevo)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const t = await $.clock.now()
      yaAvise = false
      await update($, ultimo, () => t)
      await update($, ahora, () => t)

      if (await read($, esperando)) {
        await update($, esperando, () => false)
        await update($, traspaso, () => (e.answer.trim() === '' ? null : e.answer))
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const datos = await read($, uso)
    const desde = await read($, ultimo)
    const ya = await read($, ahora)
    const resumen = await read($, traspaso)
    const abajo = await next(e)

    if (e.props.hasSurvey || datos === null) {
      return abajo
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const quedan = desde === 0 ? DURA_MIN : Math.max(0, Math.ceil(DURA_MIN - (ya - desde) / 60_000))
    const estado = quedan === 0 ? 'red' : quedan <= AVISO_MIN ? 'yellow' : 'green'
    const partes = [
      `Contexto ${miles(datos.tokens)} (${datos.porcentaje}%)`,
      datos.cincoHoras === null ? null : `5 h ${datos.cincoHoras}%`,
      datos.semana === null ? null : `Semana ${datos.semana}%`,
      datos.usd === null ? null : `Por API US$ ${datos.usd.toFixed(2)}`,
    ].filter(parte => parte !== null)

    const mio = (
      <Box flexDirection="row" gap={2} flexWrap="wrap">
        <Text color={estado} bold>
          {quedan === 0 ? 'Caché vencido' : `Caché ${quedan} min`}
        </Text>
        <Text dimColor>{partes.join(' · ')}</Text>
        {quedan <= AVISO_MIN && (
          <Text color={estado}>
            {quedan === 0 ? 'Se vuelven' : 'Si vence, se vuelven'} a cobrar {miles(datos.tokens)} tokens
          </Text>
        )}
        {resumen === null ? (
          <Button
            key="traspaso"
            label="Traspaso"
            onPress={async () => {
              await update($, esperando, () => true)

              try {
                await $.command.run({ command: 'guardian-cache:session-handoff', args: '' })
              } catch {
                try {
                  await $.command.run({ command: 'session-handoff', args: '' })
                } catch {
                  await $.prompt.submit({ text: 'Haz el traspaso de esta sesión con la skill session-handoff.' })
                }
              }
            }}
          />
        ) : (
          <Button
            key="limpiar"
            label="Limpiar y seguir"
            variant="primary"
            onPress={async () => {
              const texto = resumen
              await update($, traspaso, () => null)

              try {
                await $.command.run({ command: 'clear', args: '' })
                await $.prompt.submit({ text: texto })
              } catch {
                await $.ui.copy({ text: texto, surface: e.surface })
                $.ui.toast('No se pudo limpiar automáticamente. El traspaso quedó copiado: ejecuta /clear y pégalo.')
              }
            }}
          />
        )}
      </Box>
    )

    return abajo.type === 'engine' ? (
      mio
    ) : (
      <Box flexDirection="column">
        {mio}
        {abajo}
      </Box>
    )
  })
}
