import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;
import { useQueue } from 'discord-player';
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel'),
    async execute(interaction, client) {
        const queue = useQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '\u274C Not in a voice channel.', ephemeral: true });

        const vcName = queue.channel?.name || 'voice channel';
        queue.delete();
        client.nowPlayingMessages.delete(interaction.guildId);
        client.voteSkips.delete(interaction.guildId);

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: 'Kaizen-JAM', iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle('\uD83D\uDC4B Disconnected')
            .setDescription(`Left **${vcName}**\nQueue cleared. See you next time!`)
            .setFooter({ text: `Requested by ${interaction.user.username} \u2022 Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    },
};