export class Config {
    private configMap: Map<string, string | number>;
  
    constructor() {
      this.configMap = new Map<string, string | number>([
        ['kiosk.executable', '/usr/bin/google-chrome-stable'],
        ['kiosk.profile.dir', `${process.env.HOME}/.config/music-kiosk-profile`],
        ['kiosk.remote.port', 9222],
        ['kiosk.polling.interval', 5000]
      ]);
    }
  
    get(key: string): string | number | undefined {
      return this.configMap.get(key);
    }
  
    set(key: string, value: string | number): void {
      this.configMap.set(key, value);
    }
  
    has(key: string): boolean {
      return this.configMap.has(key);
    }
  
    entries(): IterableIterator<[string, string | number]> {
      return this.configMap.entries();
    }
  }
  
  export const config = new Config();
  