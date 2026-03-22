import djs from 'discord.js';
const { Client, GatewayIntentBits, Collection } = djs;
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { SpotifyExtractor, SoundCloudExtractor, AttachmentExtractor } from '@discord-player/extractor';
import { loadEvents } from './handlers/eventHandler.js';
import { loadCommands } from './handlers/commandHandler.js';
import { validateEnv } from './utils/security.js';
import { sendNowPlayingCard } from './utils/embeds.js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();
validateEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function init() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
    ],
    sweepers: {
      messages: { interval: 300, lifetime: 600 },
      users: { interval: 3600, filter: () => u => u.bot && u.id !== client.user?.id },
    },
  });

  client.commands = new Collection();
  client.cooldowns = new Collection();
  client.nowPlayingMessages = new Map();
  client.voteSkips = new Map();

  const player = new Player(client, {
    skipFFmpeg: false,
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    },
  });

  // ── Cookies ───────────────────────────────────────────────────────────
  let cookieString = '';
  const cookiePath = join(__dirname, '..', 'cookies.txt');
  if (existsSync(cookiePath)) {
    try {
      const raw = readFileSync(cookiePath, 'utf-8');
      const cookies = raw.split(/\r?\n/)
        .filter(l => l.trim() && !l.startsWith('#'))
        .map(l => {
          const p = l.trim().split(/\s+/);
          return p.length >= 7 ? `${p[5]}=${p[6]}` : null;
        }).filter(Boolean);
      cookieString = cookies.join('; ');
      console.log(`[COOKIES] Loaded ${cookies.length} cookies`);
    } catch (e) {
      console.warn('[COOKIES] Parse error:', e.message);
    }
  }

  // ── Extractors ────────────────────────────────────────────────────────
  await player.extractors.register(YoutubeiExtractor, {
    cookie: cookieString || undefined,
    streamOptions: {
      useClient: 'IOS',
      highWaterMark: 1 << 25,
    },
    slicePlaylist: false, // Don't slice playlists - get all tracks
    innertubeConfigRaw: {
      lang: 'en',
      location: 'US',
    },
  });
  await player.extractors.register(SpotifyExtractor, {});
  await player.extractors.register(SoundCloudExtractor, {});
  await player.extractors.register(AttachmentExtractor, {});
  console.log('[PLAYER] All extractors registered');

  // ── Player Events ─────────────────────────────────────────────────────
  player.events.on('playerStart', async (queue, track) => {
    console.log(`[PLAY] Now playing: ${track.title}`);
    try {
      await sendNowPlayingCard(queue, track, client);
    } catch (e) {
      console.error('[NP CARD]', e.message);
    }
  });

  player.events.on('audioTrackAdd', (queue, track) => {
    console.log(`[QUEUE] Track added: ${track.title} (Queue size: ${queue.tracks.size + 1})`);
  });

  player.events.on('playerError', (queue, error) => {
    console.error('[PLAYER ERR]', error);
  });

  player.events.on('error', (queue, error) => {
    console.error('[GENERAL ERR]', error);
  });

  player.events.on('disconnect', (queue) => {
    client.nowPlayingMessages.delete(queue.guild.id);
    client.voteSkips.delete(queue.guild.id);
  });

  player.events.on('emptyQueue', (queue) => {
    client.nowPlayingMessages.delete(queue.guild.id);
    client.voteSkips.delete(queue.guild.id);
  });

  player.events.on('emptyChannel', (queue) => {
    client.nowPlayingMessages.delete(queue.guild.id);
  });

  // ── Boot ──────────────────────────────────────────────────────────────
  await loadCommands(client);
  loadEvents(client);
  await client.login(process.env.DISCORD_TOKEN);
}

init().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
