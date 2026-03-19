import djs from 'discord.js';
const { REST, Routes } = djs;
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const commands = [];
const commandsPath = join(__dirname, 'commands');

for (const category of readdirSync(commandsPath)) {
    const categoryPath = join(commandsPath, category);
    for (const file of readdirSync(categoryPath).filter(f => f.endsWith('.js'))) {
        const { default: command } = await import(`./commands/${category}/${file}`);
        if (command?.data) commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log(`Deploying ${commands.length} commands...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Commands deployed globally!');
} catch (err) {
    console.error('Deploy error:', err);
}