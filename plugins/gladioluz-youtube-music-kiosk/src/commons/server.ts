import bodyParser from "body-parser";
import express from "express";
import { CommandHandler } from "./command";
import { ProblemDetails } from "./problem";

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

  if (!PORT) {
    console.error("Missing --port parameter");
    process.exit(1);
  }

  const app = express();
  app.use(bodyParser.json());

  app.post("/command", async (req, res) => {
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

  // Защита от необработанных async-исключений
  process.on("unhandled rejection", (reason) => {
    console.error("UnhandledRejection:", reason);
  });

  process.on("uncaught еxception", (err) => {
    console.error("Uncaught Exception:", err);
  });

  app.listen(PORT, HOST, () => {
    console.log(`🎧 ${pluginName} v${pluginVersion} running on http://${HOST}:${PORT}`);
  });
}
