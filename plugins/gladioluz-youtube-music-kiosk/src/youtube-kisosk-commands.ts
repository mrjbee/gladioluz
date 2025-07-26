import { CommandHandler, CommandContext, CommandResult } from './commands/command-handler';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config';
import { Kiosk } from './kiosk';

const execAsync = promisify(exec);

export const playCommand: CommandHandler = {
  async run(): Promise<CommandResult> {
    const kiosk = new Kiosk();
    const message = await kiosk.playPause();
    return { result: 'ok', data: { message } };
  }
};

export const nextCommand: CommandHandler = {
  async run(): Promise<CommandResult> {
    const kiosk = new Kiosk();
    const message = await kiosk.nextTrack();
    return { result: 'ok', data: { message } };
  }
};

export const prevCommand: CommandHandler = {
  async run(): Promise<CommandResult> {
    const kiosk = new Kiosk();
    const message = await kiosk.prevTrack();
    return { result: 'ok', data: { message } };
  }
};

export const kioskStartCommand: CommandHandler = {
  async run(): Promise<CommandResult> {
    const kiosk = new Kiosk();
    const running = await kiosk.isRunning();
    if (running) return { result: 'ok', data: { message: '⚠️ Chrome already running' } };

    const chromePath = config.get('kiosk.executable') as string;
    const profile = config.get('kiosk.profile.dir') as string;
    const port = config.get('kiosk.remote.port') as number;

    const args = [
      '--kiosk',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-component-update',
      '--disable-background-networking',
      '--metrics-recording-only',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'https://music.youtube.com'
    ];

    spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore'
    }).unref();

    return { result: 'ok', data: { message: '✅ Chrome launched in kiosk mode' } };
  }
};

export const kioskStopCommand: CommandHandler = {
  async run(): Promise<CommandResult> {
    const profile = config.get('kiosk.profile.dir') as string;

    try {
      const { stdout } = await execAsync(`pgrep -a chrome`);
      const lines = stdout.trim().split('\n');

      const pidsToKill = lines
        .filter(line => line.includes(profile))
        .map(line => parseInt(line.split(' ')[0]))
        .filter(pid => !isNaN(pid));

      if (pidsToKill.length === 0) {
        return { result: 'ok', data: { message: '⚠️ No Chrome kiosk process found' } };
      }

      for (const pid of pidsToKill) {
        process.kill(pid, 'SIGTERM');
      }

      return { result: 'ok', data: { message: `🛑 Killed ${pidsToKill.length} Chrome process(es)` } };
    } catch (err) {
      throw new Error(`Failed to stop Chrome: ${(err as Error).message}`);
    }
  }
};
