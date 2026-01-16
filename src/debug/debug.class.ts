export class Debug {
  private static _enabled: boolean = false;

  static enable(): void {
    Debug._enabled = true;
  }

  static disable(): void {
    Debug._enabled = false;
  }

  static get isEnabled(): boolean {
    return Debug._enabled;
  }
}
