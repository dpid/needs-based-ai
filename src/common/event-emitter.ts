export type EventListener<T> = (data: T) => void;

export interface EventEmitter<T> {
  addListener(listener: EventListener<T>): void;
  removeListener(listener: EventListener<T>): void;
  emit(data: T): void;
  clear(): void;
}

export class EventEmitterImpl<T> implements EventEmitter<T> {
  private listeners: Set<EventListener<T>> = new Set();

  addListener(listener: EventListener<T>): void {
    this.listeners.add(listener);
  }

  removeListener(listener: EventListener<T>): void {
    this.listeners.delete(listener);
  }

  emit(data: T): void {
    const listeners = Array.from(this.listeners);
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }

  static create<T>(): EventEmitter<T> {
    return new EventEmitterImpl<T>();
  }
}
