import { EventEmitter } from 'events'

type AppEventsMap = {
  totalUpdated: (total: number) => void
}

type EventKey<T> = Extract<keyof T, string>
type ParamsOf<F> = F extends (...args: infer A) => unknown ? A : never
type ListenerOf<F> = F extends (...args: infer A) => unknown ? (...args: A) => void : never

class TypedEventEmitter<Events extends Record<string, unknown>> {
  private emitter = new EventEmitter()

  on<EventName extends EventKey<Events>>(
    event: EventName,
    listener: ListenerOf<Events[EventName]>
  ): this {
    // Node's EventEmitter expects a generic listener: (...args: any[]) => void.
    // This cast is safe because we only ever call it with ParamsOf<Events[EventName]>.
    this.emitter.on(event, listener as (...args: unknown[]) => void)
    return this
  }

  once<EventName extends EventKey<Events>>(
    event: EventName,
    listener: ListenerOf<Events[EventName]>
  ): this {
    this.emitter.once(event, listener as (...args: unknown[]) => void)
    return this
  }

  off<EventName extends EventKey<Events>>(
    event: EventName,
    listener: ListenerOf<Events[EventName]>
  ): this {
    this.emitter.off(event, listener as (...args: unknown[]) => void)
    return this
  }

  emit<EventName extends EventKey<Events>>(
    event: EventName,
    ...args: ParamsOf<Events[EventName]>
  ): boolean {
    return this.emitter.emit(event, ...args)
  }
}

export const appEvents = new TypedEventEmitter<AppEventsMap>()
