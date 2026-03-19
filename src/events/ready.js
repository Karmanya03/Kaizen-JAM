import djs from 'discord.js';
const { Events } = djs;

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[Kaizen-JAM] Ready! Serving ${client.guilds.cache.size} guilds.`);
  },
};