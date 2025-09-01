// commands.ts
import {
  CommandContext,
  CommandHandler,
  CommandResult,
} from "@glz/plugins-base";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Optional override for binary path; fallback to common path.
const LOGINCTL_BIN = process.env.GLZ_LOGINCTL_BIN || "/usr/bin/loginctl";

// Run a command with strict failure policy.
async function runLoginctl(args: string[]): Promise<void> {
  const { stdout, stderr } = await execFileAsync(LOGINCTL_BIN, args, {
    timeout: 5000, // ms
    windowsHide: true,
    env: process.env, // inherit env
  });
  // Intentionally no swallow: any non-zero exit will throw from execFileAsync.
  if (stdout?.trim()) {
    console.log("[loginctl stdout]", stdout.trim());
  }
  if (stderr?.trim()) {
    console.log("[loginctl stderr]", stderr.trim());
  }
}

export const lockScreenCommand: CommandHandler = {
  async run(_ctx: CommandContext): Promise<CommandResult> {
    // Targets the caller's user session when run as systemd --user service.
    await runLoginctl(["lock-session", "--no-ask-password"]);
    return { result: "ok", data: {} };
  },
};

export const unlockScreenCommand: CommandHandler = {
  async run(_ctx: CommandContext): Promise<CommandResult> {
    await runLoginctl(["unlock-session", "--no-ask-password"]);
    return { result: "ok", data: {} };
  },
};
