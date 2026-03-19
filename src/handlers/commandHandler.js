import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commandsPath = join(__dirname, '..', 'commands');
  const categories = readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const { default: command } = await import(`../commands/${category}/${file}`);
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[CMD] Loaded: ${command.data.name}`);
      }
    }
  }

  console.log(`[Kaizen-JAM] ${client.commands.size} commands loaded.`);
}