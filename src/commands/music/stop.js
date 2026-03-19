import djs from 'discord.js';
const { SlashCommandBuilder } = djs;
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and clear the queue'),
    cooldown: 3,
    async execute(interaction, client) {
        const queue = useQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '\u274C Nothing is playing.', ephemeral: true });
        queue.delete();
        client.nowPlayingMessages.delete(interaction.guildId);
        client.voteSkips.delete(interaction.guildId);
        return interaction.reply({ content: '\u23F9 Stopped and cleared the queue.' });
    },
};