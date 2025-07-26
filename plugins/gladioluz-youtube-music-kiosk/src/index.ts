import { CommandHandler } from "./commons/command";
import { startPluginServer } from "./commons/server";
import { kioskStartCommand, kioskStopCommand, loadRadioForCommand, nextCommand, playCommand, prevCommand } from "./youtube-kisosk-commands";

const commands: Record<string, CommandHandler> = {
  play: playCommand,
  next: nextCommand,
  prev: prevCommand,
  'kiosk-start': kioskStartCommand,
  'kiosk-stop': kioskStopCommand,
  'load-radio': loadRadioForCommand,
};


startPluginServer(commands);