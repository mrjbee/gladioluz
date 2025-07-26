import { CommandHandler } from './command-handler';
import { PlayCommand } from './play';

const commands: Record<string, CommandHandler> = {
  'play': new PlayCommand(),
  // остальные команды позже
};

export function getCommand(name: string): CommandHandler | undefined {
  return commands[name];
}
