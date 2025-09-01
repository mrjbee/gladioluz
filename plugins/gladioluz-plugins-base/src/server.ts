// server.ts
import bodyParser from "body-parser";
import express from "express";
import { CommandHandler } from "./command";
import { ProblemDetails } from "./problem";
import crypto from "crypto";

function makeAuth(token?: string) {
  if (!token) return (_req: any, _res: any, next: any) => next(); // backward-compatible
  const expected = Buffer.from(token, "utf8");
  return (req: any, res: any, next: any) => {
    const auth = req.header("authorization") || "";
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    const providedStr = m?.[1] || "";
    const provided = Buffer.from(providedStr, "utf8");

    // timing-safe compare; also match lengths to avoid leaks
    const ok =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!ok) {
      const problem = new ProblemDetails(
        401,
        "Missing or invalid bearer token",
        req.path || "/",
        "https://gladioluz.io/problems/invalid-token",
        "Unauthorized"
      );
      res.setHeader('WWW-Authenticate', 'Bearer realm="gladioluz-plugin"');
      return res.status(problem.status).json(problem.toJSON());
    }
    next();
  };
}

export function startPluginServer(
  commands: Record<string, CommandHandler>,
  pluginName: string,
  pluginVersion: string
) {
  const PORT = parseInt(
    process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || "",
    10
  );
  const HOST =
    process.argv.find((arg) => arg.startsWith("--host="))?.split("=")[1] || "127.0.0.1";

  // optional token (CLI has priority; env as fallback)
  const TOKEN =
    process.argv.find((arg) => arg.startsWith("--token="))?.split("=")[1] ||
    process.env.PLUGIN_TOKEN;

  if (!PORT) {
    console.error("Missing --port parameter");
    process.exit(1);
  }

  const app = express();
  app.use(bodyParser.json());

  const requireAuth = makeAuth(TOKEN);

  app.post("/command", requireAuth, async (req, res) => {
    const { command, args = {} } = req.body;
    const handler = commands[command];

    if (!handler) {
      const problem = new ProblemDetails(
        400,
        `Unknown command '${command}'`,
        "/command",
        "https://gladioluz.io/problems/unknown-command",
        "Unknown Command"
      );
      return res.status(problem.status).json(problem.toJSON());
    }

    let responded = false;
    const timer = setTimeout(() => {
      if (!responded) {
        responded = true;
        res.status(500).json({
          type: "about:blank",
          title: "Timeout",
          status: 500,
          detail: "Command execution timeout",
          instance: "/command",
        });
      }
    }, 5000);

    try {
      const result = await handler.run({ args });
      if (!responded) {
        responded = true;
        clearTimeout(timer);
        res.json(result);
      }
    } catch (err) {
      if (!responded) {
        responded = true;
        clearTimeout(timer);
        const problem =
          err instanceof ProblemDetails
            ? err
            : new ProblemDetails(500, (err as Error).message || "Internal error", "/command");
        res.status(problem.status).json(problem.toJSON());
      }
    }
  });

  process.on("unhandledRejection", (reason) => {
    console.error("UnhandledRejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  app.listen(PORT, HOST, () => {
    console.log(`${pluginName} v${pluginVersion} running on http://${HOST}:${PORT}`);
    if (TOKEN) console.log("🔒 Auth: Bearer token required");
  });
}