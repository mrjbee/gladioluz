import express from 'express';
import bodyParser from 'body-parser';
import { ProblemDetails } from './problem';
import { CommandHandler } from './commands/command-handler';
import { kioskStartCommand, kioskStopCommand, nextCommand, playCommand, prevCommand } from './youtube-kisosk-commands';

const PORT = parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '', 10);
if (!PORT) {
  console.error('❌ Missing --port parameter');
  process.exit(1);
}

const commands: Record<string, CommandHandler> = {
  play: playCommand,
  next: nextCommand,
  prev: prevCommand,
  'kiosk-start': kioskStartCommand,
  'kiosk-stop': kioskStopCommand
};

const app = express();
app.use(bodyParser.json());

app.post('/command', async (req, res) => {
  const { command, args = {} } = req.body;
  const handler = commands[command];

  if (!handler) {
    const problem = new ProblemDetails(
      400,
      `Unknown command '${command}'`,
      '/command',
      'https://gladioluz.io/problems/unknown-command',
      'Unknown Command'
    );
    return res.status(problem.status).json(problem.toJSON());
  }

  try {
    const result = await handler.run({ args });
    res.json(result);
  } catch (err) {
    const problem = err instanceof ProblemDetails
      ? err
      : new ProblemDetails(500, (err as Error).message, '/command');
    res.status(problem.status).json(problem.toJSON());
  }
});

app.listen(PORT, () => {
  console.log(`🎧 YouTube Music Kiosk plugin running on port ${PORT}`);
});
