import djs from 'discord.js';
const { SlashCommandBuilder } = djs;
import { useQueue } from 'discord-player';
import { config } from '../../config.js';
import { voteSkipRow } from '../../utils/buttons.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track (vote-skip if multiple listeners)'),
    cooldown: 2,
    async execute(interaction, client) {
        const queue = useQueue(interaction.guildId);
        if (!queue?.isPlaying()) return interaction.reply({ content: '\u274C Nothing is playing.', ephemeral: true });

        const vc = interaction.member?.voice?.channel;
        if (!vc) return interaction.reply({ content: '\u274C Join a voice channel first.', ephemeral: true });

        const members = vc.members.filter(m => !m.user.bot).size;

        // Solo listener = instant skip
        if (members <= 1) {
            queue.node.skip();
            return interaction.reply({ content: '\u23ED Skipped!' });
        }

        // Vote skip
        const votes = new Set([interaction.user.id]);
        client.voteSkips.set(interaction.guildId, votes);
        const needed = Math.ceil(members * config.voteSkipPercent);

        if (votes.size >= needed) {
            client.voteSkips.delete(interaction.guildId);
            queue.node.skip();
            return interaction.reply({ content: '\u23ED Skipped!' });
        }

        const row = voteSkipRow(votes.size, needed);
        return interaction.reply({ content: `Vote to skip: **${votes.size}/${needed}**`, components: [row] });
    },
};