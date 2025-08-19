import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appEvents } from '@/lib/events'

export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const sendCurrentTotal = async () => {
        const result = await prisma.duroodEntry.aggregate({ _sum: { count: true } })
        send({ total: result._sum.count || 0 })
      }

      await sendCurrentTotal()

      const onUpdate = async () => {
        await sendCurrentTotal()
      }

      appEvents.on('totalUpdated', onUpdate)

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`))
      }, 15000)

      controller.enqueue(encoder.encode(`retry: 2000\n`))

      controller.closed.finally(() => {
        clearInterval(keepAlive)
        appEvents.off('totalUpdated', onUpdate)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}


