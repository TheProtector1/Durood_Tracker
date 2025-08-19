import { prisma } from '@/lib/prisma'
import { appEvents } from '@/lib/events'

export async function GET() {
  const encoder = new TextEncoder()

  // Keep handles in the same closure so start/cancel can share them
  let keepAlive: ReturnType<typeof setInterval> | undefined
  let onUpdate: (() => Promise<void>) | undefined

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const sendCurrentTotal = async () => {
        const result = await prisma.duroodEntry.aggregate({ _sum: { count: true } })
        send({ total: result._sum.count ?? 0 })
      }

      await sendCurrentTotal()

      onUpdate = async () => {
        await sendCurrentTotal()
      }
      appEvents.on('totalUpdated', onUpdate)

      // SSE retry + keep-alive comments
      controller.enqueue(encoder.encode(`retry: 2000\n\n`))
      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`))
      }, 15_000)
    },

    cancel() {
      if (keepAlive !== undefined) clearInterval(keepAlive)
      if (onUpdate) appEvents.off('totalUpdated', onUpdate)
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
