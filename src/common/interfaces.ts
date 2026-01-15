export interface Copyable<T> {
  copy(): T;
}

export interface Describable {
  readonly description: string;
}

export interface GroupMember {
  readonly groupId: string;
}

export interface Identifiable {
  readonly id: number;
}

let nextId = 1;

export function generateId(): number {
  return nextId++;
}

export function resetIdGenerator(): void {
  nextId = 1;
}
