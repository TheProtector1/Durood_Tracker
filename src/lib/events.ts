import { EventEmitter } from 'events'

type AppEventsMap = {
  totalUpdated: (total: number) => void
}

class TypedEventEmitter<Events> {
  private emitter = new EventEmitter()

  on<EventName extends keyof Events & string>(event: EventName, listener: Events[EventName] extends (...args: any[]) => void ? Events[EventName] : never) {
    this.emitter.on(event, listener as any)
    return this
  }

  off<EventName extends keyof Events & string>(event: EventName, listener: Events[EventName] extends (...args: any[]) => void ? Events[EventName] : never) {
    this.emitter.off(event, listener as any)
    return this
  }

  emit<EventName extends keyof Events & string>(event: EventName, ...args: Parameters<Events[EventName] extends (...args: any[]) => void ? Events[EventName] : never>) {
    this.emitter.emit(event, ...args)
  }
}

export const appEvents = new TypedEventEmitter<AppEventsMap>()


