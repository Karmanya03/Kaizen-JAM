import djs from 'discord.js';
const { SlashCommandBuilder } = djs;
import { useQueue } from 'discord-player';
import { queueEmbed } from '../../utils/embeds.js';
import { queuePaginationRow } from '../../utils/buttons.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the music queue'),
    cooldown: 3,
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue?.currentTrack) return interaction.reply({ content: '\u274C Nothing is playing.', ephemeral: true });

        const tracks = queue.tracks.toArray();
        const totalPages = Math.ceil(tracks.length / 10) || 1;
        const slice = tracks.slice(0, 10);
        const embed = queueEmbed(slice, 0, totalPages, queue.currentTrack);
        const row = queuePaginationRow(0, totalPages);
        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};