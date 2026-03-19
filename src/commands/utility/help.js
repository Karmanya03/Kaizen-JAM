import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),
    cooldown: 5,
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle('\uD83D\uDCD6 Kaizen-JAM Help')
            .setDescription('A high-performance Discord music bot')
            .addFields(
                {
                    name: '\uD83C\uDFB5 Music',
                    value: [
                        '`/play` - Play a song or playlist',
                        '`/skip` - Skip current track (vote-skip)',
                        '`/stop` - Stop and clear queue',
                        '`/queue` - View the queue',
                        '`/nowplaying` - Show now-playing card',
                        '`/join` - Join your voice channel',
                        '`/leave` - Leave voice channel',
                    ].join('\n'),
                },
                {
                    name: '\uD83D\uDEE0 Utility',
                    value: [
                        '`/ping` - Check latency',
                        '`/avatar` - View user avatar',
                        '`/serverinfo` - Server information',
                        '`/help` - This menu',
                    ].join('\n'),
                },
                {
                    name: '\uD83D\uDD12 Moderation',
                    value: [
                        '`/ban` - Ban a user',
                        '`/kick` - Kick a user',
                        '`/purge` - Bulk delete messages',
                    ].join('\n'),
                },
                {
                    name: '\uD83C\uDFB6 Now Playing Controls',
                    value: 'Use the buttons on the now-playing card to pause, skip, loop, shuffle, adjust volume, and view queue.',
                },
            )
            .setFooter({ text: 'Kaizen-JAM Music Bot' })
            .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};