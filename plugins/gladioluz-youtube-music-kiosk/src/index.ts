import express from 'express';
import { getCommand } from './commands/registry';
import { ProblemDetails } from './problem';
import bodyParser from 'body-parser';

const PORT = parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || '', 10);
if (!PORT) {
  console.error('Missing --port parameter');
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

app.post('/command', async (req, res) => {
  const { command, args = {} } = req.body;

  const handler = getCommand(command);
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
