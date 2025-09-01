import { CommandHandler, startPluginServer } from "@glz/plugins-base";
import { lockScreenCommand, unlockScreenCommand } from "./commands";

const commands: Record<string, CommandHandler> = {
  lock: lockScreenCommand,
  unlock: unlockScreenCommand,
};

startPluginServer(commands, "gladioluz-loginctl", "1.0.0");
