import djs from 'discord.js';
const { SlashCommandBuilder } = djs;
import { useQueue } from 'discord-player';
import { sendNowPlayingCard } from '../../utils/embeds.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the now-playing card'),
    cooldown: 3,
    async execute(interaction, client) {
        const queue = useQueue(interaction.guildId);
        if (!queue?.currentTrack) return interaction.reply({ content: '\u274C Nothing is playing.', ephemeral: true });

        await sendNowPlayingCard(queue, queue.currentTrack, client);
        return interaction.reply({ content: '\uD83C\uDFB6 Now playing card refreshed!', ephemeral: true });
    },
};