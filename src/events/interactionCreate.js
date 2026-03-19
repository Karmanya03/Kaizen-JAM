import { useQueue } from 'discord-player';
import { buildNowPlayingEmbed, updateNowPlayingVolume, queueEmbed } from '../utils/embeds.js';
import { nowPlayingRow, nowPlayingRow2, queuePaginationRow, voteSkipRow } from '../utils/buttons.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ── Slash commands ────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const cooldowns = client.cooldowns;
      if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Map());
      const timestamps = cooldowns.get(command.data.name);
      const cooldownMs = (command.cooldown ?? 3) * 1000;
      if (timestamps.has(interaction.user.id)) {
        const expiry = timestamps.get(interaction.user.id) + cooldownMs;
        if (Date.now() < expiry) {
          const remaining = ((expiry - Date.now()) / 1000).toFixed(1);
          return interaction.reply({ content: `⏳ Cooldown: ${remaining}s remaining.`, flags: 64 });
        }
      }
      timestamps.set(interaction.user.id, Date.now());
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);

      try {
        await command.execute(interaction, client);
      } catch (e) {
        console.error('[CMD ERR]', e);
        const msg = { content: '❌ An error occurred.', flags: 64 };
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(msg);
          } else {
            await interaction.reply(msg);
          }
        } catch {
          // Interaction expired — nothing we can do
        }
      }
      return;
    }

    // ── Autocomplete ──────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try { await command.autocomplete(interaction); } catch {}
      }
      return;
    }

    // ── Button interactions ───────────────────────────────────────────
    if (!interaction.isButton()) return;

    const { customId, guildId, member } = interaction;
    const queue = useQueue(guildId);

    // Queue pagination (handled without needing an active queue)
    if (customId.startsWith('qpage_')) {
      const parts = customId.split('_');
      const dir = parts[1]; // 'prev' or 'next'
      const page = parseInt(parts[2]);
      const newPage = dir === 'next' ? page + 1 : page - 1;

      if (!queue) return interaction.update({ content: '❌ No active queue.', components: [], embeds: [] });

      const tracks = queue.tracks.toArray();
      const totalPages = Math.max(1, Math.ceil(tracks.length / 10));
      const slice = tracks.slice(newPage * 10, newPage * 10 + 10);
      const embed = queueEmbed(slice, newPage, totalPages, queue.currentTrack);
      const row = queuePaginationRow(newPage, totalPages);
      return interaction.update({ embeds: [embed], components: [row] });
    }

    // All music controls require an active queue
    if (!queue) return interaction.reply({ content: '❌ Nothing is playing.', flags: 64 });

    // Require user to be in same voice channel
    const botChannel = queue.channel;
    const userChannel = member?.voice?.channel;
    if (!userChannel || userChannel.id !== botChannel?.id) {
      return interaction.reply({ content: '❌ Join the same voice channel first.', flags: 64 });
    }

    const npMsg = client.nowPlayingMessages.get(guildId);

    switch (customId) {
      case 'music_pause': {
        if (queue.node.isPaused()) {
          queue.node.resume();
        } else {
          queue.node.pause();
        }
        await interaction.deferUpdate();
        if (npMsg && queue.currentTrack) {
          const embed = buildNowPlayingEmbed(queue, queue.currentTrack);
          const row1 = nowPlayingRow(queue.node.isPaused(), queue.repeatMode);
          await npMsg.edit({ embeds: [embed], components: [row1, nowPlayingRow2()] }).catch(() => {});
        }
        break;
      }

      case 'music_skip': {
        queue.node.skip();
        await interaction.deferUpdate();
        break;
      }

      case 'music_prev': {
        if (queue.history.tracks.toArray().length > 0) {
          await queue.history.back();
        } else {
          queue.node.seek(0);
        }
        await interaction.deferUpdate();
        break;
      }

      case 'music_stop': {
        queue.delete();
        await interaction.deferUpdate();
        if (npMsg) {
          await npMsg.edit({ components: [] }).catch(() => {});
          client.nowPlayingMessages.delete(guildId);
        }
        break;
      }

      case 'music_loop': {
        // Cycle: 0 (off) → 1 (track) → 2 (queue) → 0
        const next = (queue.repeatMode + 1) % 3;
        queue.setRepeatMode(next);
        await interaction.deferUpdate();
        if (npMsg && queue.currentTrack) {
          const embed = buildNowPlayingEmbed(queue, queue.currentTrack);
          const row1 = nowPlayingRow(queue.node.isPaused(), queue.repeatMode);
          await npMsg.edit({ embeds: [embed], components: [row1, nowPlayingRow2()] }).catch(() => {});
        }
        break;
      }

      case 'music_shuffle': {
        queue.tracks.shuffle();
        await interaction.deferUpdate();
        break;
      }

      case 'music_queue': {
        const tracks = queue.tracks.toArray();
        const totalPages = Math.max(1, Math.ceil(tracks.length / 10));
        const slice = tracks.slice(0, 10);
        const embed = queueEmbed(slice, 0, totalPages, queue.currentTrack);
        const row = queuePaginationRow(0, totalPages);
        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
        break;
      }

      case 'music_voldown': {
        const newVol = Math.max(0, queue.node.volume - 10);
        queue.node.setVolume(newVol);
        await interaction.deferUpdate();
        await updateNowPlayingVolume(queue, client);
        break;
      }

      case 'music_volup': {
        const newVol = Math.min(100, queue.node.volume + 10);
        queue.node.setVolume(newVol);
        await interaction.deferUpdate();
        await updateNowPlayingVolume(queue, client);
        break;
      }

      case 'music_voteskip': {
        if (!client.voteSkips.has(guildId)) client.voteSkips.set(guildId, new Set());
        const votes = client.voteSkips.get(guildId);
        votes.add(interaction.user.id);
        const needed = Math.ceil((botChannel?.members.filter(m => !m.user.bot).size ?? 2) / 2);
        if (votes.size >= needed) {
          client.voteSkips.delete(guildId);
          queue.node.skip();
          await interaction.deferUpdate();
        } else {
          await interaction.deferUpdate();
          if (npMsg) {
            const row1 = nowPlayingRow(queue.node.isPaused(), queue.repeatMode);
            await npMsg.edit({ components: [row1, nowPlayingRow2(), voteSkipRow(votes.size, needed)] }).catch(() => {});
          }
        }
        break;
      }

      default:
        break;
    }
  },
};
