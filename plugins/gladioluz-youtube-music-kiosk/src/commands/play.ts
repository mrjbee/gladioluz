import { CommandHandler, CommandContext, CommandResult } from './command-handler';
import { Kiosk } from '../kiosk';

export class PlayCommand implements CommandHandler {
  async run(_ctx: CommandContext): Promise<CommandResult> {
    const kiosk = new Kiosk();
    const message = await kiosk.playPause();
    return { result: 'ok', data: { message } };
  }
}
